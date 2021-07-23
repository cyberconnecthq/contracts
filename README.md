# Cybertino Contracts

## Commands
Compile
```
yarn compile
```
Test
```
yarn test
```
Deploy
```
yarn deploy
yarn deploy:rinkeby
```
Etherscan veriy
```
yarn etherscan:rinkeby
```

## Deployed contracts address

Influencer (Canvas) contract address is in `./influencers/<network>/influencers.json`. Each influencer has a different contract address

Layer contract address is in `./deployments/<network>/LayerProxy.json`.

## Deployed ABIs

Influencer (Canvas) ABI is in `./deployments/<network>/InfluencerV0.json`.

Layer ABI is in `./deployments/<network>/LayerV0.json`


## Bug
- When you start the project or cleaned the cache with `npx hardhat clean`, the typechain generated files are missing. You have to comment out `import ‘./scripts/tasks` first in `hardhat.config.ts` and run `npx hardhat typechain` first and then uncomment the import statement.
- Cannot verify proxy contract for influencer beacon proxy on bscscan (mainnet and testnet) with code. The same works for rinkeby, so not sure what went wrong

# Functions
## Sign Influencer
```
npx hardhat sign-influencer --name <name> --network <network>
```

# Deployed contracts
- Deployed contracts address can be found at /deployments/<chain>
- Deployed influencer contract address can be found at /influencers/<chain>

## BSC mainnet contracts
- InfluencerBeacon at 0x2EB4dF9D3Dc95BAf947a685a628Ee53803218256
- InfluencerFactory at 0x7E71B525203f3e362371DA2eF4328E5e6F742b2d
- InfluencerV0 at 0xC78c2dbe2BEFBcdAC026E4043988b405F9CFcC04
- LayerProxy at 0x15a81e05110d28edF0Ed2F3D69a3f44B03192980
- LayerV0 at 0xf657Cf4f3fD674Df92bC938413e28B9bB45D7ED0
- Influencer (Cybertino) at 0x72290F51cD8bee08483ff4F9276151532da61cD7


# Cybertino NFT

## Structure
Cybertino NFT Contract is a pausable, ownable contract with a `owner`. It also has a `signer` which is used by Cybertino Platform to lazy mint NFTs.

Following [this](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies), Cybertino NFT Contract is deployed `TransparentUpgradeableProxy`, which has a `ProxyAdmin` contract to upgrade the proxy. `ProxyAdmin` contract has a `admin`.

In the end there are 3 special roles,
- Deployer/Admin: deploy and upgrades contract
- Contract Owner: can create new NFT, pause NFT minting process
- Signer: platform to sign off the lazy minting

## ABI info
`hardhat-deploy` creates a json file in `./deployments` folder under `CybertinoNFTV0.json` which has all the ABI information for the `Proxy` and `Implementation` details. In this file, you’ll find `address` as the proxy’s address, which is where all the transaction should be sent to. `implementation` contains the implementation contract’s address.

