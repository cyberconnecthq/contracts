// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

// Storage is append only and never to be modified
// To upgrade:
//
// contract LayerStorageV1 is LayerStorageV0 {...}
// contract LayerV1 is LayerStorageV1 ... {...}
contract LayerStorageV0 {
    /**
     * Layer contains a `currentState` from 0 to `maxState` (exclusive)
     * if `modularLayer` is set to true, the layer state is driven by `module`
     */
    struct Layer {
        // true if layer state is driven by module
        bool modularLayer;
        // maximum state
        uint32 maxState;
        // current state [0, maxState)
        uint32 currentState;
        // module address, zero if modularLayer is false
        address module;
    }

    /**
     * @dev tokenID to Layer
     */
    mapping(uint256 => Layer) layers;

    /**
     * @dev The total number of layer
     */
    uint256 public layerCount;

    /**
     * @dev base token uri
     */
    string public baseURI;
}
