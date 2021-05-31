// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

interface __testing__ILayerV1_struct {
    function getLayer(uint256 id)
        external
        view
        returns (
            uint32 maxState,
            uint32 currencyState,
            uint256 positionX,
            uint256 positionY
        );
}
