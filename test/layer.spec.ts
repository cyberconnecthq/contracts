import 'module-alias/register';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { LayerV0 } from '@typechain/index';
import { Account, getAccounts } from '@utils/index';

describe('Layer contract', () => {
  let layer: LayerV0;
  let account1: Account;
  let account2: Account;
  const data = '0x';
  beforeEach(async () => {
    const layerFactory = await ethers.getContractFactory('LayerV0');
    layer = await layerFactory.deploy();
    await layer.__Layer_init('test', 'TEST', 'https://images.cybertino.io/');
    [account1, account2] = await getAccounts();
  });
  context('basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await layer.name()).to.eq('test');
      expect(await layer.symbol()).to.eq('TEST');
    });

    it('has correct baseURI', async () => {
      await layer.mintLayer(account1.address, data, 1, 0);
      expect(await layer.tokenURI(0)).to.eq('https://images.cybertino.io/0');
    });
  });

  context('mint Layer', async () => {
    // layer.mintLayer(account1);
  });
});
