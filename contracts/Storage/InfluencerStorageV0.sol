// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "../Interface/ILayer.sol";

// Storage is append only and never to be modified
// To upgrade:
//
// contract InfluencerStorageV1 is InfluencerStorageV0 {...}
// contract InfluencerV1 is InfluencerStorageV1 ... {...}
contract InfluencerStorageV0 {
    /**
     * @dev influencer name
     */
    string public name;

    /**
     * @dev manager role
     */
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    /**
     * @dev LayerToken stores layer contract address and layer token id
     */
    struct LayerToken {
        // layer contract address
        ILayer layer;
        // layer token id
        uint256 layerID;
    }

    /**
     * Canvas consists of 1 or more layers
     */
    struct Canvas {
        // canvas id
        uint256 id;
        // The total number of layers
        uint256 layerCount;
        // all layer tokens
        mapping(uint256 => LayerToken) layerTokens;
    }

    /**
     * @dev The total number of canvas
     */
    uint256 public canvasCount;

    /**
     * @dev tokenID to Canvas
     */
    mapping(uint256 => Canvas) canvases;

    /**
     * User proposal to add new layers to an existing canvas
     */
    struct Proposal {
        // proposal id
        uint256 id;
        // proposer who created the proposal
        address proposer;
        // the canvas id to add layer to
        uint256 canvasID;
        // Layer info
        LayerToken layerToken;
        // proposal state
        ProposalState state;
    }

    /**
     * @dev The total number of proposals
     */
    uint256 public proposalCount;

    /*
     * @dev Possible states that a proposal may be in
     */
    enum ProposalState {Pending, Canceled, Approved, Rejected, Executed}

    /*
     * @dev stores all user proposals
     */
    mapping(uint256 => Proposal) public proposals;
}
