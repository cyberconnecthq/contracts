// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

interface IInfluencer is IERC1155Upgradeable {
    function Influencer_init(string memory newName, string memory uri) external;

    function Influencer_init_unchained(string memory newName) external;

    /**
     * @dev Sets influencer name to `newName`.
     */
    function setName(string memory newName) external;

    /**
     * @dev Mints new token for `amount` quantity and transfers it to `to`.
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    /**
     * @dev Mints batch of tokens for `amount` quantity and transfers it to `to`.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;

    /**
     * @dev Destroys `amount` number of `tokenId` from `account`.
     */
    function burn(
        address account,
        uint256 tokenId,
        uint256 amount
    ) external;

    /**
     * @dev Sets a new URI for all token types
     */
    function setURI(string memory uri) external;

    /**
     * @dev Grant `addr` Manager role
     */
    function grantManagerRole(address addr) external;

    /**
     * @dev Revoke `addr` Manager role
     */
    function revokeManagerRole(address addr) external;
}
