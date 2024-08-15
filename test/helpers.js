const EVM_REVERT = "VM Exception while processing transaction: revert Insufficient balance"

const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};

module.exports = {
  ether,
  EVM_REVERT
};
