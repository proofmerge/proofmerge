// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ProofMergeBounty} from "../src/ProofMergeBounty.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Test Token", "TT") {
        _mint(msg.sender, 1000000e18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract ProofMergeBountyTest is Test {
    ProofMergeBounty public bounty;
    MockToken public token;
    address public owner = address(1);
    address public feeRecipient = address(2);
    address public creator = address(3);
    address public claimer = address(4);

    function setUp() public {
        vm.startPrank(owner);
        bounty = new ProofMergeBounty(owner, feeRecipient);
        token = new MockToken();
        vm.stopPrank();

        // Transfer tokens to creator
        vm.startPrank(owner);
        token.transfer(creator, 100000e18);
        vm.stopPrank();
    }

    function testCreateBounty() public {
        vm.startPrank(creator);
        token.approve(address(bounty), 1000e18);

        uint256 bountyId = bounty.createBounty(
            address(token),
            1000e18,
            "gitlawb/node",
            "issue-42",
            "Fix memory leak"
        );
        vm.stopPrank();

        assertEq(bountyId, 0);
        assertEq(bounty.bountyCount(), 1);

        ProofMergeBounty.Bounty memory b = bounty.getBounty(bountyId);
        assertEq(b.creator, creator);
        assertEq(b.amount, 1000e18);
        assertEq(uint256(b.status), uint256(ProofMergeBounty.BountyStatus.Open));
    }

    function testClaimBounty() public {
        vm.startPrank(creator);
        token.approve(address(bounty), 1000e18);
        uint256 bountyId = bounty.createBounty(
            address(token),
            1000e18,
            "gitlawb/node",
            "issue-42",
            "Fix memory leak"
        );
        vm.stopPrank();

        vm.startPrank(claimer);
        bounty.claimBounty(bountyId);
        vm.stopPrank();

        ProofMergeBounty.Bounty memory b = bounty.getBounty(bountyId);
        assertEq(b.claimer, claimer);
        assertEq(uint256(b.status), uint256(ProofMergeBounty.BountyStatus.Claimed));
    }

    function testCompleteBounty() public {
        vm.startPrank(creator);
        token.approve(address(bounty), 1000e18);
        uint256 bountyId = bounty.createBounty(
            address(token),
            1000e18,
            "gitlawb/node",
            "issue-42",
            "Fix memory leak"
        );
        vm.stopPrank();

        vm.startPrank(claimer);
        bounty.claimBounty(bountyId);
        vm.stopPrank();

        uint256 claimerBalanceBefore = token.balanceOf(claimer);
        uint256 feeRecipientBalanceBefore = token.balanceOf(feeRecipient);

        vm.startPrank(creator);
        bounty.completeBounty(bountyId);
        vm.stopPrank();

        ProofMergeBounty.Bounty memory b = bounty.getBounty(bountyId);
        assertEq(uint256(b.status), uint256(ProofMergeBounty.BountyStatus.Completed));

        // Check payout (95% to claimer, 5% fee)
        uint256 expectedPayout = 950e18;
        uint256 expectedFee = 50e18;
        assertEq(token.balanceOf(claimer) - claimerBalanceBefore, expectedPayout);
        assertEq(token.balanceOf(feeRecipient) - feeRecipientBalanceBefore, expectedFee);
    }

    function testCancelBounty() public {
        vm.startPrank(creator);
        token.approve(address(bounty), 1000e18);
        uint256 bountyId = bounty.createBounty(
            address(token),
            1000e18,
            "gitlawb/node",
            "issue-42",
            "Fix memory leak"
        );
        vm.stopPrank();

        uint256 creatorBalanceBefore = token.balanceOf(creator);

        vm.startPrank(creator);
        bounty.cancelBounty(bountyId);
        vm.stopPrank();

        ProofMergeBounty.Bounty memory b = bounty.getBounty(bountyId);
        assertEq(uint256(b.status), uint256(ProofMergeBounty.BountyStatus.Cancelled));
        assertEq(token.balanceOf(creator) - creatorBalanceBefore, 1000e18);
    }

    function testCannotClaimOwnBounty() public {
        vm.startPrank(creator);
        token.approve(address(bounty), 1000e18);
        uint256 bountyId = bounty.createBounty(
            address(token),
            1000e18,
            "gitlawb/node",
            "issue-42",
            "Fix memory leak"
        );

        vm.expectRevert("Creator cannot claim");
        bounty.claimBounty(bountyId);
        vm.stopPrank();
    }

    function testCannotCompleteWithoutClaim() public {
        vm.startPrank(creator);
        token.approve(address(bounty), 1000e18);
        uint256 bountyId = bounty.createBounty(
            address(token),
            1000e18,
            "gitlawb/node",
            "issue-42",
            "Fix memory leak"
        );

        vm.expectRevert("Bounty not claimed");
        bounty.completeBounty(bountyId);
        vm.stopPrank();
    }

    function testSetFeePercent() public {
        vm.startPrank(owner);
        bounty.setFeePercent(10);
        assertEq(bounty.feePercent(), 10);
        vm.stopPrank();
    }

    function testSetFeeRecipient() public {
        address newRecipient = address(99);
        vm.startPrank(owner);
        bounty.setFeeRecipient(newRecipient);
        assertEq(bounty.feeRecipient(), newRecipient);
        vm.stopPrank();
    }

    function testGetBounties() public {
        vm.startPrank(creator);
        token.approve(address(bounty), 3000e18);

        bounty.createBounty(address(token), 1000e18, "repo1", "i1", "Bounty 1");
        bounty.createBounty(address(token), 1000e18, "repo2", "i2", "Bounty 2");
        bounty.createBounty(address(token), 1000e18, "repo3", "i3", "Bounty 3");
        vm.stopPrank();

        ProofMergeBounty.Bounty[] memory bounties = bounty.getBounties(0, 10);
        assertEq(bounties.length, 3);
        assertEq(bounties[0].title, "Bounty 1");
        assertEq(bounties[1].title, "Bounty 2");
        assertEq(bounties[2].title, "Bounty 3");
    }
}
