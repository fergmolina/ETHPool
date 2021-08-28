
const { expect } = require("chai");


describe("ETHPool", function () {


  let EthPool;
  let ethPool;
  let team1;
  let team2;
  let user1;
  let user2;

  beforeEach(async function () {
    EthPool = await ethers.getContractFactory("ETHPool");
    [team1, team2, user1, user2] = await ethers.getSigners();

    ethPool = await EthPool.deploy();
  });

  describe("Deployment", function () {

    it("Deployer should be in Team List", async function () {

      expect(await ethPool.isTeam(team1.address)).to.equal(true);
    });

  });

  describe("Deposit", function () {

    it("User deposit amount", async function () {

      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("1") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("1"));
    });

    it("Deposit Event is emitted", async function () {

      await expect(ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("1") }))
        .to.emit(ethPool,'DepositETH')
        .withArgs(user1.address,ethers.utils.parseEther("1"));

    });

    it("Tx should reverted if no ETH is sended", async function () {

      await expect(ethPool.depositETH()).to.be.revertedWith("ETH sended must be higher than 0");

    });

    it("User1 and User2 deposit differents amounts", async function () {

      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("1") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("1"));
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("10") });
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("10"));
    });

    it("User1 and User2 Deposit Event is emitted", async function () {

      // User 1
      await expect(ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("1") }))
        .to.emit(ethPool,'DepositETH')
        .withArgs(user1.address,ethers.utils.parseEther("1"));

      // User 2
      await expect(ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("10") }))
        .to.emit(ethPool,'DepositETH')
        .withArgs(user2.address,ethers.utils.parseEther("10"));
        
    });

    it("User1 makes two deposits before team deposit awards", async function () {

      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("1") });
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("10") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("11"));

    });

  });

  describe("Reward", async function () {

    it("User1 makes a deposit with no permissions", async function () {
      await expect(ethPool.connect(user1).depositReward({ value: ethers.utils.parseEther("10") })).to.be.revertedWith("You are not a team member");

    });

    it("Team1 deposit reward with no users", async function () {
      await expect(ethPool.depositReward({ value: ethers.utils.parseEther("10") })).to.be.revertedWith("No users with deposit");
    });

    it("Team1 deposit reward with only User1's deposit", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("10") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("10"));
    });


    it("Check deposit Reward event when Team1 deposit reward with only User1's deposit", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.depositReward({ value: ethers.utils.parseEther("10") }))
        .to.emit(ethPool,'DepositReward')
        .withArgs(ethers.utils.parseEther("10"));
    });

    it("Team1 deposit reward with User1 and User2 deposit", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("200") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("50"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("150"));
    });

    it("Reward is bigger than deposit with only one User", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("200") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("200"));
    });

    it("Reward is bigger than deposit with two Users", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("500") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("125"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("375"));
    });

    it("User1 deposit, Team deposit rewards and then User2 deposit", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("200") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("200"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("0"));
    });

    it("Making two Rewards deposits with two users", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("200") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("100") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("75"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("225"));
    });

    it("Making two Rewards deposits with two users with User2's deposit in between", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("200") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.depositReward({ value: ethers.utils.parseEther("100") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("225"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("75"));
    });

  });

  describe("Withdraw - Only one user", function () {

    it("User1 can't make a withdraw with amount 0", async function () {
      await expect(ethPool.connect(user1).withdrawUser(0,0)).to.be.revertedWith("amount must be higher than 0");
    });

    it("User1 can't make a withdraw of deposit with no amount", async function () {
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");
    });

    it("User1 deposit and make a withdraw of deposit for same amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("100"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(0);
    });

    it("User1 deposit and make a withdraw of deposit for less amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("80"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("80"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("20"));
    });

    it("User1 deposit and can't make a withdraw of deposit for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");
    });

    it("User1 deposit, Teams deposit reward and make a withdraw of deposit for same amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("100"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(0);
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("50"));
      
    });

    it("User1 deposit, Teams deposit reward and make a withdraw of deposit for less amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("80"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("80"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("20"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("50"));
      
    });


    it("User1 deposit, Teams deposit reward and can't make a withdraw of deposit for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");
    });




    it("User1 can't make a withdraw of all with no amount", async function () {
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),2)).to.be.revertedWith("not enough in balance");
    });
    
    it("User1 deposit and make a withdraw of all for same amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("100"), 2);
    });

    it("User1 deposit and make a withdraw of all for less amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("80"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("80"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("20"));
    });

    it("User1 deposit and can't make a withdraw of all for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),2)).to.be.revertedWith("not enough in balance");
    });

    it("User1 deposit, Teams deposit reward and make a withdraw of deposit+reward for all the amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("150"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("150"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(0);
      expect(await ethPool.connect(user1).showReward()).to.equal(0);
      
    });

    it("User1 deposit, Teams deposit reward and make a withdraw of deposit+reward for less the amount but all the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("100"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("50"));
      expect(await ethPool.connect(user1).showReward()).to.equal(0);
      
    });

    it("User1 deposit, Teams deposit reward and make a withdraw of deposit+reward for less of the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("20"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("20"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("30"));
      
    });

    it("User1 deposit, Teams deposit reward and can't make a withdraw of deposit+reward for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),2)).to.be.revertedWith("not enough in balance");
    });





    it("User1 can't make a withdraw of rewards with no amount", async function () {
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),1)).to.be.revertedWith("not enough in balance");
    });

    it("User1 can't make a withdraw of rewards with only deposit", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),1)).to.be.revertedWith("not enough in balance");
    });
    
    it("User1 deposit, Teams deposit reward and make a withdraw of all the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("50"),1))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("50"), 1);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(0);
      
    });

    it("User1 deposit, Teams deposit reward and make a withdraw of less the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("20"),1))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("20"), 1);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("30"));
      
    });

    it("User1 deposit, Teams deposit reward and can't make a withdraw of more of the rewards available", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("50") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),1)).to.be.revertedWith("not enough in balance");
    });


  });


  describe("Withdraw - Two users", function () {

    it("Users can't make a withdraw with amount 0", async function () {
      await expect(ethPool.connect(user1).withdrawUser(0,0)).to.be.revertedWith("amount must be higher than 0");
      await expect(ethPool.connect(user2).withdrawUser(0,0)).to.be.revertedWith("amount must be higher than 0");
    });

    it("Users can't make a withdraw of deposit with no amount", async function () {
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");
    });

    it("Users deposit and make a withdraw of deposit for same amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("100"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(0);

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("300"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("300"), 0);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(0);
    });

    it("Users deposit and User1 make a withdraw of deposit for less amount and User2 make a withdraw for same amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("80"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("80"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("20"));

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("300"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("300"), 0);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(0);
    });

    it("Users deposit and make a withdraw of deposit for less amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("80"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("80"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("20"));

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("100"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("100"), 0);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("200"));
    });

    it("Users deposit and can't make a withdraw of deposit for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("400"),0)).to.be.revertedWith("not enough in balance");
    });

    it("Users deposit and only one can't make a withdraw of deposit for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("100"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("100"), 0);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("200"));
    });

    it("Users deposit, Teams deposit reward and make a withdraw of deposit for same amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("100"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(0);
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("25"));

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("300"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("300"), 0);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(0);
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("75"));
      
    });



    it("Users deposit, Teams deposit reward and make a withdraw of deposit for less amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("80"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("80"), 0);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("20"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("25"));

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("100"),0))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("100"), 0);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("200"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("75"));
      
    });


    it("Users deposit, Teams deposit reward and can't make a withdraw of deposit for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),0)).to.be.revertedWith("not enough in balance");
    });




    it("Users can't make a withdraw of all with no amount", async function () {
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),2)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("200"),2)).to.be.revertedWith("not enough in balance");
    });
    
    it("Users deposit and make a withdraw of all for same amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("100"), 2);

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("300"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("300"), 2);
    });

    it("Users deposit and make a withdraw of all for less amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("80"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("80"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("20"));

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("100"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("100"), 2);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("200"));
    });

    it("Users deposit and can't make a withdraw of all for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),2)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("400"),2)).to.be.revertedWith("not enough in balance");
    });

    it("Users deposit, Teams deposit reward and make a withdraw of deposit+reward for all the amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("125"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("125"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(0);
      expect(await ethPool.connect(user1).showReward()).to.equal(0);

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("375"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("375"), 2);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(0);
      expect(await ethPool.connect(user2).showReward()).to.equal(0);
      
    });

    it("Users deposit, Teams deposit reward and make a withdraw of deposit+reward for less the amount but all the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("25"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("25"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(0);

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("75"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("75"), 2);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user2).showReward()).to.equal(0);
      
    });

    it("Users deposit, Teams deposit reward and make a withdraw of deposit+reward for less of the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("15"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("15"), 2);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("10"));

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("50"),2))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("50"), 2);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("25"));
      
    });

    it("Users deposit, Teams deposit reward and can't make a withdraw of deposit+reward for more amount", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),2)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("400"),2)).to.be.revertedWith("not enough in balance");
    });





    it("Users can't make a withdraw of rewards with no amount", async function () {
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("200"),1)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("400"),1)).to.be.revertedWith("not enough in balance");
    });

    it("Users can't make a withdraw of rewards with only deposit", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),1)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("400"),1)).to.be.revertedWith("not enough in balance");
    });
    
    it("Users deposit, Teams deposit reward and make a withdraw of all the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });
      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("25"),1))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("25"), 1);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(0);

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("75"),1))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("75"), 1);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user2).showReward()).to.equal(0);
      
    });

    it("Users deposit, Teams deposit reward and make a withdraw of less the rewards", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });

      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("20"),1))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user1.address, ethers.utils.parseEther("20"), 1);
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("5"));

      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("70"),1))
        .to.emit(ethPool,'WithdrawUser')
        .withArgs(user2.address, ethers.utils.parseEther("70"), 1);
      expect(await ethPool.connect(user2).showDeposit()).to.equal(ethers.utils.parseEther("300"));
      expect(await ethPool.connect(user2).showReward()).to.equal(ethers.utils.parseEther("5"));
      
    });

    it("Users deposit, Teams deposit reward and can't make a withdraw of more of the rewards available", async function () {
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(user2).depositETH({ value: ethers.utils.parseEther("300") });

      await ethPool.connect(team1).depositReward({ value: ethers.utils.parseEther("100") });
      await expect(ethPool.connect(user1).withdrawUser(ethers.utils.parseEther("100"),1)).to.be.revertedWith("not enough in balance");
      await expect(ethPool.connect(user2).withdrawUser(ethers.utils.parseEther("100"),1)).to.be.revertedWith("not enough in balance");
    });


  });


  describe("Team", function () {

    it("Add user to Team List", async function () {
      await ethPool.addMemberTeam(team2.address);
      expect(await ethPool.isTeam(team2.address)).to.equal(true);
    });

    it("Trying to add team member without permissions", async function () {
      await expect(ethPool.connect(user1).addMemberTeam(team2.address)).to.be.revertedWith("You are not a team member");
    });

    it("Trying to remove team member without permissions", async function () {
      await expect(ethPool.connect(user1).addMemberTeam(team1.address)).to.be.revertedWith("You are not a team member");
    });

    it("Add user to Team List twice", async function () {
      await ethPool.addMemberTeam(team2.address);
      await ethPool.addMemberTeam(team2.address);
      expect(await ethPool.isTeam(team2.address)).to.equal(true);
    });

    it("Add user to Team List and remove it later", async function () {
      await ethPool.addMemberTeam(team2.address);
      await ethPool.connect(team1).removeMemberTeam(team2.address);
      expect(await ethPool.isTeam(team2.address)).to.equal(false);
    });

    it("Add user to Team List and remove original team member", async function () {
      await ethPool.addMemberTeam(team2.address);
      await ethPool.connect(team2).removeMemberTeam(team1.address);
      expect(await ethPool.isTeam(team1.address)).to.equal(false);
    });

    it("Reward deposited with one user by team member 2", async function () {
      await ethPool.addMemberTeam(team2.address);
      await ethPool.connect(user1).depositETH({ value: ethers.utils.parseEther("100") });
      await ethPool.connect(team2).depositReward({ value: ethers.utils.parseEther("10") });
      expect(await ethPool.connect(user1).showDeposit()).to.equal(ethers.utils.parseEther("100"));
      expect(await ethPool.connect(user1).showReward()).to.equal(ethers.utils.parseEther("10"));
    });



  });



});
