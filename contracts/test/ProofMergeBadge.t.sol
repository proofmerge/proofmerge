// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ProofMergeBadge} from "../src/ProofMergeBadge.sol";

contract ProofMergeBadgeTest is Test {
    ProofMergeBadge public badge;
    address public owner = address(1);
    address public minter = address(2);
    address public user = address(3);

    // Badge IDs
    uint256 constant FIRST_CONTRIBUTION = 1;
    uint256 constant BUG_HUNTER = 2;
    uint256 constant TOP_REVIEWER = 3;
    uint256 constant PROLIFIC_CODER = 4;
    uint256 constant AGENT_MASTER = 5;
    uint256 constant BOUNTY_HUNTER = 6;

    function setUp() public {
        vm.startPrank(owner);
        badge = new ProofMergeBadge(owner);
        badge.authorizeMinter(minter);
        vm.stopPrank();
    }

    function testMintBadge() public {
        vm.startPrank(minter);
        badge.mintBadge(user, FIRST_CONTRIBUTION);
        vm.stopPrank();

        assertEq(badge.balanceOf(user, FIRST_CONTRIBUTION), 1);
        assertTrue(badge.hasBadge(user, FIRST_CONTRIBUTION));
    }

    function testCannotMintDuplicate() public {
        vm.startPrank(minter);
        badge.mintBadge(user, FIRST_CONTRIBUTION);

        vm.expectRevert("Badge already claimed");
        badge.mintBadge(user, FIRST_CONTRIBUTION);
        vm.stopPrank();
    }

    function testOnlyAuthorizedCanMint() public {
        vm.startPrank(user);
        vm.expectRevert("Not authorized");
        badge.mintBadge(user, FIRST_CONTRIBUTION);
        vm.stopPrank();
    }

    function testOwnerCanMint() public {
        vm.startPrank(owner);
        badge.mintBadge(user, BUG_HUNTER);
        vm.stopPrank();

        assertEq(badge.balanceOf(user, BUG_HUNTER), 1);
    }

    function testInvalidBadgeId() public {
        vm.startPrank(minter);
        vm.expectRevert("Invalid badge ID");
        badge.mintBadge(user, 0);
        vm.stopPrank();

        vm.startPrank(minter);
        vm.expectRevert("Invalid badge ID");
        badge.mintBadge(user, 7);
        vm.stopPrank();
    }

    function testAuthorizeRevokeMinter() public {
        vm.startPrank(owner);
        badge.authorizeMinter(user);
        assertTrue(badge.minters(user));

        badge.revokeMinter(user);
        assertFalse(badge.minters(user));
        vm.stopPrank();
    }

    function testGetBadgeName() public view {
        assertEq(badge.getBadgeName(FIRST_CONTRIBUTION), "First Contribution");
        assertEq(badge.getBadgeName(BUG_HUNTER), "Bug Hunter");
        assertEq(badge.getBadgeName(TOP_REVIEWER), "Top Reviewer");
        assertEq(badge.getBadgeName(PROLIFIC_CODER), "Prolific Coder");
        assertEq(badge.getBadgeName(AGENT_MASTER), "Agent Master");
        assertEq(badge.getBadgeName(BOUNTY_HUNTER), "Bounty Hunter");
    }

    function testGetAllBadgeIds() public view {
        uint256[] memory ids = badge.getAllBadgeIds();
        assertEq(ids.length, 6);
        assertEq(ids[0], FIRST_CONTRIBUTION);
        assertEq(ids[1], BUG_HUNTER);
        assertEq(ids[2], TOP_REVIEWER);
        assertEq(ids[3], PROLIFIC_CODER);
        assertEq(ids[4], AGENT_MASTER);
        assertEq(ids[5], BOUNTY_HUNTER);
    }

    function testMintAllBadges() public {
        vm.startPrank(minter);

        badge.mintBadge(user, FIRST_CONTRIBUTION);
        badge.mintBadge(user, BUG_HUNTER);
        badge.mintBadge(user, TOP_REVIEWER);
        badge.mintBadge(user, PROLIFIC_CODER);
        badge.mintBadge(user, AGENT_MASTER);
        badge.mintBadge(user, BOUNTY_HUNTER);

        vm.stopPrank();

        assertEq(badge.balanceOf(user, FIRST_CONTRIBUTION), 1);
        assertEq(badge.balanceOf(user, BUG_HUNTER), 1);
        assertEq(badge.balanceOf(user, TOP_REVIEWER), 1);
        assertEq(badge.balanceOf(user, PROLIFIC_CODER), 1);
        assertEq(badge.balanceOf(user, AGENT_MASTER), 1);
        assertEq(badge.balanceOf(user, BOUNTY_HUNTER), 1);
    }

    function testSetURI() public {
        vm.startPrank(owner);
        badge.setURI("https://proofmerge.vercel.app/badges/{id}.json");
        vm.stopPrank();

        assertEq(
            badge.uri(FIRST_CONTRIBUTION),
            "https://proofmerge.vercel.app/badges/{id}.json"
        );
    }
}
