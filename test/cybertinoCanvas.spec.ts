import 'module-alias/register';
import { expect } from './chai-setup';
import { utils } from 'ethers';
import { ethers, deployments } from 'hardhat';
import { CybertinoCanvasV0 } from '@typechain/index';
import { Account, getAccounts, getContract } from '@utils/index';

describe('CybertinoCanvas', () => {
  let nft: CybertinoCanvasV0;
  let nftAdmin: CybertinoCanvasV0;
  let nftPlatform: CybertinoCanvasV0;
  const data = '0x';
  const baseUri = 'https://api.stg.cybertino.io/metadata/nft/';
  let deployer: Account, admin: Account, platformSigner: Account;

  const addressOne = '0xF4A8f74879182FF2A07468508bec89e1E7464027';
  const addressTwo = '0xF4A8f74879182FF2a07468508BEC89e1E7464022';

  const createCanvas = () => {
    return nftAdmin.createCanvas(
      '0001',
      data,
      [
        {
          layer: addressOne,
          layerID: 11,
        },
        {
          layer: addressTwo,
          layerID: 12,
        },
      ],
      10
    );
  };

  beforeEach(async () => {
    [deployer, admin, platformSigner] = await getAccounts();
    let { CybertinoCanvasV0 } = await deployments.fixture('CybertinoCanvasV0');
    nft = await getContract(CybertinoCanvasV0);
    nftAdmin = nft.connect(admin.wallet);
    nftPlatform = nft.connect(platformSigner.wallet);
  });
  describe('basic', async () => {
    it('has correct name and symbol', async () => {
      expect(await nft.name()).to.eq('CybertinoInteractiveTest');
      expect(await nft.symbol()).to.eq('CYBER_INTERACTIVE_NFT_TEST');
    });
  });
  describe('access control', async () => {
    it('only owner could create new NFT', async () => {
      await expect(nft.createCanvas('random', data, [], 1)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
      await expect(createCanvas())
        .to.emit(nftAdmin, 'URI')
        .withArgs(`${baseUri}0001`, 1);
    });
    it('only owner could change the base uri', async () => {
      await expect(nft.setURI('ipfs://ipfs/')).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
      await createCanvas();
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

  describe('create Canvas', async () => {
    it('cannot create without cid', async () => {
      await expect(nftAdmin.createCanvas('', data, [], 1)).to.be.revertedWith(
        'Err: Missing Content Identifier'
      );
    });
    it('cannot create with 0 layers', async () => {
      await expect(
        nftAdmin.createCanvas('random', data, [], 1)
      ).to.be.revertedWith('Err: Must have at least one layer');
    });
    it('successfully create Canvas', async () => {
      await expect(createCanvas())
        .to.emit(nftAdmin, 'URI')
        .withArgs(`${baseUri}0001`, 1);
      expect(await nft.id()).to.equal(1);
      expect(await nft.maxSupply(1)).to.equal(10);
      expect(await nft.totalSupply(1)).to.equal(0);
      const canvas = await nft.canvases(1);
      expect(canvas.id).to.equal(1);
      expect(canvas.layerCount).to.equal(2);

      const layers = await nft.getLayerTokens(1);
      expect(layers[0]).to.eql([addressOne, addressTwo]);
      expect(layers[1][0]).to.equal(11);
      expect(layers[1][1]).to.equal(12);
    });
  });
  describe('mint', async () => {
    it('cannot mint before created', async () => {
      await expect(
        nft.mint(deployer.address, 0, 0, 0, '0x', data)
      ).to.be.revertedWith('CybertinoCanvas: invalid ID');
    });
    it('cannot mint 0', async () => {
      await createCanvas();
      await expect(
        nft.mint(deployer.address, 1, 0, 0, '0x', data)
      ).to.be.revertedWith('CybertinoCanvas: must mint at least one');
    });
    it('cannot mint more than max supply', async () => {
      await createCanvas();
      await expect(
        nft.mint(deployer.address, 1, 20, 0, '0x', data)
      ).to.be.revertedWith('CybertinoCanvas: exceeds max supply');
    });
    it('cannot mint without platform signature', async () => {
      await createCanvas();
      await expect(
        nft.mint(deployer.address, 1, 1, 0, '0x', data)
      ).to.be.revertedWith('ECDSA: invalid signature length');
    });
    it('cannot mint with wrong nonce', async () => {
      await createCanvas();
      const hash = await nft.getMessageHash(deployer.address, 1, 1, 0);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await deployer.wallet.signMessage(hashBytes);
      await expect(
        nft.mint(deployer.address, 1, 1, 1, signature, data)
      ).to.be.revertedWith('CybertinoCanvas: invalid signature');
    });
    it('cannot mint with wrong signer', async () => {
      await createCanvas();
      const hash = await nft.getMessageHash(deployer.address, 1, 1, 0);
      const hashBytes = ethers.utils.arrayify(hash);
      const signature = await deployer.wallet.signMessage(hashBytes);
      await expect(
        nft.mint(deployer.address, 1, 1, 0, signature, data)
      ).to.be.revertedWith('CybertinoCanvas: invalid signature');
    });
    it('can mint if signed by platform', async () => {
      await createCanvas();
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
      expect(await nft.maxSupply(1)).to.equal(10);
    });
    it('cannot mint already minted', async () => {
      await createCanvas();
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
      ).to.revertedWith('CybertinoCanvas: already minted');
      expect(await nft.totalSupply(1)).to.equal(1);
      expect(await nft.maxSupply(1)).to.equal(10);
    });
  });
  describe('batch mint', async () => {
    // TODO:
  });
  describe('paused', async () => {
    it('paused contract cannot mint anymore', async () => {
      await nftAdmin.pause();
      await expect(
        nft.mint(deployer.address, 1, 1, 0, '0x', data)
      ).to.be.revertedWith('Paused');
    });
  });
});
