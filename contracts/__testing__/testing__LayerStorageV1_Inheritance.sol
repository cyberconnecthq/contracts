// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "../Storage/LayerStorageV0.sol";

// Testing layer storage inheritance
contract __testing__LayerStorageV1_Inheritance is LayerStorageV0 {
    /**
     * @dev layer nickname
     */
    string public nickname;
}
