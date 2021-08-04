import 'module-alias/register';
import { expect } from './chai-setup';
import { utils } from 'ethers';
import { ethers, deployments } from 'hardhat';
import { CMCLayerV0, MockAggregator } from '@typechain/index';
import { Account, getAccounts, getContract } from '@utils/index';

describe('CMCLayer', () => {
  let nft: CMCLayerV0;
  let nftAdmin: CMCLayerV0;
  let mock: MockAggregator;
  const data = '0x';
  let deployer: Account, admin: Account;
  beforeEach(async () => {
    [deployer, admin] = await getAccounts();
    let { CMCLayerV0, MockAggregator } = await deployments.fixture(
      'CMCLayerV0'
    );
    nft = await getContract(CMCLayerV0);
    nftAdmin = nft.connect(admin.wallet);
    mock = await getContract(MockAggregator);
  });
  describe('basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await nft.name()).to.eq('CybertinoCoinMarketCapLayerTest');
      expect(await nft.symbol()).to.eq('CYBER_CMC_LAYER_TEST');
    });
  });

  describe('create NFT', async () => {
    it('only owner could create new NFT', async () => {
      await expect(
        nft.create(deployer.address, ['001'], 0, data)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it('must include cid array', async () => {
      await expect(
        nftAdmin.create(deployer.address, [], 0, data)
      ).to.be.revertedWith('Err: Must provide 3 Content Identifier');
    });
    it('must use valid current state', async () => {
      await expect(
        nftAdmin.create(deployer.address, ['001', '002', '003'], 3, data)
      ).to.be.revertedWith('Err: Current State must be valid');
    });
    it('successfully create', async () => {
      await nftAdmin.create(deployer.address, ['001', '002', '003'], 0, data);
      expect(await nft.ownerOf(1)).to.equal(deployer.address);
    });
  });
  describe('verify hash', async () => {
    it('should get correct cid', async () => {
      await nftAdmin.create(deployer.address, ['001', '002', '003'], 0, data);
      expect(await nft.verifyCid(1, 0)).to.equal('001');
      expect(await nft.verifyCid(1, 1)).to.equal('002');
      expect(await nft.verifyCid(1, 2)).to.equal('003');
    });
  });
  describe('update according to chainlink price', async () => {
    it('should create layer first', async () => {
      await expect(nft.updateAll()).to.be.revertedWith('Err: no layer created');
    });
    it('first update should reset everything', async () => {
      await nftAdmin.create(deployer.address, ['001', '002', '003'], 0, data);
      await nft.updateAll();
      expect(await nft.lastPrice()).to.equal(100);
      const rst = await nft.getLayer(1);
      console.log(rst);
      expect(rst.stateCount).to.equal(3);
      expect(rst.currentState).to.equal(0);
    });
    it('every update should succeed', async () => {
      const ts = 1628031317;
      const interval = 24 * 60 * 60;
      // Price at 100 -> 0
      await nftAdmin.create(deployer.address, ['001', '002', '003'], 0, data);
      await nft.updateAll();
      expect(await nft.lastPrice()).to.equal(100);
      let rst = await nft.getLayer(1);
      expect(rst.stateCount).to.equal(3);
      expect(rst.currentState).to.equal(0);
      // Price move to 105 -> 1
      await mock.setPrice(105, ts + interval);
      await nft.updateAll();
      expect(await nft.lastPrice()).to.equal(105);
      rst = await nft.getLayer(1);
      expect(rst.stateCount).to.equal(3);
      expect(rst.currentState).to.equal(1);
      // price move to 100 -> 0
      await mock.setPrice(100, ts + interval * 2);
      await nft.updateAll();
      expect(await nft.lastPrice()).to.equal(100);
      rst = await nft.getLayer(1);
      expect(rst.stateCount).to.equal(3);
      expect(rst.currentState).to.equal(0);
      // price move to 95 -> 2
      await mock.setPrice(95, ts + interval * 3);
      await nft.updateAll();
      expect(await nft.lastPrice()).to.equal(95);
      rst = await nft.getLayer(1);
      expect(rst.stateCount).to.equal(3);
      expect(rst.currentState).to.equal(2);
    });
  });
  describe('test update interval', async () => {
    it('cannot update before interval passed', async () => {
      const ts = 1628031317;
      const interval = 24 * 60 * 60;
      // Price at 100 -> 0
      await nftAdmin.create(deployer.address, ['001', '002', '003'], 0, data);
      await nft.updateAll();
      expect(await nft.lastPrice()).to.equal(100);
      let rst = await nft.getLayer(1);
      expect(rst.stateCount).to.equal(3);
      expect(rst.currentState).to.equal(0);
      // Price move to 105 -> 1
      await mock.setPrice(105, ts + interval - 1);
      await expect(nft.updateAll()).to.be.revertedWith(
        'Err: must update after set interval'
      );
    });
  });
});
