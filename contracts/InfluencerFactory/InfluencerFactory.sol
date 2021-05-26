// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import "./../Interface/IInfluencer.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";

contract InfluencerFactory is Ownable {
    /**
     * @dev Stores all influencers contract address.
     */
    mapping(address => bool) private _signedInfluencers;

    /**
     * @dev Emitted when new influencer is signed.
     */
    event InfluencerSigned(string influencerName, address contractAddr);

    /**
     * @dev stores UpgradeableBeacon that points to Influencer implementation
     */
    IBeacon public beacon;

    constructor(address newBeacon) {
        require(Address.isContract(newBeacon), "beacon is not a contract");

        beacon = IBeacon(newBeacon);
    }

    /**
     * @dev Returns `true` if `influencer` is a signed influencer.
     */
    function isSignedInfluencer(address influencer) public view returns (bool) {
        return _signedInfluencers[influencer];
    }

    /**
     * @dev Create a new ERC1155 token for influencer and emits a {InfluencerSigned} event.
     */
    function signInfluencer(string memory name, string memory uri)
        public
        onlyOwner
        returns (BeaconProxy)
    {
        BeaconProxy proxy = new BeaconProxy(address(beacon), "");
        IInfluencer(address(proxy)).Influencer_init(name, uri);
        emit InfluencerSigned(name, address(proxy));
        _signedInfluencers[address(proxy)] = true;
        return proxy;
    }

    /**
     * @dev Grant `addr` Manager role in `influencer` contract
     */
    function grantManagerRole(address addr, IInfluencer influencer)
        public
        onlyOwner
        onlySignedInfluencer(address(influencer))
    {
        require(
            Address.isContract(address(influencer)),
            "beacon is not a contract"
        );

        influencer.grantManagerRole(addr);
    }

    /**
     * @dev Revoke `addr` Manager role in `influencer` contract
     */
    function revokeManagerRole(address addr, IInfluencer influencer)
        public
        onlyOwner
        onlySignedInfluencer(address(influencer))
    {
        require(
            Address.isContract(address(influencer)),
            "beacon is not a contract"
        );

        influencer.revokeManagerRole(addr);
    }

    /**
     * @dev Throws if `influencer` is not signed influencer.
     */
    modifier onlySignedInfluencer(address influencer) {
        require(_signedInfluencers[influencer], "signed influencer only");
        _;
    }
}
