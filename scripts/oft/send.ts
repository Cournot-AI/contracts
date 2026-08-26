// Usage: TO=base AMOUNT=10 [RECEIVER=0x...] npx hardhat run scripts/oft/send.ts --network mainnet
import { network } from "hardhat";
import { deployed } from "./config.js";

const to = process.env.TO ?? "";
const amount = process.env.AMOUNT ?? "";
if (!to || !amount) throw new Error("TO and AMOUNT are required");

const { ethers, networkName } = await network.create();
const [sender] = await ethers.getSigners();
const token = await ethers.getContractAt("CournotToken", deployed(networkName).token);
const receiver = process.env.RECEIVER ?? sender.address;

const amountLD = ethers.parseEther(amount);
const sendParam = {
  dstEid: deployed(to).eid,
  to: ethers.zeroPadValue(receiver, 32),
  amountLD,
  minAmountLD: amountLD,
  extraOptions: "0x",
  composeMsg: "0x",
  oftCmd: "0x",
};

const fee = await token.quoteSend(sendParam, false);
console.log(`${networkName} -> ${to}: ${amount} COURT to ${receiver}, fee ${ethers.formatEther(fee.nativeFee)}`);

const tx = await token.send(sendParam, { nativeFee: fee.nativeFee, lzTokenFee: 0 }, sender.address, {
  value: fee.nativeFee,
});
const receipt = await tx.wait();
console.log(`tx: ${receipt?.hash}`);
console.log(`track: https://layerzeroscan.com/tx/${receipt?.hash}`);
