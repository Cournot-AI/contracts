// LayerZero packages only export their artifacts, and Hardhat 3 refuses to
// resolve Solidity imports that the package.json "exports" map does not list.
import { readFileSync, writeFileSync } from "node:fs";

for (const name of ["@layerzerolabs/oapp-evm", "@layerzerolabs/oft-evm"]) {
  const path = new URL(`../node_modules/${name}/package.json`, import.meta.url);
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  pkg.exports["./contracts/*"] = "./contracts/*";
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
}
