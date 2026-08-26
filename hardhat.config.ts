import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();

const mainnetAccounts = process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [];
const testnetAccounts = process.env.TESTNET_PRIVATE_KEY ? [process.env.TESTNET_PRIVATE_KEY] : [];

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatBase: {
      type: "edr-simulated",
      chainType: "op",
    },
    mainnet: {
      type: "http",
      chainId: 1,
      url: process.env.MAINNET_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
      accounts: mainnetAccounts,
    },
    base: {
      type: "http",
      chainType: "op",
      chainId: 8453,
      url: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
      accounts: mainnetAccounts,
    },
    bsc: {
      type: "http",
      chainId: 56,
      url: process.env.BSC_RPC_URL ?? "https://bsc-dataseed.binance.org",
      accounts: mainnetAccounts,
    },
    sepolia: {
      type: "http",
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: testnetAccounts,
    },
    base_sepolia: {
      type: "http",
      chainType: "op",
      chainId: 84532,
      url: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
      accounts: testnetAccounts,
    },
    bsc_testnet: {
      type: "http",
      chainId: 97,
      url: process.env.BSC_TESTNET_RPC_URL ?? "https://bsc-testnet-rpc.publicnode.com",
      accounts: testnetAccounts,
    },
  },
  chainDescriptors: {
    97: {
      name: "BSC Testnet",
      blockExplorers: {
        etherscan: { url: "https://testnet.bscscan.com" },
      },
    },
  },
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY ?? "",
    },
  },
});
