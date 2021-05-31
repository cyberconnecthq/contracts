// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

interface ILayer {
    function getLayer(uint256 id)
        external
        view
        returns (uint32 maxState, uint32 currencyState);
}
