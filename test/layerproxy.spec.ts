import 'module-alias/register';
import { expect } from './chai-setup';
import { ethers, deployments } from 'hardhat';
import { LayerProxy, LayerV0 } from '@typechain/index';
import { Account, getAccounts } from '@utils/index';

describe('Layer Proxy contract', () => {
  let proxy: LayerV0;
  let layer: LayerV0;
  let proxyOwner: LayerV0;
  let proxyUser: LayerV0;
  let deployer: Account;
  let owner: Account;
  let user: Account;
  const data = '0x';
  before(async () => {
    [deployer, owner, user] = await getAccounts();
    // after fixture, owner is transferred already
    const { LayerProxy: layerProxy, LayerV0: layerV0 } =
      await deployments.fixture(['LayerProxy']);
    layer = (await ethers.getContractAt(
      layerV0.abi,
      layerV0.address
    )) as LayerV0;
    proxy = (await ethers.getContractAt(
      layerV0.abi,
      layerProxy.address
    )) as LayerV0;
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
        'https://api.cybertino.io/layer/0'
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
    // TODO
  });
});
