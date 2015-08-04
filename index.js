'use strict';

let fs = require('fs');
let isc = require('ip-subnet-calculator');

const CIDR_PATH = './cn-aggregated.zone.txt';
const PAC_PATH = './whitelist.pac';
const PROXY = '127.0.0.1:1080';

let CIDRsFileContent = fs.readFileSync(CIDR_PATH);
let CIDRs = CIDRsFileContent.toString().split(/\n|\r\n/);

let ips = '';
CIDRs.forEach(function (CIDR) {
  if (CIDR) {
    let ipFormat = CIDR.split('/')[0];
    let ipPrefixSize = CIDR.split('/')[1];
    let ipMask = isc.calculateSubnetMask(ipFormat,ipPrefixSize).prefixMaskStr;

    ips += `  ['${ipFormat}', '${ipMask}'], \n`;
  }
})

let pacContent = `
/**
 * This PAC was generated by CIDR2PAC.
 * Last updated at ${new Date().toUTCString()}
 * More informations: https://github.com/wspl/CIDR2PAC
 */

var ipRange = [
${ips}
];

function isInside (host) {
  for (var i = 0; i < ipRange.length; i += 1) {
    if (isInNet(host, ipRange[i][0], ipRange[i][1])) {
      return true;
    }
  }
  return false;
}

function FindProxyForURL (url, host) {
  if (isInside(host)) {
    return 'DIRECT';
  } else {
    return 'PROXY ${PROXY}';
  }
}
`;

fs.writeFileSync(PAC_PATH, pacContent);

console.log('All done!');