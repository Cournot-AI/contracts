import { network } from "hardhat";
import { HOME, NAME, SYMBOL, TOTAL_SUPPLY, chain } from "./config.js";

const { ethers, networkName } = await network.create();
const cfg = chain(networkName);
const [deployer] = await ethers.getSigners();

const mintAmount = HOME[cfg.env] === networkName ? TOTAL_SUPPLY : 0n;
const args = [NAME, SYMBOL, cfg.endpoint, mintAmount];

const token = await ethers.deployContract("CournotToken", args);
await token.waitForDeployment();

console.log(`network:  ${networkName}`);
console.log(`deployer: ${deployer.address}`);
console.log(`token:    ${token.target}`);
console.log(`minted:   ${ethers.formatEther(mintAmount)} ${SYMBOL}`);
console.log();
console.log(`Next: set token = "${token.target}" for ${networkName} in scripts/oft/config.ts, then verify:`);
console.log(`npx hardhat verify --network ${networkName} --build-profile production ${token.target} "${NAME}" "${SYMBOL}" ${cfg.endpoint} ${mintAmount}`);
