import axios from 'axios';
import 'dotenv/config';
import qs from 'qs';

export async function submit(host: string, networkName: string) {
  const layerProxy = require(`../deployments/${networkName}/LayerProxy.json`);
  const proxyAddr = layerProxy.address;
  console.log('Layer proxy at:', proxyAddr);
  return verify(proxyAddr, host);
}

const verify = async (addr: string, host: string) => {
  const apiKey = process.env.ETHERSCAN_API_KEY;
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

export async function submitInfluencer(host: string, addr: string) {
  return verify(addr, host);
}
