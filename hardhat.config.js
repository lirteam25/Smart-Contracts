require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    polygon_mumbai: {
      url: process.env.ALCHEMY_RPC_MUMBAI, //process.env.ALCHEMY_URL,
      accounts: [`0x${process.env.PRIVATE_KEY_LIR_FILIPPO}`]
    },
    polygon_mainnet: {
      url: process.env.ALCHEMY_RPC_MAINNET,
      accounts: [`0x${process.env.PRIVATE_KEY_TROVIERO}`]
    }
  },
  etherscan: {
    apiKey: 'EBBCDV7REM2FADS57V48ZB16BJIBXCSJAG'
  },
  external: {
    contracts: [
      {
        artifacts: "./artifacts",
        importPath: "@openzeppelin/contracts-upgradeable",
      },
      {
        artifacts: "./artifacts",
        importPath: "@chainlink/contracts/v0.8",
      },
      {
        artifacts: "./artifacts",
        importPath: "@openzeppelin/contracts",
      }
    ],
  },
};
