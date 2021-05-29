import 'module-alias/register';
import { expect } from './chai-setup';
import { ethers, deployments } from 'hardhat';
import { LayerV0 } from '@typechain/index';
import { Account, getAccounts } from '@utils/index';

describe('Layer contract', () => {
  let layer: LayerV0;
  let owner: Account;
  let account1: Account;
  let layerU1: LayerV0;
  const data = '0x';
  before(async () => {
    [owner, account1] = await getAccounts();
    const { LayerV0 } = await deployments.fixture(['LayerV0']);
    layer = (await ethers.getContractAt(
      LayerV0.abi,
      LayerV0.address
    )) as LayerV0;
    await layer.__Layer_init(
      'test',
      'TEST',
      'https://images.cybertino.io/',
      owner.address
    );
    layerU1 = layer.connect(account1.wallet);
  });
  describe('basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await layer.name()).to.eq('test');
      expect(await layer.symbol()).to.eq('TEST');
    });

    it('has correct baseURI after mint', async () => {
      await layer.mintLayer(owner.address, data, 1, 0);
      expect(await layer.tokenURI(0)).to.eq('https://images.cybertino.io/0');
    });

    it('mint again should work', async () => {
      await layer.mintLayer(owner.address, data, 1, 0);
      expect(await layer.tokenURI(1)).to.eq('https://images.cybertino.io/1');
    });
  });

  describe('owner only', async () => {
    it('non owner cannot mint', async () => {
      expect(layerU1.mintLayer(owner.address, data, 1, 0)).to.be.revertedWith(
        'caller is not the owner'
      );
    });
  });
});
