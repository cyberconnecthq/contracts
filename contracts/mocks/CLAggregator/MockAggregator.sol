pragma solidity ^0.8.0;

contract MockAggregator  {
    int256 private _latestAnswer;
    uint256 private _timestamp;

    constructor (int256 _initialAnswer, uint256 _initialTs) public {
        _latestAnswer = _initialAnswer;
        _timestamp = _initialTs;
    }

    function latestRoundData() external view returns (uint80 roundID, int price, uint startedAt, uint timeStamp, uint80 answeredInRound) {
      price = _latestAnswer;
      timeStamp = _timestamp;
    }

    function setPrice(int256 _price, uint256 _newtimestamp) external {
      _latestAnswer = _price;
      _timestamp = _newtimestamp;
    }
}
