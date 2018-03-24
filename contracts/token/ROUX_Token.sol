pragma solidity ^0.4.18;

import '../token/ERC20/MintableToken.sol';

contract ROUX_Token is MintableToken {
  // Public variables of the token
  string public name = "ROUX_Royalty_Rewards";
  string public symbol = "ROUX";
  uint8 public decimals = 18;
}
