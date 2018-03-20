pragma solidity ^0.4.18;

import "./crowdsale/validation/CappedCrowdsale.sol";
import "./crowdsale/emission/MintedCrowdsale.sol";
import "./crowdsale/price/IncreasingPriceCrowdsale.sol";
import "./crowdsale/distribution/FinalizableCrowdsale.sol";
import "./crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "./crowdsale/validation/WhitelistedCrowdsale.sol";
import "./crowdsale/Crowdsale.sol";
import "./CRWNRR_Token.sol";
import './token/ERC20/MintableToken.sol';

contract CRWNRR_ReferralBasedCrowdsale is MintedCrowdsale, PostDeliveryCrowdsale, CappedCrowdsale, WhitelistedCrowdsale, IncreasingPriceCrowdsale
{
    using SafeMath for uint256;

    struct Backer {
      bool isValid;
      bool isReferralSource;
      uint256 discount;
      uint256 referralFee;
      address referredBy;
    }

    mapping(address => Backer) mBackers;

    uint256 mMinPurchaseAmount;
    uint256 mMaxReferralPercentageFee = 3;
    uint256 mMaxDiscount = 20;
    uint256 oneHundred = 100;

    /**
     * Event for token purchase logging
     * @param beneficiary who got the tokens
     * @param amount amount of tokens purchased
     */
    event DiscountTokensIssued(address indexed beneficiary, uint256 amount);
    event ReferralTokensIssued(address indexed beneficiary, uint256 amount);
    event ReferralAccountAdded(address indexed beneficiary);
    event ReferredAccountAdded(address indexed beneficiary, address indexed referredBy);
    /**
     * @dev Revertjhkrs _purchaseAmount is less than min purchase amount.
     */
    modifier meetsMinimumPurchase(uint256 _purchaseAmount) {
      require(_purchaseAmount >= mMinPurchaseAmount);
      _;
    }
    /**
     * @dev Reverts _referralSourceAddress is not present in mBackers.
     */
    modifier isNewReferral(address _referralSourceAddress) {
      require(!mBackers[_referralSourceAddress].isValid);
      _;
    }

    /**
     * @dev Reverts _referralSourceAddress is not present in mBackers.
     */
    modifier isValidReferral(address _referralSourceAddress) {
      require(mBackers[_referralSourceAddress].isValid);
      _;
    }

    /**
     * @dev Reverts _referralFee is more than max aloud fee.
     */
    modifier isValidReferralFee(uint256 _referralFee) {
      require(_referralFee <= mMaxReferralPercentageFee);
      require(_referralFee >= 0);
      _;
    }

    /**
     * @dev Reverts _discountPercentage is not within valid range.
     */
    modifier isValidDiscountPercentage(uint256 _discountPercentage) {
      require(_discountPercentage <= mMaxDiscount);
      require(_discountPercentage >= 0);
      _;
    }
    /**
     * @dev Constructor, takes crowdsale opening and closing times.
     * @param _openingTime Crowdsale opening time
     * @param _closingTime Crowdsale opening time
     * @param _initialRate Crowdsale closing time
     * @param _finalRate Crowdsale opening time
     * @param _cap Crowdsale closing time
     * @param _wallet Crowdsale opening time
     * @param _token Crowdsale closing time
    * @param _minimumPurchase minimum purchase
     */
    function CRWNRR_ReferralBasedCrowdsale(
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _initialRate,
    uint256 _finalRate,
    uint256 _cap,
    address _wallet,
    CRWNRR_Token _token,
    uint256 _minimumPurchase)
    public
    Crowdsale(_initialRate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
    IncreasingPriceCrowdsale(_initialRate, _finalRate)
    CappedCrowdsale(_cap)
    {
      mMinPurchaseAmount = _minimumPurchase;
    }

    /**
     * @dev Extend parent behavior requiring beneficiary to be in whitelist.
     * @param _beneficiary Token beneficiary
     * @param _weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount)
    internal meetsMinimumPurchase(_weiAmount) {
      super._preValidatePurchase(_beneficiary, _weiAmount);
    }

    /**
     * @dev Get percentage of a total value
     * @param totalAmount value equal to 100% of total quantity
     * @param percentage percentage as integer i.e. 3 == 3%
     */
    function getPercentageOf(uint256 totalAmount, uint256 percentage)
    public view returns(uint256)
    {
      return totalAmount.mul(percentage).div(oneHundred);
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
     * @param _beneficiary Address performing the token purchase
     * @param _tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount)
    internal {
      uint256 numTokensIssued =  _tokenAmount;
      if(mBackers[_beneficiary].isReferralSource)
      {
        if(mBackers[_beneficiary].discount > 0)
        {
          uint256 numExtraTokens = _tokenAmount.mul(mBackers[_beneficiary].discount).div(oneHundred);
          numTokensIssued = numExtraTokens.add(_tokenAmount);
          DiscountTokensIssued(_beneficiary, numExtraTokens);
        }
      }
      super._deliverTokens(_beneficiary, numTokensIssued);
    }

    /**
     * @dev Validation of an executed purchase. Observe state and use revert statements to undo rollback when valid conditions are not met.
     * @param _beneficiary Address performing the token purchase
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _postValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
      //issue reward to beneficiary's referral source account
      if(!mBackers[_beneficiary].isReferralSource)
      {
        uint256 numTokensIssued =  _getTokenAmount(_weiAmount);
        address referralSource = mBackers[_beneficiary].referredBy;
        //check if any fees need to be paid referral source
        if(mBackers[referralSource].referralFee > 0)
        {
          //calculate number of tokens to issue referral source
          uint256 referralTokenAmount = numTokensIssued.mul(mBackers[referralSource].discount).div(oneHundred);
          //issue tokens to purchaser's reference account
          _deliverTokens(referralSource, referralTokenAmount);
          //token.transfer(referralSource, referralTokenAmount);
          ReferralTokensIssued(referralSource, referralTokenAmount);
        }
      }
    }

    /**
     * @dev Can be overridden to add finalization logic. The overriding function
     * should call super.finalization() to ensure the chain of finalization is
     * executed entirely.
     */
    function finalization() internal
    {
      //Use payment splitter to issue tokens?
    }

    /**
     * @dev Adds single referral source address to whitelist
     * @param _beneficiary Address to be added to the whitelist
     * @param _discountPercentage discount percentage on token rate
     * @param _referralPercentageFee reward percentage of all referred token purchases
     */
    function addReferralAccount(address _beneficiary, uint256 _discountPercentage, uint256 _referralPercentageFee)
    isNewReferral(_beneficiary)
    isValidReferralFee(_referralPercentageFee)
    isValidDiscountPercentage(_discountPercentage)
    external onlyOwner
    returns (bool) {
        mBackers[_beneficiary].referralFee = _referralPercentageFee;
        mBackers[_beneficiary].isReferralSource = true;
        mBackers[_beneficiary].discount = _discountPercentage;
        mBackers[_beneficiary].referredBy = owner;
        mBackers[_beneficiary].isValid = true;
        whitelist[_beneficiary] = true;
        ReferralAccountAdded(_beneficiary);
        return true;
    }

    /**
     * @dev Adds single address to whitelist, as well as the address it was referred by.
     * @param _beneficiary Address to be added to the whitelist
     * @param _referralSource Address of for beneficiary
     */
    function addReferredAccount(address _beneficiary, address _referralSource)
    isValidReferral(_referralSource)
    external onlyOwner
    returns (bool)
    {
        mBackers[_beneficiary].referralFee = 0;
        mBackers[_beneficiary].isReferralSource = false;
        mBackers[_beneficiary].discount = 0;
        mBackers[_beneficiary].referredBy = _referralSource;
        mBackers[_beneficiary].isValid = true;
        whitelist[_beneficiary] = true;
        ReferredAccountAdded(_beneficiary, mBackers[_beneficiary].referredBy);
        return true;
    }

    /**
     * @dev Adds single address to whitelist.
     * @param _beneficiary Address to be added to the whitelist
     */
    function addToWhitelist(address _beneficiary) external onlyOwner {
      if(mBackers[_beneficiary].isValid)
      {
        whitelist[_beneficiary] = true;
      }
    }

    /**
     * @dev Removes single address from whitelist.
     * @param _beneficiary Address to be removed to the whitelist
     */
    function removeFromWhitelist(address _beneficiary) external onlyOwner {
      whitelist[_beneficiary] = false;
      mBackers[_beneficiary].isValid = false;
    }

    /**
     * @dev Adds list of addresses to whitelist. Not overloaded due to limitations with truffle testing.
     * @param _beneficiaries Addresses to be added to the whitelist
     */
    function addManyToWhitelist(address[] _beneficiaries) external onlyOwner {
      for (uint256 i = 0; i < _beneficiaries.length; i++) {
        if(mBackers[_beneficiaries[i]].isValid)
        {
          whitelist[_beneficiaries[i]] = true;
        }

      }
    }
}
