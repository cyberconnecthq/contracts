import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CybertinoCanvasV0 } from '@typechain/index';
import { getAccounts, getContract, Account } from '@utils/index';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import type { Wallet } from 'ethers';

const tokenCount = [3, 3, 15, 62, 167];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // throw 'error';
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { ethers } = hre;

  let signer: Wallet | SignerWithAddress;

  const [deployer, admin, stgSigner] = await getAccounts();
  const prdSigner = ethers.Wallet.fromMnemonic(
    process.env.INTERACTIVE_SIGNER_MNEMONIC as string
  );

  // FIXME: use a random address to depoy locally and test with
  let dep = await deployments.get('CybertinoCanvasV0');
  const nft: CybertinoCanvasV0 = await getContract(dep);
  const nftAdmin: CybertinoCanvasV0 = nft.connect(admin.wallet);
  let requiredSigner: string;

  if (network.tags['prd']) {
    signer = prdSigner;
    requiredSigner = '0xc044d55E0b7bD3740FD1747491A0b3C0e5387E4B';
  } else if (network.tags['stg'] || network.tags['prd-testnet']) {
    signer = stgSigner.wallet;
    requiredSigner = stgSigner.address;
  } else {
    signer = stgSigner.wallet;
    requiredSigner = stgSigner.address;
  }

  if (signer.address !== requiredSigner) {
    throw 'Wrong signer';
  }

  const ids = [];
  const amounts = [];
  const nonces = [];
  const signatures = [];
  const datas = [];

  for (let i = 0; i < tokenCount.length; i++) {
    const id = i + 1;
    const nonce = 0;
    const amount = tokenCount[i];
    const hash = await nft.getMessageHash(admin.address, id, amount, nonce);
    const hashBytes = ethers.utils.arrayify(hash);
    const signature = await signer.signMessage(hashBytes);
    ids.push(id);
    amounts.push(amount);
    nonces.push(nonce);
    signatures.push(signature);
    datas.push('0x');
  }

  const tx = await nftAdmin.batchMint(
    admin.address,
    ids,
    amounts,
    nonces,
    signatures,
    datas
  );
  const receipt = await tx.wait();
  console.log(receipt.blockNumber);

  for (let i = 0; i < tokenCount.length; i++) {
    const id = i + 1;
    const amount = await nft.balanceOf(admin.address, id);
    console.log('token #', id, 'amount', amount.toString());
  }

  return true;
};

export default func;
func.tags = ['CybertinoCanvasCMCMint', 'interactive'];
func.dependencies = ['CybertinoCanvasCMCMigrate', 'CMCLayerMigrate'];
func.id = '003_Mint_CybertinoCanvasCMC_Opensea';
func.skip = async ({ network }) => {
  if (network.name === 'bsc' || network.name === 'bsc-testnet') {
    return true;
  }
  return false;
};
