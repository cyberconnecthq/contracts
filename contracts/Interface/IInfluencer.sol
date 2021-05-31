// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

interface IInfluencer {
    /**
     * @dev Grant `addr` Manager role
     */
    function grantManagerRole(address addr) external;

    /**
     * @dev Revoke `addr` Manager role
     */
    function revokeManagerRole(address addr) external;
}
