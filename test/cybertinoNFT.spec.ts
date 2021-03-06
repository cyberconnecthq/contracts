import 'module-alias/register';
import { expect } from './chai-setup';
import { ethers, deployments } from 'hardhat';
import { CybertinoNFTV0 } from '@typechain/index';
import { Account, getAccounts, getContract } from '@utils/index';

describe('CybertinoNFT', () => {
  let nft: CybertinoNFTV0;
  let nftAdmin: CybertinoNFTV0;
  const data = '0x';
  const baseUri = 'https://api.stg.cybertino.io/metadata/nft/';
  let deployer: Account, admin: Account, platformSigner: Account;
  beforeEach(async () => {
    [deployer, admin, platformSigner] = await getAccounts();
    let { CybertinoNFTV0 } = await deployments.fixture('CybertinoNFTV0');
    nft = await getContract(CybertinoNFTV0);
    nftAdmin = nft.connect(admin.wallet);
  });
  describe('basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await nft.name()).to.eq('CybertinoNFTTest');
      expect(await nft.symbol()).to.eq('CYBER_NFT_TEST');
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
    it('only owner could change the base uri', async () => {
      await expect(nft.setURI('ipfs://ipfs/')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
      await nftAdmin.create('0001', data, 1);
      await nftAdmin.setURI('ipfs://ipfs/');
      expect(await nft.uri(1)).to.equal('ipfs://ipfs/0001');
    });
    it('only owner could pause', async () => {
      await expect(nft.pause()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
      await nftAdmin.pause();
      expect(await nft.paused()).to.be.true;
    });
  });
  describe('initializer', async () => {
    it('initialize could only be called once', async () => {
      await expect(
        nft.CybertinoNFT_init(
          'fakename',
          'fakeuri',
          'fakesymbol',
          ethers.constants.AddressZero,
          ethers.constants.AddressZero
        )
      ).to.revertedWith('Initializable: contract is already initialized');
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
        )
        .to.emit(nft, 'CybertinoMint')
        .withArgs(deployer.address, deployer.address, 1, 1, 0);
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
        )
        .to.emit(nft, 'CybertinoMint')
        .withArgs(deployer.address, deployer.address, 1, 1, 0);
      await expect(
        nft.mint(deployer.address, 1, 1, 0, signature, data)
      ).to.revertedWith('CybertinoNFT: already minted');
      expect(await nft.totalSupply(1)).to.equal(1);
      expect(await nft.maxSupply(1)).to.equal(2);
    });
  });
  describe('batch mint', async () => {
    it('could batch mint', async () => {
      await nftAdmin.create('0001', data, 2);
      await nftAdmin.create('0002', data, 3);
      const hash1 = await nft.getMessageHash(deployer.address, 1, 1, 0);
      const hashBytes1 = ethers.utils.arrayify(hash1);
      const signature1 = await platformSigner.wallet.signMessage(hashBytes1);
      const hash2 = await nft.getMessageHash(deployer.address, 2, 2, 1);
      const hashBytes2 = ethers.utils.arrayify(hash2);
      const signature2 = await platformSigner.wallet.signMessage(hashBytes2);
      await expect(
        nft.batchMint(
          deployer.address,
          [1, 2],
          [1, 2],
          [0, 1],
          [signature1, signature2],
          [data, data]
        )
      )
        .to.emit(nft, 'TransferSingle')
        .withArgs(
          deployer.address,
          ethers.constants.AddressZero,
          deployer.address,
          1,
          1
        )
        .to.emit(nft, 'TransferSingle')
        .withArgs(
          deployer.address,
          ethers.constants.AddressZero,
          deployer.address,
          2,
          2
        );
    });
  });
  describe('paused', async () => {
    it('paused contract cannot mint anymore', async () => {
      await nftAdmin.pause();
      await expect(
        nft.mint(deployer.address, 1, 1, 0, '0x', data)
      ).to.be.revertedWith('Paused');
    });
  });
  describe('batch create', async () => {
    const ids = [
      '001',
      '002',
      '003',
      '004',
      '005',
      '006',
      '007',
      '008',
      '009',
      '010',
    ];
    const maxSupplys = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
    const datas = [data, data, data, data, data, data, data, data, data, data];
    it('batch create should create same result', async () => {
      await nftAdmin.batchCreate(ids, datas, maxSupplys);
      expect(await nft.id()).to.equal(10);
    });
    // it('batch create gas report', async () => {
    // });
  });
});
