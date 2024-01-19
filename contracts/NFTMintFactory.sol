// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMintFactory is Ownable {
    UpgradeableBeacon public beacon;

    event NFTMintDeployed(address indexed proxyAddress, address indexed creator);
    event BeaconCreated(address beaconAddress);

    constructor(address _implementation) Ownable(msg.sender) {
        beacon = new UpgradeableBeacon(_implementation, address(this));
        emit BeaconCreated(address(beacon));
    }

    function createNFTMint(bytes memory _data) public {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon),
            _data
        );
        emit NFTMintDeployed(address(proxy), msg.sender);
    }

    function updateBeaconImplementation(address _newImplementation) public onlyOwner {
        beacon.upgradeTo(_newImplementation);
    }
}
