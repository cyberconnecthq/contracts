import 'module-alias/register';
import { expect } from './chai-setup';
import { utils } from 'ethers';
import { ethers, deployments } from 'hardhat';
import { CybertinoNFTV0 } from '@typechain/index';
import { Account, getAccounts, getContract } from '@utils/index';

describe('CybertinoNFT', () => {
  let nft: CybertinoNFTV0;
  let nftAdmin: CybertinoNFTV0;
  let nftPlatform: CybertinoNFTV0;
  const data = '0x';
  const baseUri = 'https://api.cybertino.com/metadata/';
  let deployer: Account, admin: Account, platformSigner: Account;
  beforeEach(async () => {
    [deployer, admin, platformSigner] = await getAccounts();
    let { CybertinoNFTV0 } = await deployments.fixture('CybertinoNFTV0');
    nft = await getContract(CybertinoNFTV0);
    nftAdmin = nft.connect(admin.wallet);
    nftPlatform = nft.connect(platformSigner.wallet);
  });
  describe('basic', async () => {
    it('has correct name', async () => {
      expect(await nft.name()).to.eq('CybertinoNFT');
    });
  });
  describe('access control', async () => {
    it('only owner could create new NFT', async () => {
      await expect(nft.create('random', data, 1)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
      await expect(nftAdmin.create('0001', data, 1))
        .to.emit(nftAdmin, 'URI')
        .withArgs(`${baseUri}0001`, 1);
      expect(await nft.id()).to.equal(1);
    });
  });
  describe('mint', async () => {
    it('cannot mint before created', async () => {
      await expect(
        nft.mint(deployer.address, 0, 0, 0, '0x', data)
      ).to.be.revertedWith('CybertinoNFT: invalid ID');
    });
    it('cannot mint 0', async () => {
      await nftAdmin.create('0001', data, 1);
      await expect(
        nft.mint(deployer.address, 1, 0, 0, '0x', data)
      ).to.be.revertedWith('CybertinoNFT: must mint at least one');
    });
    it('cannot mint more than max supply', async () => {
      await nftAdmin.create('0001', data, 1);
      await expect(
        nft.mint(deployer.address, 1, 2, 0, '0x', data)
      ).to.be.revertedWith('CybertinoNFT: exceeds max supply');
    });
    it('cannot mint without platform signature', async () => {
      await nftAdmin.create('0001', data, 1);
      await expect(
        nft.mint(deployer.address, 1, 1, 0, '0x', data)
      ).to.be.revertedWith('ECDSA: invalid signature length');
    });
    it('cannot mint with wrong nonce', async () => {
      await nftAdmin.create('0001', data, 1);
      const hash = await nft.getMessageHash(deployer.address, 1, 1, 0);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await deployer.wallet.signMessage(hashBytes);
      await expect(
        nft.mint(deployer.address, 1, 1, 1, signature, data)
      ).to.be.revertedWith('CybertinoNFT: invalid signature');
    });
    it('cannot mint with wrong signer', async () => {
      await nftAdmin.create('0001', data, 1);
      const hash = await nft.getMessageHash(deployer.address, 1, 1, 0);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await deployer.wallet.signMessage(hashBytes);
      await expect(
        nft.mint(deployer.address, 1, 1, 0, signature, data)
      ).to.be.revertedWith('CybertinoNFT: invalid signature');
    });
    it('can mint if signed by platform', async () => {
      await nftAdmin.create('0001', data, 1);
      const hash = await nft.getMessageHash(deployer.address, 1, 1, 0);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await platformSigner.wallet.signMessage(hashBytes);
      await expect(nft.mint(deployer.address, 1, 1, 0, signature, data))
        .to.emit(nft, 'TransferSingle')
        .withArgs(
          deployer.address,
          ethers.constants.AddressZero,
          deployer.address,
          1,
          1
        );
      expect(await nft.totalSupply(1)).to.equal(1);
      expect(await nft.maxSupply(1)).to.equal(1);
    });
    it('cannot mint already minted', async () => {
      await nftAdmin.create('0001', data, 2);
      const hash = await nft.getMessageHash(deployer.address, 1, 1, 0);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await platformSigner.wallet.signMessage(hashBytes);
      await expect(nft.mint(deployer.address, 1, 1, 0, signature, data))
        .to.emit(nft, 'TransferSingle')
        .withArgs(
          deployer.address,
          ethers.constants.AddressZero,
          deployer.address,
          1,
          1
        );
      await expect(
        nft.mint(deployer.address, 1, 1, 0, signature, data)
      ).to.revertedWith('CybertinoNFT: already minted');
      expect(await nft.totalSupply(1)).to.equal(1);
      expect(await nft.maxSupply(1)).to.equal(2);
    });
  });
  describe('batch mint', async () => {});
  describe('paused', async () => {});
});