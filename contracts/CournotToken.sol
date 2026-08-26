// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract CournotToken is OFT {
    constructor(
        string memory name,
        string memory symbol,
        address lzEndpoint,
        uint256 mintAmount
    ) OFT(name, symbol, lzEndpoint, msg.sender) Ownable(msg.sender) {
        _mint(msg.sender, mintAmount);
    }
}
