// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract InfluencerBeacon is UpgradeableBeacon {
    /**
     * @dev Sets the address of the initial implementation, and the deployer account as the owner who can upgrade the
     * beacon.
     */
    constructor(address implementation) UpgradeableBeacon(implementation) {}
}
