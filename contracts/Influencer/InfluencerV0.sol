// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "../Storage/InfluencerStorageV0.sol";
import "../Interface/IInfluencer.sol";
import "../Interface/ILayer.sol";

contract InfluencerV0 is
    IInfluencer,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    InfluencerStorageV0
{
    using SafeMathUpgradeable for uint256;

    /**
     * @dev Emitted when Canvas of id `id` is created with `layerInfos`.
     */
    event CanvasCreated(uint256 indexed id, LayerToken[] layerTokens);

    /**
     * @dev Emitted when a new Proposal is created by `proposer` to add `layer` to Canvas of id `canvasID`.
     */
    event ProposalCreated(
        uint256 indexed id,
        address proposer,
        uint256 canvasID,
        LayerToken layerToken
    );

    /**
     * @dev Emitted when a Proposal of `id` changed state from `from` to `to`.
     */
    event ProposalStateChanged(
        uint256 indexed id,
        ProposalState from,
        ProposalState to
    );

    /**
     * @dev Emitted when a new layer token is added to a canvas
     */
    event LayerAdded(uint256 indexed canvasID, LayerToken layerToken);

    function Influencer_init(string memory newName, string memory uri)
        public
        initializer
    {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __AccessControl_init_unchained();
        __ERC1155_init_unchained(uri);
        Influencer_init_unchained(newName);
    }

    function Influencer_init_unchained(string memory newName)
        public
        initializer
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, msg.sender);
        _setName(newName);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IInfluencer).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Sets influencer name to `newName`.
     */
    function setName(string memory newName) public onlyManager {
        name = newName;
    }

    /**
     * @dev internal set name
     */
    function _setName(string memory newName) internal {
        name = newName;
    }

    /**
     * @dev create `amount` number of new canvas consiste of `layers` and tranfser to `to`
     */
    function createCanvas(
        address to,
        LayerToken[] memory tokens,
        uint256 amount,
        bytes memory data
    ) public onlyManager {
        uint256 canvasID = canvasCount;
        canvases[canvasID].id = canvasID;
        canvases[canvasID].layerCount = tokens.length;
        for (uint256 i = 0; i < tokens.length; i++) {
            canvases[canvasID].layerTokens[i] = tokens[i];
        }

        _mint(to, canvasID, amount, data);
        canvasCount++;

        emit CanvasCreated(canvasID, tokens);
    }

    /**
     * @dev Mints token `id` for `amount` quantity and transfers it to `to`.
     * id must be already created canvas
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyManager validCanvasId(id) {
        require(id < canvasCount, "canvas is not created");
        _mint(to, id, amount, data);
    }

    /**
     * @dev Mints batch of tokens `ids` for `amount` quantity and transfers it to `to`.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyManager validCanvasIds(ids) {
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Destroys `amount` number of `tokenId` from `account`.
     */
    function burn(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyManager validCanvasId(id) {
        _burn(account, id, amount);
    }

    /**
     * @dev Creates new proposal to add `layer` to canvas of id `canvasID`
     */
    function addProposal(uint256 canvasID, LayerToken memory layerToken)
        public
        validCanvasId(canvasID)
    {
        uint256 proposalID = proposalCount;
        Proposal memory p =
            Proposal(
                proposalID,
                msg.sender,
                canvasID,
                layerToken,
                ProposalState.Pending
            );
        proposals[proposalID] = p;

        proposalCount++;
        emit ProposalCreated(proposalID, msg.sender, canvasID, layerToken);
    }

    /**
     * @dev Cancel a proposal of id `proposalID`
     */
    function cancelProposal(uint256 proposalID)
        public
        validProposalId(proposalID)
        ensureProposalState(proposalID, ProposalState.Pending)
    {
        Proposal storage p = proposals[proposalID];
        require(p.proposer == msg.sender, "only original proposer can cancel");
        p.state = ProposalState.Canceled;

        emit ProposalStateChanged(
            proposalID,
            ProposalState.Pending,
            ProposalState.Canceled
        );
    }

    /**
     * @dev Approves a proposal of id `proposalID`
     */
    function approvesProposal(uint256 proposalID)
        public
        onlyManager()
        validProposalId(proposalID)
        ensureProposalState(proposalID, ProposalState.Pending)
    {
        Proposal storage p = proposals[proposalID];
        p.state = ProposalState.Approved;

        emit ProposalStateChanged(
            proposalID,
            ProposalState.Pending,
            ProposalState.Approved
        );
    }

    /**
     * @dev Rejects a proposal of id `proposalID`
     */
    function rejectsProposal(uint256 proposalID)
        public
        onlyManager()
        validProposalId(proposalID)
        ensureProposalState(proposalID, ProposalState.Pending)
    {
        Proposal storage p = proposals[proposalID];
        p.state = ProposalState.Rejected;

        emit ProposalStateChanged(
            proposalID,
            ProposalState.Pending,
            ProposalState.Rejected
        );
    }

    /**
     * @dev Executes a proposal of id `proposalID`
     */
    function executesProposal(uint256 proposalID)
        public
        validProposalId(proposalID)
        ensureProposalState(proposalID, ProposalState.Approved)
    {
        Proposal storage p = proposals[proposalID];
        Canvas storage c = canvases[p.canvasID];
        uint256 layerID = c.layerCount;
        c.layerTokens[layerID] = p.layerToken;

        c.layerCount++;
        p.state = ProposalState.Executed;

        emit LayerAdded(p.canvasID, p.layerToken);
        emit ProposalStateChanged(
            proposalID,
            ProposalState.Pending,
            ProposalState.Executed
        );
    }

    /**
     * @dev Sets a new URI for all token types
     */
    function setURI(string memory uri) public onlyManager {
        _setURI(uri);
    }

    /**
     * @dev Grant `addr` Manager role
     */
    function grantManagerRole(address addr) public override {
        grantRole(MANAGER_ROLE, addr);
    }

    /**
     * @dev Revoke `addr` Manager role
     */
    function revokeManagerRole(address addr) public override {
        grantRole(MANAGER_ROLE, addr);
    }

    /**
     * @dev Throws if called by any account other than the manager.
     */
    modifier onlyManager() {
        require(hasRole(MANAGER_ROLE, msg.sender), "manager only");
        _;
    }

    /**
     * @dev Throws if canvas `id` does not exist
     */
    modifier validCanvasId(uint256 id) {
        require(id < canvasCount, "canvas is not created");
        _;
    }

    /**
     * @dev Throws if any of the `ids` does not exist
     */
    modifier validCanvasIds(uint256[] memory ids) {
        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] < canvasCount, "canvas is not created");
        }
        _;
    }

    /**
     * @dev Throws if proposal of id `proposalID` is not in `state`
     */
    modifier ensureProposalState(uint256 proposalID, ProposalState state) {
        require(proposals[proposalID].state == state, "invalid state");
        _;
    }

    /**
     * @dev Throws if proposal of id `proposalID` is not in `state`
     */
    modifier validProposalId(uint256 proposalID) {
        require(proposalID < proposalCount, "invalid proposal id");
        _;
    }
}
