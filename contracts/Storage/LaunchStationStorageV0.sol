// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

contract LaunchNFTStorageV0 {
  // Signer for EIP-712
  address public signer;

  // hasMinted records if a specific whitelist record has been used.
  mapping(uint256 => bool) public hasMinted;
}
