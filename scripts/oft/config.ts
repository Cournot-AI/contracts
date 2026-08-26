// LayerZero V2 addresses: https://docs.layerzero.network/v2/deployments/deployed-contracts
// DVN addresses:          https://docs.layerzero.network/v2/deployments/dvn-addresses
//
// To add a chain: add a network to hardhat.config.ts, add an entry here,
// deploy on it, then run wire.ts on it AND on every existing chain in the same env.

export const NAME = "Cournot";
export const SYMBOL = "COURT";
export const TOTAL_SUPPLY = 1_000_000_000n * 10n ** 18n;

// Gas the executor provides for lzReceive (mint) on the destination chain.
export const LZ_RECEIVE_GAS = 100_000n;

export type Env = "mainnet" | "testnet";

export interface Chain {
  env: Env;
  eid: number;
  endpoint: string;
  sendLib: string;
  receiveLib: string;
  executor: string;
  // DVNs that must all verify messages sent FROM this chain.
  dvns: string[];
  // Source-chain block confirmations required for messages sent FROM this chain.
  confirmations: number;
  // CournotToken address on this chain; fill in after deploy.
  token: string;
}

// The whole supply is minted on the home chain; every other chain starts at 0.
export const HOME: Record<Env, string> = {
  mainnet: "mainnet",
  testnet: "sepolia",
};

export const CHAINS: Record<string, Chain> = {
  // ---------------- mainnet ----------------
  mainnet: {
    env: "mainnet",
    eid: 30101,
    endpoint: "0x1a44076050125825900e736c501f859c50fe728c",
    sendLib: "0xbb2ea70c9e858123480642cf96acbcce1372dce1",
    receiveLib: "0xc02ab410f0734efa3f14628780e6e695156024c2",
    executor: "0x173272739bd7aa6e4e214714048a9fe699453059",
    dvns: [
      "0x589dedbd617e0cbcb916a9223f4d1300c294236b", // LayerZero Labs
      "0xa59ba433ac34d2927232918ef5b2eaafcf130ba5", // Nethermind
    ],
    confirmations: 15,
    token: "",
  },
  base: {
    env: "mainnet",
    eid: 30184,
    endpoint: "0x1a44076050125825900e736c501f859c50fe728c",
    sendLib: "0xb5320b0b3a13cc860893e2bd79fcd7e13484dda2",
    receiveLib: "0xc70ab6f32772f59fbfc23889caf4ba3376c84baf",
    executor: "0x2cca08ae69e0c44b18a57ab2a87644234daebae4",
    dvns: [
      "0x9e059a54699a285714207b43b055483e78faac25", // LayerZero Labs
      "0xcd37ca043f8479064e10635020c65ffc005d36f6", // Nethermind
    ],
    confirmations: 10,
    token: "",
  },
  bsc: {
    env: "mainnet",
    eid: 30102,
    endpoint: "0x1a44076050125825900e736c501f859c50fe728c",
    sendLib: "0x9f8c645f2d0b2159767bd6e0839de4be49e823de",
    receiveLib: "0xb217266c3a98c8b2709ee26836c98cf12f6ccec1",
    executor: "0x3ebd570ed38b1b3b4bc886999fcf507e9d584859",
    dvns: [
      "0xfd6865c841c2d64565562fcc7e05e619a30615f0", // LayerZero Labs
      "0x31f748a368a893bdb5abb67ec95f232507601a73", // Nethermind
    ],
    confirmations: 20,
    token: "",
  },

  // ---------------- testnet ----------------
  sepolia: {
    env: "testnet",
    eid: 40161,
    endpoint: "0x6edce65403992e310a62460808c4b910d972f10f",
    sendLib: "0xcc1ae8cf5d3904cef3360a9532b477529b177cce",
    receiveLib: "0xdaf00f5ee2158dd58e0d3857851c432e34a3a851",
    executor: "0x718b92b5cb0a5552039b593faf724d182a881eda",
    dvns: ["0x8eebf8b423b73bfca51a1db4b7354aa0bfca9193"], // LayerZero Labs
    confirmations: 2,
    token: "0x2de44414aFf08fA9AE8A1333fceaB99Ab015e097",
  },
  base_sepolia: {
    env: "testnet",
    eid: 40245,
    endpoint: "0x6edce65403992e310a62460808c4b910d972f10f",
    sendLib: "0xc1868e054425d378095a003ecba3823a5d0135c9",
    receiveLib: "0x12523de19dc41c91f7d2093e0cfbb76b17012c8d",
    executor: "0x8a3d588d9f6ac041476b094f97ff94ec30169d3d",
    dvns: ["0xe1a12515f9ab2764b887bf60b923ca494ebbb2d6"], // LayerZero Labs
    confirmations: 2,
    token: "0x2de44414aFf08fA9AE8A1333fceaB99Ab015e097",
  },
  bsc_testnet: {
    env: "testnet",
    eid: 40102,
    endpoint: "0x6edce65403992e310a62460808c4b910d972f10f",
    sendLib: "0x55f16c442907e86d764afdc2a07c2de3bdac8bb7",
    receiveLib: "0x188d4bbced671a7aa2b5055937f79510a32e9683",
    executor: "0x31894b190a8babd9a067ce59fde0bfcfd2b18470",
    dvns: ["0x0ee552262f7b562efced6dd4a7e2878ab897d405"], // LayerZero Labs
    confirmations: 5,
    token: "0x2de44414aFf08fA9AE8A1333fceaB99Ab015e097",
  },
};

export function chain(networkName: string): Chain {
  const c = CHAINS[networkName];
  if (!c) throw new Error(`no LayerZero config for network "${networkName}"`);
  return c;
}

export function deployed(networkName: string): Chain {
  const c = chain(networkName);
  if (!c.token) throw new Error(`CournotToken not deployed on "${networkName}" (set token in config.ts)`);
  return c;
}

export function peers(networkName: string): [string, Chain][] {
  const self = chain(networkName);
  return Object.entries(CHAINS).filter(([name, c]) => name !== networkName && c.env === self.env);
}
