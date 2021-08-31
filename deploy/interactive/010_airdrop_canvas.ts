import 'module-alias/register';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { CybertinoCanvasV0 } from '@typechain/index';
import { getAccounts, getContract, Account } from '@utils/index';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import type { Wallet } from 'ethers';

const addrs = [
  '0x475f69aA401DB9841B8199ea1309068B5e86E59B',
  '0x3dfd31dc29309e61f7346d01364d274fac2ebedd',
  '0xC42688c5Cf37FAab08DCD4225a4022d8B1bA982f',
  '0x12AC6aFCCe465F2DC93F1b3704be47d3422802e5',
  '0x5bC695867988C6a6a7852795A437e7EF539ee1e0',
  '0x3AfdfBFF3C3067E9c2C190152878f30b712F3C50',
  '0x67574f71236882D7223AeE10e39BeaA831c4F43F',
  '0xa1c4ea0c7a9cb35e8d23b853553e3cfbd736f2ff',
  '0xA22B5936F19459c8ecb1EB894282D4Cf61e81273',
  '0x92C321D56Bb396ef6BA8BbBd11Cd9B1012BA2fe0',
  '0x41De42fdAF0e2D7Fd77aCBb004e469F22a149f81',
  '0x88e930a9cf9fd69a1e816c55a29d1c6f5cbf28ba',
  '0x0eA38a1aD23Aa20132f29aCe81f7460019A4D134',
  '0xd1d239c66C28036F0124B9be3A8609da5d3c6751',
  '0x110B36f38c4021CB82aC5D746811599278efb672',
  '0x994821944Cd94Cbd70E4cA8875cE726A2537598D',
  '0x4a86b7274BA7B240e73BAA868f14771726f38d57',
  '0x3853f45285148967d3b8d89ffb517b960962faf7',
  '0xEd657E5Bc2ae43CF2b5eF448647Bb12a041ecB1A',
  '0xd8e8245b906B4bce4b6a68fd40dF1aDf3Bb29A40',
  '0xcbe630664e86c0ef01c94374e3678d5991db791d',
  '0x51340bce50319e1C252564a5b3706e8808ED0Ce5',
  '0x8981d399BDCDC76566e66FCe39AABD8B60592427',
  '0xc34c0D776D9E14593cBD769F38A2Cfbaf0A6A2BB',
  '0xaa0838e76e215ae11694a60831f72dcf4f52f98b',
  '0x6E4cB09281701617f53D6eEC1F7e64a6CdB1bD68',
  '0x9a4e4efabe8699f78b49734233264bf92daad4b8',
  '0xE1998C577C7cD55f9fb9F1CEB728133bC05F6a4F',
  '0xC06a9B6c2F64376D3c245C59815b498DD6594c7e',
  '0xF7a7bA0F4F8Fd4f561057C213E87901eec5E9B77',
  '0xd65D411876a7BA702801b62203FAa6A100061D5a',
  '0xb1913bFbfd1818c4D1a83d316003437185414FCd',
  '0x47Ca7EBC15374C094cf415920a72446812A43934',
  '0xf99993b171B201A6c7f247444c1DA07010e7A69d',
  '0x4aEb121aAf6b0AfDF04451434C9bE95124e6aBeD',
  '0x3F9D2732436C59a8BEE02c03da402E23214f5093',
  '0x4b92f2ea3d1b2ef4ff7d49ea7b06dbb0f03c9b46',
  '0xE78e083bdAa92BF50030a69cb93b113A08E53C05',
  '0xd07BD5460645B8Cd94253a22246568C23969cB82',
  '0x4cc89B6957DaE0B8105FDdbF16f938180c0F783c',
  '0x91850a4c968bf1a359cfce458c692e2ce4a25602',
  '0xaeb020348d5b14c8efbbc0a54d170c498d56fb8f',
  '0xBecF230a5Dc8352C69C68Da83d94A06bFF72356F',
  '0xb9FF126dc6fcAD18B064799AF9DCD5D6090D583B',
  '0xb4E584E9c8640458b28B830C9334686E5D362835',
  '0xBAE18381630A4DBCc2328e9306f0c288fcb262C1',
  '0xC365c49e739456f6CD1232fd6B3687d2ff922f51',
  '0x7FcdF94ec13032e44849991df0578C560fE0a7a0',
  '0xbB1edA2b17567f37d0944Fc00e14720d7BEB01bB',
  '0xc49cA49c622915Cc0136BFc27E2f8c7167564572',
  '0x465FCBaEafA5aB1792C997C1f56132E9E41FFFef',
  '0x01Ad71f4DF237F767cAd4C6Afdafd5DccB1fe64a',
  '0x4155c9Db22aAeB959A3C98464e75F2FE041E56a3',
  '0x941A549f0ebc120eC30C438949C780B991AB99b2',
  '0x33EaB43aFCf4d73E8420e2a8487b427415691f5f',
  '0x8F7e9db3b63ADC51DAE1304f79D74536E493CaAC',
  '0xd97Ac020318745190f2B2a332A81c659A0ac0b2e',
  '0x0eE5BE1b087f7eeAE082D63FDDe035014d59e036',
  '0xE31012460ad5D53e4A578fB3e02C139cF150B7a7',
  '0xbca179D0b6bC42A7620381597178773Aff5E0e20',
  '0xA6c5C717C55CE9C7353C0FCe4c122b4425454675',
  '0xe11Fe10D105791c41d52d35342A5aace29277637',
  '0x3efB651fE519eD57594B7A1bd9bB568d9d7CBd7C',
  '0xceA3785B9ec369535dbCaaf5314aaF9B3E51fEFE',
  '0x6569450ec8f0a7ecf52b0fbc007ec22739109909',
  '0x84692C2a8945CB643676bB67648A642913f94ed2',
  '0xE04995e23f320541a6F3e1a7F0cbaf776e4aAc27',
  '0x9db4ff853bde47c4202c8eaab31288ab3180f432',
  '0x5a5a2e9e16198843215eda579de71583a53e1fca',
  '0x26E510a00ccae59f9Fc27328Fc4f215d9BB3590A',
  '0x19Ea91823d1A991FeC682725041a652b14e29E70',
  '0xC03721532bB9E98c1569FbcF4F0eC680889C45be',
  '0xed9dB7b3a64E6d8C4bD5409a2978b4c3c2712083',
  '0x2a238f7d0c66447f0f6d22c3137af15b60082f2b',
  '0xf2D4e24C11880E226C579f5f5cA732293E4DCF38',
  '0x81769dee0Ed5056a25155B5263fDaaB5fB7D8A28',
  '0x0b8fd8318631410c00C4b854604E95dDA06Ba417',
  '0x11a10f787a3f14d895c3e254e3568964c1a8c666',
  '0xDE7A6963C658dc257dE99ecE847C54c7B847AcCA',
  '0xBf8A4c5627aE6F30f0578935F1f77251ceF0E873',
  '0xE042F4AEfb5c14148cBa79bb2E284617dA62E673',
  '0x6Ec9f5884394DB61Cc2f7b5Dc1c47bCc15B506c4',
  '0x634ac429341e7fa9d5b7080480A44F2bB32ABCB5',
  '0x1bdeb6cf85969c42e214bbe15e53b81f486011bb',
  '0xf64D896e4643d59e708Eb90f261A51FB6daCb21b',
  '0x57c0ec4BCfa948C35B745f04131C5c93bD551D6c',
  '0x3763F4c2e60Ac4d974A45623824980B1AC6D346D',
  '0x71841af2cb4003246ce9e7cacfce0297f643b21e',
  '0x47670856D3A49F92544e0003bC64Ee2ec9241B04',
  '0x4192cdF174B4946A7e8aB045904b7D1502B484Ca',
  '0xF4eAEB45f2d1e39e0A1f7326891c41c9e0572AD9',
  '0xD7921d7BB5Aab1Ba1489F3Ba1920b4Ee6aCb15Ee',
  '0x14BD0F8666dD2c55b45ce9Ed1562739be3ee1cD2',
  '0x164a2F23c8bDb7DA85892929a255893e67F260ce',
  '0x040c1a48b735a5255e4c96c32ceebda53be5c848',
  '0x427BdbF203fd70F3e5D8EB7dEAcA00585CE37ecB',
  '0x2cd951af78aab5d1281ea75c3da05c3c52653818',
  '0xa89bcdcfd3acb2aecaa67047e0a677e2cf95aedd',
  '0x459d266615ac08215084a73d177a2065b5ef2543',
  '0x21B5D3E8ee5F10B77b2681e40FC74c2D4EE35216',
];
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
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

  for (let i = 0; i < addrs.length; i++) {
    const id = 5;
    const nonce = 0;
    const amount = 1;
    const hash = await nft.getMessageHash(addrs[i], id, amount, nonce);
    const hashBytes = ethers.utils.arrayify(hash);
    const signature = await signer.signMessage(hashBytes);
    const tx = await nftAdmin.mint(
      addrs[i],
      id,
      amount,
      nonce,
      signature,
      '0x'
    );
    const receipt = await tx.wait();
    console.log(`finished ${i} at ${receipt.blockNumber}, address ${addrs[i]}`);
    const a = await nft.balanceOf(addrs[i], id);
    if (a.toNumber() !== 1) {
      console.log('ERRRRRRRRRRRRRRRRRRR');
      throw 'err';
    }
  }
  return true;
};

export default func;
func.tags = ['CybertinoCanvasCMCAirdrop', 'interactive', 'airdrop'];
func.dependencies = ['CybertinoCanvasBSCMigrate'];
func.id = '006_Airdrop_CybertinoCanvasCMC';
func.skip = async ({ network }) => {
  if (network.name === 'bsc' || network.name === 'bsc-testnet') {
    return true;
  }
  return false;
};
