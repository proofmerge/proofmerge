// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ProofMergeBadge} from "../src/ProofMergeBadge.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        ProofMergeBadge badge = new ProofMergeBadge(deployer);

        console.log("ProofMergeBadge deployed to:", address(badge));
        console.log("Owner:", deployer);

        vm.stopBroadcast();
    }
}
