import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CybertinoCanvasV0 } from '@typechain/index';
import { getAccounts, getContract, Account } from '@utils/index';

const tokenCount = [3, 3, 15, 62, 167];

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { ethers } = hre;

  let signer: Account;

  const [deployer, admin, stgSigner] = await getAccounts();

  // FIXME: use a random address to depoy locally and test with
  let dep = await deployments.get('CybertinoCanvasV0');
  const nft: CybertinoCanvasV0 = await getContract(dep);
  const nftAdmin: CybertinoCanvasV0 = nft.connect(admin.wallet);

  if (network.tags['prd']) {
    // TODO:
    // signer = '';
    throw 'err';
  } else if (network.tags['stg'] || network.tags['prd-testnet']) {
    signer = stgSigner;
  } else {
    signer = stgSigner;
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
    const signature = await signer.wallet.signMessage(hashBytes);
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

  return true;
};

export default func;
func.tags = ['CybertinoCanvasCMC', 'interactive'];
func.dependencies = ['CybertinoCanvasCMC'];
func.id = '003_Mint_CybertinoCanvasCMC_Opensea';
