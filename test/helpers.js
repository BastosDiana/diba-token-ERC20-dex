const EVM_REVERT = "VM Exception while processing transaction: revert";
const EVM_REVERT_BALANCE = "VM Exception while processing transaction: revert Insufficient balance";
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};

// Same as ether
const tokens = (n) => ether(n);

module.exports = {
  ether,
  EVM_REVERT,
  ETHER_ADDRESS,
  EVM_REVERT_BALANCE,
  tokens,
};
