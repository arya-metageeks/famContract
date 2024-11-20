// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();
// require('@openzeppelin/hardhat-upgrades');

// module.exports = {
//   solidity: "0.8.20",  // Use your solidity version
//   // networks: {
//   //   arbitrumTestnet: {
//   //     url: process.env.ARBITRUM_RPC,  // Your Arbitrum testnet RPC URL
//   //     accounts: [process.env.MASTER_PRIVATE_KEY],     // Your deployment wallet private key
//   //     chainId: 42161                         // Arbitrum Goerli chainId
//   //   }
//   // }
// };

require("@nomicfoundation/hardhat-verify");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [process.env.MASTER_PRIVATE_KEY], 
    },
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
    },
  },
  solidity: {
    version: "0.8.20", 
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

// npx hardhat verify --network arbitrumSepolia 0x4930eD3202De4148685B0896D2811dbe15c5B96d
