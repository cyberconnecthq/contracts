import { task } from 'hardhat/config';
import fs from 'fs';

const DEBUG = false;

function debug(text: any) {
  if (DEBUG) {
    console.log(text);
  }
}

task(
  'accounts',
  'Get balance informations for the first 3 accounts.'
).setAction(async (_, { ethers }) => {
  const accounts = await ethers.getSigners();

  for (let i = 0; i < 3; i++) {
    const account = accounts[i].address;
    console.log('‍📬 #' + i + ' Account is ' + account);
    const balance = await ethers.provider.getBalance(account);
    console.log('   balance: ' + ethers.utils.formatEther(balance));
    console.log(
      '   nonce: ' + (await ethers.provider.getTransactionCount(account))
    );
    console.log('===================');
  }
});

task(
  'generate',
  'Create a mnemonic for builder deploys',
  async (_, { ethers }) => {
    const mnemonic = ethers.utils.entropyToMnemonic(
      ethers.utils.randomBytes(16)
    );
    console.log(mnemonic.toString());
  }
);

task('pk')
  .addParam('mnemonic', 'mnemonic to get private keys from')
  .setAction(async ({ mnemonic }, { ethers }) => {
    let node = ethers.utils.HDNode.fromMnemonic(mnemonic);
    for (let i = 0; i < 3; i++) {
      const path = "m/44'/60'/0'/0/" + i;
      let wallet = node.derivePath(path);
      console.log('‍📬 #' + i + ' Account is ' + wallet.address);
      console.log('   pk: ' + wallet.privateKey);
      console.log('===================');
    }
  });
