// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

contract Token {
  string public name = "DiBa Token";
  string public symbol = "DiBa";
  uint256 public decimals = 18;
  uint256 public totalSupply;

  constructor() public {
    totalSupply = 1000000 * (10 ** decimals);
  }
}
