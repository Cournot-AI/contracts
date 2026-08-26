# contracts

Solidity smart contracts built with Hardhat 3, OpenZeppelin, and ERC1967 upgradeable proxies.

## Stack

- Hardhat 3 + ethers.js + chai
- OpenZeppelin Contracts (upgradeable)
- ERC1967 proxy pattern (UUPS)
- LayerZero V2 OFT

## Setup

```shell
npm install
cp .env.example .env   # fill in keys
```

## Compile

```shell
npx hardhat compile
```

## Test

```shell
npx hardhat test
```

## COURT token (LayerZero OFT)

`contracts/CournotToken.sol` — Cournot (COURT), 1,000,000,000 supply, minted once on the
home chain (Ethereum mainnet / Sepolia) and moved between chains with LayerZero OFT.

Chains, endpoints, DVNs and deployed addresses live in `scripts/oft/config.ts`.
Every script reads the target chain from `--network`; mainnet networks use
`MAINNET_PRIVATE_KEY`, testnet networks use `TESTNET_PRIVATE_KEY`.

| env     | networks                              |
|---------|---------------------------------------|
| mainnet | `mainnet`, `base`, `bsc`              |
| testnet | `sepolia`, `base_sepolia`, `bsc_testnet` |

### 1. Deploy (each chain)

```shell
npx hardhat run scripts/oft/deploy.ts --network sepolia --build-profile production
```

Paste the printed address into `token` for that network in `scripts/oft/config.ts`, then run the
printed `npx hardhat verify ...` command (it passes `--build-profile production` so the bytecode
matches the deployment).

### 2. Wire (each chain, after all chains are deployed)

```shell
npx hardhat run scripts/oft/wire.ts --network sepolia
```

Sets peers, enforced `lzReceive` gas, send/receive libraries and the DVN set for every other
chain in the same env. Re-running only applies what changed.

### 3. Send

```shell
TO=base_sepolia AMOUNT=10 npx hardhat run scripts/oft/send.ts --network sepolia
```

Optional `RECEIVER=0x...` (defaults to the sender).

### 4. Hand over to the multisig (each chain)

```shell
NEW_OWNER=0x... npx hardhat run scripts/oft/transfer_owner.ts --network sepolia
```

Transfers ownership and the LayerZero delegate role.

### Adding a chain later

Add the network to `hardhat.config.ts` and a `CHAINS` entry to `scripts/oft/config.ts`, deploy on
it, then run `wire.ts` on the new chain and on every existing chain in the same env.
