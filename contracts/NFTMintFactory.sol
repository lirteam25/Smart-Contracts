// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract NFTMintFactory {
    UpgradeableBeacon public beacon;

    event NFTMintDeployed(address indexed proxyAddress, address indexed creator);

    constructor(address _implementation, address _admin) {
        beacon = new UpgradeableBeacon(_implementation, _admin);
    }

    function createNFTMint(bytes memory _data) public {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon),
            _data
        );
        emit NFTMintDeployed(address(proxy), msg.sender);
    }
}
