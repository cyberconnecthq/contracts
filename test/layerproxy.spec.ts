import 'module-alias/register';
import { expect } from './chai-setup';
import { ethers, deployments } from 'hardhat';
import { LayerProxy, LayerV0, TestingLayerV1Struct } from '@typechain/index';
import LayerV1Json from '@artifacts/contracts/__testing__/testing__LayerV1_Struct.sol/__testing__LayerV1_Struct.json';
import { Account, getAccounts } from '@utils/index';

describe('Layer Proxy contract', () => {
  let proxy: LayerV0;
  let layerProxy: LayerProxy;
  let layer: LayerV0;
  let proxyOwner: LayerV0;
  let proxyUser: LayerV0;
  let deployer: Account;
  let owner: Account;
  let user: Account;
  const data = '0x';
  const zeroAddr = '0x0000000000000000000000000000000000000000';
  before(async () => {
    [deployer, owner, user] = await getAccounts();
    // after fixture, owner is transferred already
    const { LayerProxy: lp, LayerV0: layerV0 } = await deployments.fixture([
      'LayerProxy',
    ]);
    layer = (await ethers.getContractAt(
      layerV0.abi,
      layerV0.address
    )) as LayerV0;
    proxy = (await ethers.getContractAt(layerV0.abi, lp.address)) as LayerV0;
    layerProxy = (await ethers.getContractAt(lp.abi, lp.address)) as LayerProxy;
    proxyOwner = proxy.connect(owner.wallet);
    proxyUser = proxy.connect(user.wallet);
  });

  describe('proxy basic', async () => {
    it('deployer cannot call proxy impl', async () => {
      expect(proxy.name()).to.be.revertedWith(
        'admin cannot fallback to proxy target'
      );
    });
  });

  describe('layer basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await proxyOwner.name()).to.eq('cybertino_layer');
      expect(await proxyOwner.symbol()).to.eq('LAYER');
    });

    it('has correct baseURI', async () => {
      await proxyOwner.mintLayer(deployer.address, data, 1, 0);
      expect(await proxyOwner.tokenURI(0)).to.eq(
        'https://api.cybertino.io/metadata/layer/0'
      );
    });
  });

  describe('owner only', async () => {
    it('deployer is no longer owner', async () => {
      expect(
        proxyUser.mintLayer(deployer.address, data, 1, 0)
      ).to.be.revertedWith('caller is not the owner');
    });
  });

  describe('upgrade implementation', async () => {
    describe('layer struct', async () => {
      const tokenID = 1;
      const maxState = 10;
      const currentState = 8;
      let layerSProxyAdmin: TestingLayerV1Struct;

      before(async () => {
        // populate data in layerv0
        await expect(
          proxyOwner.mintLayer(user.address, data, maxState, currentState)
        )
          .to.emit(proxyOwner, 'Transfer')
          .withArgs(zeroAddr, user.address, tokenID);

        const LayerS = await ethers.getContractFactory(
          '__testing__LayerV1_Struct'
        );
        const layerS = await LayerS.deploy();

        await expect(layerProxy.upgradeTo(layerS.address))
          .to.emit(layerProxy, 'Upgraded')
          .withArgs(layerS.address);

        const layerSProxy = (await ethers.getContractAt(
          LayerV1Json.abi,
          layerProxy.address
        )) as TestingLayerV1Struct;
        layerSProxyAdmin = layerSProxy.connect(owner.wallet);
      });

      it('preserves data before upgrade', async () => {
        expect(await layerSProxyAdmin.balanceOf(user.address)).to.eq(1);
      });
    });
  });
});
