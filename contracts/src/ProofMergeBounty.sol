// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProofMergeBounty
 * @notice Escrow contract for gitlawb bounties
 * @dev Bounty creators deposit ERC20 tokens, claimers receive on completion
 */
contract ProofMergeBounty is Ownable, ReentrancyGuard {
    // Bounty states
    enum BountyStatus {
        Open,
        Claimed,
        Completed,
        Cancelled
    }

    // Bounty struct
    struct Bounty {
        uint256 id;
        address creator;
        address claimer;
        address token;
        uint256 amount;
        string repo;
        string issueId;
        string title;
        BountyStatus status;
        uint256 createdAt;
        uint256 claimedAt;
        uint256 completedAt;
    }

    // Fee percentage (5%)
    uint256 public feePercent = 5;
    address public feeRecipient;

    // Bounties
    mapping(uint256 => Bounty) public bounties;
    uint256 public bountyCount;

    // Events
    event BountyCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed token,
        uint256 amount,
        string repo,
        string issueId,
        string title
    );
    event BountyClaimed(uint256 indexed id, address indexed claimer);
    event BountyCompleted(uint256 indexed id, address indexed claimer, uint256 payout);
    event BountyCancelled(uint256 indexed id, address indexed creator, uint256 refund);
    event FeeUpdated(uint256 newFeePercent);
    event FeeRecipientUpdated(address newFeeRecipient);

    constructor(address initialOwner, address _feeRecipient)
        Ownable(initialOwner)
    {
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Create a new bounty
     * @param token ERC20 token address
     * @param amount Token amount (in wei)
     * @param repo Repository name
     * @param issueId Issue identifier
     * @param title Bounty title
     */
    function createBounty(
        address token,
        uint256 amount,
        string calldata repo,
        string calldata issueId,
        string calldata title
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(bytes(repo).length > 0, "Repo required");
        require(bytes(title).length > 0, "Title required");

        // Transfer tokens to escrow
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        uint256 bountyId = bountyCount++;
        bounties[bountyId] = Bounty({
            id: bountyId,
            creator: msg.sender,
            claimer: address(0),
            token: token,
            amount: amount,
            repo: repo,
            issueId: issueId,
            title: title,
            status: BountyStatus.Open,
            createdAt: block.timestamp,
            claimedAt: 0,
            completedAt: 0
        });

        emit BountyCreated(bountyId, msg.sender, token, amount, repo, issueId, title);
        return bountyId;
    }

    /**
     * @notice Claim a bounty
     * @param bountyId Bounty ID
     */
    function claimBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Bounty not open");
        require(msg.sender != bounty.creator, "Creator cannot claim");

        bounty.claimer = msg.sender;
        bounty.status = BountyStatus.Claimed;
        bounty.claimedAt = block.timestamp;

        emit BountyClaimed(bountyId, msg.sender);
    }

    /**
     * @notice Complete a bounty (creator or owner)
     * @param bountyId Bounty ID
     */
    function completeBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Claimed, "Bounty not claimed");
        require(
            msg.sender == bounty.creator || msg.sender == owner(),
            "Not authorized"
        );

        // Calculate fee
        uint256 fee = (bounty.amount * feePercent) / 100;
        uint256 payout = bounty.amount - fee;

        // Transfer fee
        if (fee > 0) {
            IERC20(bounty.token).transfer(feeRecipient, fee);
        }

        // Transfer payout to claimer
        IERC20(bounty.token).transfer(bounty.claimer, payout);

        bounty.status = BountyStatus.Completed;
        bounty.completedAt = block.timestamp;

        emit BountyCompleted(bountyId, bounty.claimer, payout);
    }

    /**
     * @notice Cancel a bounty (creator only, if not claimed)
     * @param bountyId Bounty ID
     */
    function cancelBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Bounty not open");
        require(msg.sender == bounty.creator, "Not creator");

        // Refund to creator
        IERC20(bounty.token).transfer(bounty.creator, bounty.amount);

        bounty.status = BountyStatus.Cancelled;

        emit BountyCancelled(bountyId, bounty.creator, bounty.amount);
    }

    /**
     * @notice Update fee percentage (owner only)
     * @param newFeePercent New fee percentage (0-100)
     */
    function setFeePercent(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 100, "Invalid fee");
        feePercent = newFeePercent;
        emit FeeUpdated(newFeePercent);
    }

    /**
     * @notice Update fee recipient (owner only)
     * @param newFeeRecipient New fee recipient address
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid address");
        feeRecipient = newFeeRecipient;
        emit FeeRecipientUpdated(newFeeRecipient);
    }

    /**
     * @notice Get bounty details
     * @param bountyId Bounty ID
     * @return Bounty struct
     */
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }

    /**
     * @notice Get all bounties (paginated)
     * @param offset Start index
     * @param limit Max results
     * @return Array of bounties
     */
    function getBounties(uint256 offset, uint256 limit)
        external
        view
        returns (Bounty[] memory)
    {
        uint256 end = offset + limit;
        if (end > bountyCount) {
            end = bountyCount;
        }

        Bounty[] memory result = new Bounty[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = bounties[i];
        }

        return result;
    }
}
