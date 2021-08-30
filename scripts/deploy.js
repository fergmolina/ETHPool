require('dotenv').config()

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const ETHPool = await ethers.getContractFactory("ETHPool");
    const eTHPool = await ETHPool.deploy();
  
    console.log("ETHPool address:", eTHPool.address);
    console.log("ETHPool balance:", (await eTHPool.totalDeposit()).toString());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });