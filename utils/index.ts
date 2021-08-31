import { ethers } from 'hardhat';
import { BigNumber } from '@ethersproject/bignumber';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { Deployment } from 'hardhat-deploy/dist/types';
import type { ethers as ethersType } from 'ethers';

type Address = string;

export type Account = {
  address: Address;
  wallet: SignerWithAddress;
};

const provider = ethers.provider;

export const getAccounts = async (): Promise<Account[]> => {
  const accounts: Account[] = [];

  const wallets = await getWallets();
  for (let i = 0; i < wallets.length; i++) {
    accounts.push({
      wallet: wallets[i],
      address: await wallets[i].getAddress(),
    });
  }

  return accounts;
};

// Use the last wallet to ensure it has Ether
export const getRandomAccount = async (): Promise<Account> => {
  const accounts = await getAccounts();
  return accounts[accounts.length - 1];
};

export const getEthBalance = async (account: Address): Promise<BigNumber> => {
  return await provider.getBalance(account);
};

// NOTE ethers.signers may be a hardhat specific function
export const getWallets = async (): Promise<SignerWithAddress[]> => {
  return (await ethers.getSigners()) as SignerWithAddress[];
};

export const getContract = async <T extends ethersType.Contract>(
  deployment: Deployment
): Promise<T> => {
  return (await ethers.getContractAt(deployment.abi, deployment.address)) as T;
};
