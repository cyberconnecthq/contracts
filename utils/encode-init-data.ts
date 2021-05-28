import { ethers } from 'hardhat';

export const encodeInitData = async (
  contractName: string,
  initializer: string,
  args: string[]
) => {
  const ImplFactory = await ethers.getContractFactory(contractName);
  const allowNoInitialization = initializer === undefined && args.length === 0;
  initializer = initializer ?? 'initialize';
  try {
    const fragment = ImplFactory.interface.getFunction(initializer);
    return ImplFactory.interface.encodeFunctionData(fragment, args);
  } catch (e) {
    if (e instanceof Error) {
      if (allowNoInitialization && e.message.includes('no matching function')) {
        return '0x';
      }
    }
    throw e;
  }
};
