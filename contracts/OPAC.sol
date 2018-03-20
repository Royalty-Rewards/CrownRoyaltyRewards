pragma solidity ^0.4.18;

import "./CRWNRR_Crowdsale.sol";
import "./Milestone.sol";
import "./MultiSigWallet.sol";
import "./math/SafeMath.sol";
import "./ownership/Ownable.sol";
import "./payment/SplitPayment.sol";
import "./crowdsale/distribution/utils/RefundVault.sol";
import "./CRWNRR_Token.sol";
import "./ReentrancyGuard.sol";
//Perhaps this should inherit from multisig as well?

contract OPAC is Ownable, ReentrancyGuard {
  using SafeMath for uint256;

  enum MilestoneType {
     UNKNOWN,
     DISCRETE,
     CONSENSUS,
     DEV
  }

  struct OPACMilestone {
    uint256 reward;
    Milestone milestone;
    string milestoneName;
    MilestoneType msType;
  }

  struct OPACOwner {
    MultiSigWallet wallet;
    uint256 shares;
  }

  struct OPACShareholder {
    MultiSigWallet wallet; // get balance to determine # of shares shareholder has
    uint256 contribution;
  }

  mapping(address => OPACOwner) mOwners;
  address[] mOwnerIndex;
  mapping (address => bool) public isOwner;

  mapping(address => OPACShareholder) mShareholders;
  mapping (address => bool) public isShareholder;

  //Used to disburse royalties, and rewards...
  SplitPayment mPaymentSplitter;

  address owner;

  //OPAC escrow wallet
  MultiSigWallet mEscrowWallet;
  /* MultiSigWallet mRefundWallet; */
  uint curActiveMilestone = 0;
  uint totalMilestones = 0;
  mapping(uint => OPACMilestone) mMilestones;

  CRWNRR_Token mToken;
  CRWNRR_Crowdsale mCrowdsale;

  // =================================================================================================================
  //                                      Events
  // =================================================================================================================


  event Deposit(address indexed sender, uint indexed value, bool indexed success);
  event Withdrawal(address indexed sender,  uint indexed value, bool indexed success);

  event TokensIssued(address indexed sender,  uint indexed value, bool indexed success);

  event OPACOwnerAdded(address indexed owner);
  event OPACOwnerRemoved(address indexed owner);

  event ShareholderAdded(address newOwner);
  event ShareholderRemoved(address indexed owner);

  event MilestoneComplete(uint transactionId, string milestoneName);
  event MilestoneFailed();

  event VoteRecorded(address indexed shareholder, bool indexed value);
  event VoteDenied(address indexed shareholder, bool indexed value);


  modifier milestoneExists(uint _milestoneIndex)
  {
    require(mMilestones[_milestoneIndex].milestone != address(0));
    _;
  }
  modifier isActiveShareholder(address inAddress)
  {
    require(isShareholder[inAddress]);
     _;
  }
  modifier isActiveOwner(address inAddress)
  {
    require(isOwner[inAddress]);
     _;
  }


// =================================================================================================================
//                                      OPAC Iterface
// =================================================================================================================

/**
 * @dev OPAC constructor function
 */
function OPAC(address[] opacOwnerWallets, uint[] sharePercentages)
{
  owner = msg.sender;
  if(opacOwnerWallets.length == sharePercentages.length)
  {
    //create escrow wallet
    address[] escrowWalletOwner;
    escrowWalletOwner.push(address(this));
    mEscrowWallet = new MultiSigWallet(escrowWalletOwner, 1);
    mPaymentSplitter = new SplitPayment(opacOwnerWallets, sharePercentages);
    /* mRefundWallet = new RefundVault(); */
    //create OPAC owner accounts/wallet
    for(uint i = 0; i < opacOwnerWallets.length; i++)
    {
      address[] walletOwnerAddr;
      walletOwnerAddr.push(opacOwnerWallets[i]);
      require(opacOwnerWallets[i] != address(0));
      mOwners[opacOwnerWallets[i]].wallet = new MultiSigWallet(walletOwnerAddr, 1);
      mOwners[opacOwnerWallets[i]].shares = sharePercentages[i];
      isOwner[opacOwnerWallets[i]] = true;
      mOwnerIndex.push(opacOwnerWallets[i]);
    }
  }
}

/**
 * @dev payable fallback function for receiving funds -> forwards directly to escrow wallet
 */
function () public payable
{
  require(msg.sender != address(0));
  require(msg.value > 0);
  mEscrowWallet.transfer(msg.value);
}

//TODO: Add generic execute function for firebase --> then function names can be passed through the ABI

// =================================================================================================================
//                                      OPAC Crowdsale Iterface
// =================================================================================================================

function getNumberOfShareholders()
{

}

function getTotalAmountFunded()
{

}

function getTotalFundsReleased()
{

}

/* function createCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _initialRate, uint256 _finalRate, uint256 _cap)
onlyOwner
internal returns(CRWNRR_Crowdsale)
{
  //should ony be able to call this ONE time!
  mToken = new CRWNRR_Token();
  mCrowdsale =  new CRWNRR_Crowdsale(_startTime, _endTime, _initialRate, _finalRate, _cap, mEscrowWallet, mToken);
  mToken.transferOwnership(mCrowdsale.address);
}

function buyTokens(address shareholderTokenWallet)
nonReentrant
external payable
{
  require(msg.sender != address(0));
  require(msg.value > 0);
  if(!isShareholder[msg.sender])
  {
    //create new wallet token for shareholder
    address[] walletOwnerAddr;
    walletOwnerAddr.push(msg.sender);
    mShareholders[msg.sender].wallet = new MultiSigWallet(walletOwnerAddr, 1);
    mShareholders[msg.sender].contribution = msg.value;
    isShareholder[msg.sender] = true;
  }
  else
  {
    mShareholders[msg.sender].contribution = mShareholders[msg.sender].contribution.add(msg.value);
  }
  mCrowdsale.buyTokens(mShareholders[msg.sender].wallet);
  //trigger deposit event
  Deposit(msg.sender, msg.value, true);
} */

// =================================================================================================================
//                                      OPAC Milestone Accessors
// =================================================================================================================

  function addMilestone(string milestoneName, uint milestoneIndex, string milestoneType)
  onlyOwner
  nonReentrant
  public returns(bool)
  {
    totalMilestones = totalMilestones.add(1);
    /*
    We need a reliable way of determining mileston order..
    Easiest way would be using an integer index value (use insertion sort?), however,
    we could also use a linked-list like structure where each node could point to the next, etc...

    Either way, if/when the order of the existing milestones is changed, some bookkeeping will
    need to be done
    */

  }

  function addDevMilestone(string milestoneName, uint milestoneIndex)
  onlyOwner
  nonReentrant
  public returns(bool)
  {

  }

  function beginMilestone(uint _milestoneIndex)
  milestoneExists(_milestoneIndex)
  public returns(bool)
  {
    require(isOwner[msg.sender]);
    require(_milestoneIndex == curActiveMilestone);
    return mMilestones[curActiveMilestone].milestone.beginProgress();
  }

  function getMilestoneStage(uint _milestoneIndex)
  milestoneExists(_milestoneIndex)
  public view returns(uint)
  {
    return mMilestones[curActiveMilestone].milestone.getStage();
  }

  /* function getCurrentMilestoneProgress()
  milestoneExists(curActiveMilestone)
  view returns(uint)
  {
    return mMilestones[curActiveMilestone].milestone.getProgress();
  } */

  function getNumberOfMilestones()
  public view returns(uint)
  {
      return totalMilestones;
  }

  function getCurrentMilestone()
  public view returns(uint)
  {
    return curActiveMilestone;
  }

  function totalMilestonesComplete()
  public view returns(uint)
  {
    return curActiveMilestone;
  }

  function updateMilestone(address milestoneShareholder, bool value, uint256 data)
  milestoneExists(curActiveMilestone)
  public returns(bool)
  {
    bool milestoneComplete = false;
    if(mMilestones[curActiveMilestone].msType == MilestoneType.DISCRETE)
    {
      require(isOwner[milestoneShareholder]);
      require(mMilestones[curActiveMilestone].milestone.getStage() == uint(1));
      milestoneComplete = mMilestones[curActiveMilestone].milestone.checkMilestone(data);
    }
    else
    if(mMilestones[curActiveMilestone].msType == MilestoneType.CONSENSUS)
    {
      require(isShareholder[milestoneShareholder]);
      require(mMilestones[curActiveMilestone].milestone.getStage() == uint(2));
      milestoneComplete = mMilestones[curActiveMilestone].milestone.vote(milestoneShareholder, value);
    }
    if(milestoneComplete)
    {
       releaseMilestoneRewards();
    }
    return milestoneComplete;
  }

  function releaseMilestoneRewards()
  onlyOwner
  internal
  {
      //retrieve reward amount
      uint reward = uint(mMilestones[completedMilestone].reward);
      string milestoneName = mMilestones[completedMilestone].milestoneName;
      uint completedMilestone = curActiveMilestone;
      curActiveMilestone = completedMilestone.add(1);
      //withdraw amount from escrow wallet, and distribute with payment splitter
      uint transactionId = mEscrowWallet.submitTransaction(address(mPaymentSplitter), reward, bytes(milestoneName));
      //transfer rewards to each owner accounts
      for(uint i = 0; i < mOwnerIndex.length; i++)
      {
        //This might be wrong, as the shareholder should pay for the transaction...
        /* mPaymentSplitter.claim(mOwnerIndex[i]); */
      }
      //Fire milestone complete event... Now, each person receiving rewards must claim their funds..
      MilestoneComplete(transactionId, milestoneName);
      //TODO: Check any for royalties that should be paid out as a result of milestone completion?
      //Calculate royalty amount based on CRWNRR balance in shareholders wallet
  }

}
