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
When you start the project or cleaned the cache with `npx hardhat clean`, the typechain generated files are missing. You have to comment out `import ‘./scripts/tasks` first in `hardhat.config.ts` and run `npx hardhat typechain` first and then uncomment the import statement.
