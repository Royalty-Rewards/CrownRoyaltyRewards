pragma solidity ^0.4.18;

import "../crowdsale/validation/CappedCrowdsale.sol";
import "../crowdsale/emission/MintedCrowdsale.sol";
import "../crowdsale/price/IncreasingPriceCrowdsale.sol";
import "../crowdsale/distribution/FinalizableCrowdsale.sol";
import "../crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "../crowdsale/Crowdsale.sol";
import "../token/ROUX_Token.sol";
import '../token/ERC20/MintableToken.sol';

contract ROUX_Crowdsale is MintedCrowdsale, PostDeliveryCrowdsale, IncreasingPriceCrowdsale, CappedCrowdsale
{
  function ROUX_Crowdsale(
  uint256 _openingTime,
  uint256 _closingTime,
  uint256 _initialRate,
  uint256 _finalRate,
  uint256 _cap,
  address _wallet,
  ROUX_Token _token)
  public
  Crowdsale(_initialRate, _wallet, _token)
  TimedCrowdsale(_openingTime, _closingTime)
  IncreasingPriceCrowdsale(_initialRate, _finalRate)
  CappedCrowdsale(_cap)
  {
  }

}
