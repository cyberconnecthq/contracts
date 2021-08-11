# Cybertino NFT

## Structure
Cybertino NFT Contract is a pausable, ownable contract with a `owner`. It also has a `signer` which is used by Cybertino Platform to lazy mint NFTs.

Following [this](https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies), Cybertino NFT Contract is deployed `TransparentUpgradeableProxy`, which has a `ProxyAdmin` contract to upgrade the proxy. `ProxyAdmin` contract has a `admin`.

In the end there are 3 special roles,
- Deployer: deploy and upgrades contract
- Contract Owner: can create new NFT, pause NFT minting process
- Signer: platform to sign off the lazy minting for exporting

## ABI info
`hardhat-deploy` creates a json file in `./deployments` folder under `CybertinoNFTV0.json` which has all the ABI information for the `Proxy` and `Implementation` details. In this file, you’ll find `address` as the proxy’s address, which is where all the transaction should be sent to. `implementation` contains the implementation contract’s address.

## Optimization
- Use beacon for partner and official contracts or other potential new contracts. Easier to upgrade them all.

# Cybertino Interactive NFT

## Structure
Each Interactive NFT has two parts, one Canvas NFT in the form of ERC1155, one Layer NFT in the form of ERC721.
There will only be one Canvas contract for all the Cybertino Interactive NFTs, each Canvas NFT knows its composing layers with the identifiers `(layerContractAddress, layerNFTID)`. In this way, there will be multiple layers for different purposes. Each Layer has multiple states, each state representing.
The Canvas NFT’s metadata is currently controlled centralized for better user experience. Any updates to the layer will notify our backend to update the metadata of Canvas reflecting the change. You can find a good example of how all these work in the following section on Cybertino x CoinMarketCap


## Cybertino x CoinMarketCap 
There are 5 different NFTs for different rarity level. The following table shows the details.
| Token ID | Rarity | Max Supply |
| -------- | ------ | ---------- |
| 1 | Legendary | 10 |
| 2 | Special | 10 |
| 3 | Epic | 50 |
| 4 | Rare | 240 | 
| 5 | Common | 690 |

Each NFT has three states: "MOON", "HODL", and "FUD". If Bitcoin price is up more than 5% in the past 24 hours, the NFT will show the "MOON" state, and vice versa. If the price has no significant change, then the NFT will appear as "HODL". The state will refresh every 24 hours.

The way we achieve this state change is with our Interactive NFT structure described above. Each NFT is just an Canvas with one Layers, and each Layer stores three states in zero indexed array (0, 1, 2) respectively representing BTC price’s 24H change delta, (-5% < delta < 5%, delta > 5%, delta < -5%). At 24 hour intervals, the Layer contract queries Chainlink to get the current BTC price and calculate the correct new state. This state updating process is fully trustly and anyone could simply call `updateAll` on the Layer contract to trigger an update (however update is only successfully executed if 24 hour has passed since last update). To get the current state of the Layer, you could use `getLayer(id)`. Once the state changes, Cybertino server will pick up the change with `getLayer`, and change the image metadata for the NFT.

The metadata, or image, on the Canvas is updated once every 24 hour if the underlying Layer changes states. This process is done through centralized server to make sure that the correct new image is displayed on Cybertino and OpenSea. Although a central server is involved in changing the image, there are only 3 images that the server could chose from for each of the 5 NFTs, so the server could not arbitrarily modify anyone’s NFT. When the Layer token is created, its corresponding images for the 3 states (MOON, HOLD, FUD) are determined and uniquely identified by their IPFS CID. Anyone could download the image and calculate its IPFS CID and verify that they are in fact the same as stated in Layer Contract. To get the CID, use `verifyCid(layerID, index)` on the Layer Contract.
