pragma solidity ^0.4.18;

import './token/ERC20/MintableToken.sol';

contract CRWNRR_Token is MintableToken {
  // Public variables of the token
  string public name = "CRWN_Royalty_Rewards";
  string public symbol = "CRWNRR";
  uint8 public decimals = 18;
  // 18 decimals is the strongly suggested default, avoid changing it
  /* function CRWNRR_Token( uint256 _cap )
  public
  CappedToken(_cap)
  {

  } */
}
