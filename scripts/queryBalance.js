require('dotenv').config()

async function main() {
    //const [deployer] = await ethers.getSigners();
    
    const ETHPool = await ethers.getContractFactory("ETHPool");
    const eTHPool = await ETHPool.attach(process.env.ROPSTEN_ADDRESS);
  
    console.log("ETHPool address:", eTHPool.address);
    console.log("ETHPool balance:", (await eTHPool.totalDeposit()).toString());
  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });


