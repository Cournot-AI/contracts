// Connects the token on the current network to every other chain in the same
// env: peer, enforced lzReceive gas, message libraries and DVN config.
// Safe to re-run; unchanged settings are skipped.
import { network } from "hardhat";
import { LZ_RECEIVE_GAS, deployed, peers } from "./config.js";

const ENDPOINT_ABI = [
  "function getSendLibrary(address sender, uint32 dstEid) view returns (address)",
  "function isDefaultSendLibrary(address sender, uint32 dstEid) view returns (bool)",
  "function getReceiveLibrary(address receiver, uint32 srcEid) view returns (address lib, bool isDefault)",
  "function setSendLibrary(address oapp, uint32 eid, address lib)",
  "function setReceiveLibrary(address oapp, uint32 eid, address lib, uint256 gracePeriod)",
  "function setConfig(address oapp, address lib, (uint32 eid, uint32 configType, bytes config)[] params)",
];
const CONFIG_TYPE_EXECUTOR = 1;
const CONFIG_TYPE_ULN = 2;
const MSG_TYPE_SEND = 1;

const { ethers, networkName } = await network.create();
const self = deployed(networkName);
const token = await ethers.getContractAt("CournotToken", self.token);
const endpoint = await ethers.getContractAt(ENDPOINT_ABI, self.endpoint);
const abi = ethers.AbiCoder.defaultAbiCoder();

// Option type 3, one executor lzReceive option: gas only.
const enforced = ethers.solidityPacked(
  ["uint16", "uint8", "uint16", "uint8", "uint128"],
  [3, 1, 17, 1, LZ_RECEIVE_GAS],
);

function ulnConfig(eid: number, confirmations: number, dvns: string[]) {
  const sorted = [...dvns].map((d) => d.toLowerCase()).sort();
  return {
    eid,
    configType: CONFIG_TYPE_ULN,
    config: abi.encode(
      ["tuple(uint64 confirmations,uint8 requiredDVNCount,uint8 optionalDVNCount,uint8 optionalDVNThreshold,address[] requiredDVNs,address[] optionalDVNs)"],
      [[confirmations, sorted.length, 0, 0, sorted, []]],
    ),
  };
}

for (const [name, peer] of peers(networkName)) {
  console.log(`== ${networkName} -> ${name} (eid ${peer.eid})`);
  const peerBytes = ethers.zeroPadValue(deployed(name).token, 32);

  if ((await token.peers(peer.eid)) !== peerBytes) {
    await (await token.setPeer(peer.eid, peerBytes)).wait();
    console.log("   setPeer");
  }

  if ((await token.enforcedOptions(peer.eid, MSG_TYPE_SEND)) !== enforced) {
    await (await token.setEnforcedOptions([{ eid: peer.eid, msgType: MSG_TYPE_SEND, options: enforced }])).wait();
    console.log("   setEnforcedOptions");
  }

  const sendLib = await endpoint.getSendLibrary(self.token, peer.eid);
  if ((await endpoint.isDefaultSendLibrary(self.token, peer.eid)) || sendLib.toLowerCase() !== self.sendLib) {
    await (await endpoint.setSendLibrary(self.token, peer.eid, self.sendLib)).wait();
    console.log("   setSendLibrary");
  }

  const [receiveLib, isDefault] = await endpoint.getReceiveLibrary(self.token, peer.eid);
  if (isDefault || receiveLib.toLowerCase() !== self.receiveLib) {
    await (await endpoint.setReceiveLibrary(self.token, peer.eid, self.receiveLib, 0)).wait();
    console.log("   setReceiveLibrary");
  }

  // Outbound: our DVNs verify on our confirmations. Inbound: our DVNs verify on the peer's confirmations.
  await (await endpoint.setConfig(self.token, self.sendLib, [
    {
      eid: peer.eid,
      configType: CONFIG_TYPE_EXECUTOR,
      config: abi.encode(["tuple(uint32 maxMessageSize,address executor)"], [[10000, self.executor]]),
    },
    ulnConfig(peer.eid, self.confirmations, self.dvns),
  ])).wait();
  await (await endpoint.setConfig(self.token, self.receiveLib, [
    ulnConfig(peer.eid, peer.confirmations, self.dvns),
  ])).wait();
  console.log("   setConfig");
}
