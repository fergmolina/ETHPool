require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan"); // to verify the contract
require('hardhat-deploy');
require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.ROPSTEN_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: process.env.ETHSCAN_KEY
  }
};
