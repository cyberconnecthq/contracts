// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

interface ICybertinoNFT {
    /**
     * @dev Grant `newOwner` Owner
     */
    function transferOwnership(address newOwner) external;
}
