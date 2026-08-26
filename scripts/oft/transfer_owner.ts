// Usage: NEW_OWNER=0x... npx hardhat run scripts/oft/transfer_owner.ts --network mainnet
// Hands both the contract ownership and the endpoint delegate (DVN/library config) to NEW_OWNER.
import { network } from "hardhat";
import { deployed } from "./config.js";

const newOwner = process.env.NEW_OWNER ?? "";
if (!newOwner) throw new Error("NEW_OWNER is required");

const { ethers, networkName } = await network.create();
const token = await ethers.getContractAt("CournotToken", deployed(networkName).token);

await (await token.setDelegate(newOwner)).wait();
await (await token.transferOwnership(newOwner)).wait();
console.log(`${networkName}: owner and delegate -> ${newOwner}`);
