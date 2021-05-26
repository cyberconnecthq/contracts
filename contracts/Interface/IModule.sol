// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

interface IModule {
    function getState() external view returns (uint32);

    function getMaxState() external view returns (uint32);
}
