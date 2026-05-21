// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ProofMergeBounty} from "../src/ProofMergeBounty.sol";

contract DeployBountyScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address feeRecipient = deployer; // Use deployer as fee recipient for now

        vm.startBroadcast(deployerPrivateKey);

        ProofMergeBounty bounty = new ProofMergeBounty(deployer, feeRecipient);

        console.log("ProofMergeBounty deployed to:", address(bounty));
        console.log("Owner:", deployer);
        console.log("Fee Recipient:", feeRecipient);

        vm.stopBroadcast();
    }
}
