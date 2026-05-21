// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title ProofMergeBadge
 * @notice ERC-1155 skill badges for gitlawb contributors
 * @dev Badges are minted based on real contributions on the gitlawb network
 */
contract ProofMergeBadge is ERC1155, ERC1155Burnable, ERC1155Supply, Ownable {
    // Badge type IDs
    uint256 public constant FIRST_CONTRIBUTION = 1;
    uint256 public constant BUG_HUNTER = 2;
    uint256 public constant TOP_REVIEWER = 3;
    uint256 public constant PROLIFIC_CODER = 4;
    uint256 public constant AGENT_MASTER = 5;
    uint256 public constant BOUNTY_HUNTER = 6;

    // Badge names
    mapping(uint256 => string) private _badgeNames;

    // Track if an address has received a specific badge
    mapping(address => mapping(uint256 => bool)) public hasBadge;

    // Authorized minters (can be other contracts or addresses)
    mapping(address => bool) public minters;

    // Events
    event BadgeMinted(
        address indexed to,
        uint256 indexed badgeId,
        string badgeName
    );
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);

    constructor(address initialOwner)
        ERC1155("")
        Ownable(initialOwner)
    {
        _badgeNames[FIRST_CONTRIBUTION] = "First Contribution";
        _badgeNames[BUG_HUNTER] = "Bug Hunter";
        _badgeNames[TOP_REVIEWER] = "Top Reviewer";
        _badgeNames[PROLIFIC_CODER] = "Prolific Coder";
        _badgeNames[AGENT_MASTER] = "Agent Master";
        _badgeNames[BOUNTY_HUNTER] = "Bounty Hunter";
    }

    /**
     * @notice Set the base URI for metadata
     * @param newBaseUri The new base URI
     */
    function setURI(string calldata newBaseUri) external onlyOwner {
        _setURI(newBaseUri);
    }

    /**
     * @notice Authorize a minter
     * @param minter Address to authorize
     */
    function authorizeMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAuthorized(minter);
    }

    /**
     * @notice Revoke a minter
     * @param minter Address to revoke
     */
    function revokeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRevoked(minter);
    }

    /**
     * @notice Mint a badge to a contributor
     * @param to Address to receive the badge
     * @param badgeId The badge type ID
     */
    function mintBadge(address to, uint256 badgeId) external {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized");
        require(badgeId >= FIRST_CONTRIBUTION && badgeId <= BOUNTY_HUNTER, "Invalid badge ID");
        require(!hasBadge[to][badgeId], "Badge already claimed");

        _mint(to, badgeId, 1, "");
        hasBadge[to][badgeId] = true;

        emit BadgeMinted(to, badgeId, _badgeNames[badgeId]);
    }

    /**
     * @notice Get badge name by ID
     * @param badgeId The badge type ID
     * @return The badge name
     */
    function getBadgeName(uint256 badgeId) external view returns (string memory) {
        return _badgeNames[badgeId];
    }

    /**
     * @notice Get all badge IDs
     * @return Array of badge IDs
     */
    function getAllBadgeIds() external pure returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](6);
        ids[0] = FIRST_CONTRIBUTION;
        ids[1] = BUG_HUNTER;
        ids[2] = TOP_REVIEWER;
        ids[3] = PROLIFIC_CODER;
        ids[4] = AGENT_MASTER;
        ids[5] = BOUNTY_HUNTER;
        return ids;
    }

    // Required overrides
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
