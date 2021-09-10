import 'module-alias/register';
import { expect } from './chai-setup';
import { utils } from 'ethers';
import { ethers, deployments } from 'hardhat';
import { LaunchNFTV0, MockAggregator } from '@typechain/index';
import { Account, getAccounts, getContract } from '@utils/index';

describe('LaunchNFTV0', () => {
  let nft: LaunchNFTV0;
  let nftAdmin: LaunchNFTV0;
  let mock: MockAggregator;
  const data = '0x';
  let deployer: Account, admin: Account, signer: Account;
  const baseUri = 'https://api.babyrangers.io/baby/';
  beforeEach(async () => {
    [deployer, admin, signer] = await getAccounts();
    let { BabyRangerNFT } = await deployments.fixture('BabyRanger');
    nft = await getContract(BabyRangerNFT);
    nftAdmin = nft.connect(admin.wallet);
  });
  describe('basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await nft.name()).to.eq('Baby Ranger NFT');
      expect(await nft.symbol()).to.eq('BABY_RANGER');
    });
    it('has correct signer', async () => {
      expect(await nft.whitelistSigner()).to.eq(signer.address);
    });
  });
  describe('access control', async () => {
    it('only owner could withdraw', async () => {
      await expect(nft.withdraw()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('only admin could reserve', async () => {
      await expect(nft.reserve()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('only admin could flip minting state', async () => {
      await expect(nft.flipMintingState()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
    it('only admin could set base uri', async () => {
      await expect(nft.setBaseURI('new base')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });
  describe('mint', async () => {
    it('only after minting started', async () => {
      await expect(nft.mint(1)).to.be.revertedWith('Minting must be active');
    });
    it('no more than max per mint', async () => {
      await nftAdmin.flipMintingState();
      await expect(nft.mint(21)).to.be.revertedWith(
        'Cannot mint this many at a time'
      );
    });
    it('wrong amount of eth', async () => {
      await nftAdmin.flipMintingState();
      await expect(nft.mint(1)).to.be.revertedWith(
        'Ether value sent is not correct'
      );
    });
    it('Minting success, should have correct uri', async () => {
      await nftAdmin.flipMintingState();
      await expect(
        nft.mint(1, {
          value: ethers.utils.parseEther('0.09'),
        })
      )
        .to.emit(nft, 'Transfer')
        .withArgs(ethers.constants.AddressZero, deployer.address, 1);
      await nft.mint(20, {
        value: ethers.utils.parseEther('1.8'),
      });
      expect(await nft.id()).to.equal(21);
      expect(await nft.tokenURI(21)).to.equal(`${baseUri}21`);
    });
    it('cannot mint exceeding max supply', async () => {
      await nftAdmin.flipMintingState();
      for (let i = 0; i < 644; i++) {
        await nft.mint(20, {
          value: ethers.utils.parseEther('1.8'),
        });
      }
      expect(await nft.id()).to.equal(12880);
      await expect(nft.mint(20)).to.be.revertedWith(
        'Minting would exceed max supply'
      );
    });
  });
  describe('reserve', async () => {
    it('reserve before hitting max', async () => {
      await nftAdmin.reserve();
      expect(await nft.id()).to.equal(30);
      expect(await nft.mintedReserveNum()).to.equal(30);
      await nftAdmin.reserve();
      expect(await nft.id()).to.equal(60);
      for (let i = 0; i < 8; i++) {
        await nftAdmin.reserve();
        expect(await nft.id()).to.equal(90 + i * 30);
        expect(await nft.mintedReserveNum()).to.equal(90 + i * 30);
      }
    });
    it('cannot reserve if exceeding max', async () => {
      await nftAdmin.flipMintingState();
      for (let i = 0; i < 644; i++) {
        await nft.mint(20, {
          value: ethers.utils.parseEther('1.8'),
        });
      }
      expect(await nft.id()).to.equal(12880);
      await expect(nftAdmin.reserve()).to.be.revertedWith(
        'Reserving would exceed max supply'
      );
    });
  });
  describe('whitelist', async () => {
    it('whitelist must have correct batch size', async () => {
      await expect(nft.whitelistMint([1], [])).to.be.revertedWith(
        'Batch size mismatch'
      );
    });
    it('wrong amount of eth', async () => {
      await expect(nft.whitelistMint([1], ['0x'])).to.be.revertedWith(
        'Ether value sent is not correct'
      );
    });
    it('wrong signer', async () => {
      const hash = await nft.getMessageHash(deployer.address, 1);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await deployer.wallet.signMessage(hashBytes);
      await expect(
        nft.whitelistMint([1], [signature], {
          value: ethers.utils.parseEther('0.06'),
        })
      ).to.be.revertedWith('Invalid Signature');
    });
    it('whitelist mint successfully', async () => {
      const hash = await nft.getMessageHash(deployer.address, 1);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await signer.wallet.signMessage(hashBytes);

      const hash2 = await nft.getMessageHash(deployer.address, 2);
      const hashBytes2 = ethers.utils.arrayify(hash2);
      const signature2 = await signer.wallet.signMessage(hashBytes2);

      await expect(
        nft.whitelistMint([1, 2], [signature, signature2], {
          value: ethers.utils.parseEther('0.12'),
        })
      )
        .to.emit(nft, 'Transfer')
        .withArgs(ethers.constants.AddressZero, deployer.address, 1);
    });
    it('cannot whitelist mint exceeding max supply', async () => {
      await nftAdmin.flipMintingState();
      for (let i = 0; i < 644; i++) {
        await nft.mint(20, {
          value: ethers.utils.parseEther('1.8'),
        });
      }
      expect(await nft.id()).to.equal(12880);
      let signatureList: Array<string> = [];
      for (let i = 0; i < 9; i++) {
        const hash = await nft.getMessageHash(deployer.address, i+1);
        const hashBytes = ethers.utils.arrayify(hash);
        const signature = await signer.wallet.signMessage(hashBytes);
        signatureList.push(signature);
      }
      await expect(
        nft.whitelistMint([1, 2, 3, 4, 5, 6, 7, 8, 9], signatureList, {
          value: ethers.utils.parseEther('0.54'),
        })
      ).to.be.revertedWith('Minting would exceed max supply');
    });
    it('cannot mint already minted', async () => {
      const hash = await nft.getMessageHash(deployer.address, 1);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await signer.wallet.signMessage(hashBytes);

      const hash2 = await nft.getMessageHash(deployer.address, 2);
      const hashBytes2 = ethers.utils.arrayify(hash2);
      const signature2 = await signer.wallet.signMessage(hashBytes2);

      await expect(
        nft.whitelistMint([1, 2], [signature, signature2], {
          value: ethers.utils.parseEther('0.12'),
        })
      )
        .to.emit(nft, 'Transfer')
        .withArgs(ethers.constants.AddressZero, deployer.address, 1);
      await expect(
        nft.whitelistMint([1], [signature], {
          value: ethers.utils.parseEther('0.06'),
        })
      ).to.be.revertedWith(' Whitelist already claimed');
    });
  });
});
