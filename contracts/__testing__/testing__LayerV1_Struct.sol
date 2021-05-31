// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../Interface/ILayer.sol";
import "../Interface/IModule.sol";
import "./testing__LayerStorageV1_Struct.sol";
import "./testing__ILayerV1_Struct.sol";

contract __testing__LayerV1_Struct is
    OwnableUpgradeable,
    __testing__ILayerV1_struct,
    ERC721Upgradeable,
    __testing__LayerStorageV1_Struct
{
    using AddressUpgradeable for address;

    function __Layer_init(
        string memory name_,
        string memory symbol_,
        string memory uri,
        address owner
    ) public initializer {
        __Ownable_init_unchained();
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained(name_, symbol_);
        setBaseURI(uri);
        transferOwnership(owner);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(ILayer).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev layer getter method
     */
    function getLayer(uint256 id)
        public
        view
        override
        validLayerId(id)
        returns (
            uint32 maxState,
            uint32 currenctState,
            uint256 positionX,
            uint256 positionY
        )
    {
        Layer storage layer = layers[id];
        if (layer.modularLayer) {
            IModule module = IModule(layer.module);
            return (module.getMaxState(), module.getState(), 0, 0);
        } else {
            return (
                layer.maxState,
                layer.currentState,
                layer.positionX,
                layer.positionY
            );
        }
    }

    /**
     * @dev allows layer owner to update layer `id` state to `state`
     */
    function setLayerState(uint256 id, uint32 state) public onlyLayerOwner(id) {
        Layer storage layer = layers[id];
        require(layer.currentState != state, "no ops");
        require(state < layer.maxState, "new state above max state");

        layer.currentState = state;
    }

    /**
     * @dev allows layer owner to update layer `id` maxState to `maxState`
     */
    function setLayerMaxState(uint256 id, uint32 maxState)
        public
        onlyLayerOwner(id)
    {
        Layer storage layer = layers[id];
        require(layer.maxState != maxState, "no ops");
        require(
            layer.currentState < maxState,
            "current state must be less than new max state"
        );

        layer.maxState = maxState;
    }

    /**
     * @dev Mints state layer
     */
    function mintLayer(
        address to,
        bytes memory _data,
        uint32 maxState,
        uint32 currentState,
        uint64 positionX,
        uint64 positionY
    ) public onlyOwner {
        uint256 layerID = layerCount;

        layers[layerID] = Layer(
            false,
            maxState,
            currentState,
            address(0),
            positionX,
            positionY
        );
        _safeMint(to, layerID, _data);

        layerCount++;
    }

    /**
     * @dev Mints module layer
     */
    function mintModuleLayer(
        address to,
        bytes memory _data,
        address module
    ) public onlyOwner {
        uint256 layerID = layerCount;

        require(module.isContract(), "module is not a valid contract");
        require(
            IERC165Upgradeable(module).supportsInterface(
                type(IModule).interfaceId
            ),
            "module does not satisfy IModule interface"
        );

        layers[layerID] = Layer(true, 0, 0, module, 0, 0);
        _safeMint(to, layerID, _data);

        layerID++;
    }

    /**
     * @dev Allows layer owner to burn token at id
     */
    function burn(uint256 id) public onlyLayerOwner(id) {
        _burn(id);
    }

    /**
     * @dev Base URI for computing {tokenURI}
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @dev Allow owner to set `baseURI`
     */
    function setBaseURI(string memory uri) public onlyOwner {
        baseURI = uri;
    }

    /**
     * @dev Throws if caller does not own layer of `id`
     */
    modifier onlyLayerOwner(uint256 id) {
        require(ownerOf(id) == msg.sender, "only layer owner");
        _;
    }

    /**
     * @dev Throws if layer `id` does not exist
     */
    modifier validLayerId(uint256 id) {
        require(id < layerCount, "layer is not created");
        _;
    }
}
