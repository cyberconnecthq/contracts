import { task } from 'hardhat/config';

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
