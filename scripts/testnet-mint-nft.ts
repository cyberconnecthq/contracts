import 'module-alias/register';
import { ethers, deployments } from 'hardhat';
import { CybertinoNFTV0 } from '@typechain/index';
import { Account, getAccounts, getContract } from '@utils/index';

const main = async () => {
  let dep = await deployments.get('CybertinoNFTV0');

  const [deployer, admin, platformSigner] = await getAccounts();
  const nft: CybertinoNFTV0 = await getContract(dep);
  const idBig = await nft.id();
  const id = idBig.toNumber();
  console.log('ID', id);
  if (id === 0) {
    return;
  }
  const sigs = [];
  const ids = [];
  const amounts = [];
  const nonces = [];
  const datas = [];
  for (let i = 1; i <= id; i++) {
    const nonce = i;
    const id = i;
    const amount = 1;
    const hash = await nft.getMessageHash(admin.address, id, amount, nonce);
    const hashBytes = ethers.utils.arrayify(hash);
    const sig = await platformSigner.wallet.signMessage(hashBytes);
    ids.push(id);
    amounts.push(amount);
    sigs.push(sig);
    nonces.push(nonce);
    datas.push('0x');
  }
  await nft.batchMint(admin.address, ids, amounts, nonces, sigs, datas, {
    gasLimit: 10000000,
  });
  console.log('success');
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
