// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract OracleProof is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // --- Storage ---

    bool public openSubmit;
    bool public openDispute;

    mapping(address => bool) public submitters;
    mapping(address => bool) public disputers;

    // eventHash => proofName => proofHash
    mapping(bytes32 => mapping(string => bytes32)) public proofs;
    // eventHash => proofName => disputed
    mapping(bytes32 => mapping(string => bool)) public disputed;

    // --- Events ---

    event ProofSubmitted(bytes32 indexed eventHash, string[] names, bytes32[] hashes);
    event ProofDisputed(bytes32 indexed eventHash, string name);

    // --- Errors ---

    error Unauthorized();
    error AlreadySubmitted(bytes32 eventHash, string name);
    error ProofNotFound(bytes32 eventHash, string name);
    error AlreadyDisputed(bytes32 eventHash, string name);

    // --- Init ---

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address owner_) external initializer {
        __Ownable_init(owner_);
    }

    // --- Access control ---

    modifier onlySubmitter() {
        if (!openSubmit && !submitters[msg.sender]) revert Unauthorized();
        _;
    }

    modifier onlyDisputer() {
        if (!openDispute && !disputers[msg.sender]) revert Unauthorized();
        _;
    }

    function setSubmitter(address account, bool allowed) external onlyOwner {
        submitters[account] = allowed;
    }

    function setDisputer(address account, bool allowed) external onlyOwner {
        disputers[account] = allowed;
    }

    function setOpenSubmit(bool open) external onlyOwner {
        openSubmit = open;
    }

    function setOpenDispute(bool open) external onlyOwner {
        openDispute = open;
    }

    // --- Core ---

    function submitProof(
        bytes32 eventHash,
        string[] calldata names,
        bytes32[] calldata hashes
    ) external onlySubmitter {
        require(names.length == hashes.length && names.length > 0, "invalid input");

        for (uint256 i = 0; i < names.length; i++) {
            if (proofs[eventHash][names[i]] != bytes32(0)) {
                revert AlreadySubmitted(eventHash, names[i]);
            }
            proofs[eventHash][names[i]] = hashes[i];
        }

        emit ProofSubmitted(eventHash, names, hashes);
    }

    function disputeProof(bytes32 eventHash, string calldata name) external onlyDisputer {
        if (proofs[eventHash][name] == bytes32(0)) revert ProofNotFound(eventHash, name);
        if (disputed[eventHash][name]) revert AlreadyDisputed(eventHash, name);

        disputed[eventHash][name] = true;
        emit ProofDisputed(eventHash, name);
    }

    // --- UUPS ---

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
