import axios from 'axios';
import 'dotenv/config';
import qs from 'qs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export async function submit(
  hre: HardhatRuntimeEnvironment,
  host: string,
  networkName: string
) {
  const layerProxy = require(`../deployments/${networkName}/LayerProxy.json`);
  const proxyAddr = layerProxy.address;
  console.log('Layer proxy at:', proxyAddr);
  return verify(hre, proxyAddr, host);
}

const verify = async (
  hre: HardhatRuntimeEnvironment,
  addr: string,
  host: string
) => {
  const apiKey = hre.config.etherscan.apiKey;
  if (apiKey === '') {
    console.error('Must provide ETHERSCAN_API_KEY');
    return;
  }

  const postData = {
    address: addr,
  };
  const rsp = await axios.request({
    url: `${host}/api?module=contract&action=verifyproxycontract&apikey=${apiKey}`,
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(postData),
  });
  console.log(rsp);
  if (rsp?.status != 200 || rsp.data.status != 1) {
    console.log(rsp);
    throw 'failed to verify proxy contracts on etherscan';
  }
  console.log(`Successfully verified proxy contract on scan at ${addr}`);
  return rsp;
};

export async function submitInfluencer(
  hre: HardhatRuntimeEnvironment,
  host: string,
  addr: string
) {
  return verify(hre, addr, host);
}

export async function submitInfluencerBeaconProxy(
  hre: HardhatRuntimeEnvironment,
  proxyAddr: string,
  beaconAddr: string,
  initData: string
) {
  return hre.run('verify:verify', {
    address: proxyAddr,
    constructorArguments: [beaconAddr, initData],
  });
}
