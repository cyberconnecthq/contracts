// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface ILayer is IERC721Upgradeable {
    function __Layer_init(string memory name, string memory symbol, string memory uri, address owner) external;

    function getLayer(uint256 id)
        external
        view
        returns (uint32 maxState, uint32 currencyState);
}
