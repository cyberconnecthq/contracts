// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../Interface/IModule.sol";

// Simple day night module
contract DayNightModule is Ownable, IModule {
    bool day;

    function set(bool day_) public onlyOwner {
        day = day_;
    }

    function getState() public view override returns (uint32) {
        if (day) {
            return 0;
        }
        return 1;
    }

    function getMaxState() public pure override returns (uint32) {
        return 2;
    }
}
