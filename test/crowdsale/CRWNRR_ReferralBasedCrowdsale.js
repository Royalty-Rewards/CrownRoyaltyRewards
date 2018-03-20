import ether from '../helpers/ether';
import { advanceBlock } from '../helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
// import EVMRevert from '../helpers/EVMRevert';

const BigNumber = web3.BigNumber;
const EVMRevert = "revert";

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CRWNRR_ReferralBasedCrowdsale = artifacts.require('CRWNRR_ReferralBasedCrowdsale');
const CRWNRR_Token = artifacts.require('CRWNRR_Token');
const SplitPayment = artifacts.require('SplitPayment');

contract('CRWNRR_ReferralBasedCrowdsale', function  ([_, owner, investor, wallet, purchaser, thirdparty, owner1, owner2, authorized, unauthorized]) {
  const cap = ether(8888);
  const lessThanCap = ether(60);
  // const value = ether(1);
  const value = 100;
  const initialRate = new BigNumber(9166);
  const finalRate = new BigNumber(5500);
  const rateAtTime150 = new BigNumber(9166);
  const rateAtTime300 = new BigNumber(9165);
  const rateAtTime1500 = new BigNumber(9157);
  const rateAtTime30 = new BigNumber(9166);
  const rateAtTime150000 = new BigNumber(8257);
  const rateAtTime450000 = new BigNumber(6439);
  const minimumPurchase = ether(1);
    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
      await advanceBlock();
    });

    beforeEach(async function () {
      this.ownerArray = [owner1, owner2];
      this.ownerPercentages = [15, 15];
      this.openingTime = latestTime() + duration.weeks(1);
      this.closingTime = this.openingTime + duration.weeks(1);
      this.beforeEndTime = this.closingTime - duration.hours(1);
      this.afterClosingTime = this.closingTime + duration.hours(1);
      this.paymentSplitter = await SplitPayment.new(this.ownerArray, this.ownerPercentages);
      this.token = await CRWNRR_Token.new();
      this.crowdsale = await CRWNRR_ReferralBasedCrowdsale.new(this.openingTime, this.closingTime, initialRate, finalRate, cap, this.paymentSplitter.address, this.token.address, minimumPurchase, {from: owner});
      await this.token.transferOwnership(this.crowdsale.address);
    });

    it('should add a referral source account to whitelist', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.addReferralAccount(investor,  20, 3, { from: owner });
      await this.crowdsale.addToWhitelist(investor, { from: owner });
    });

      describe('accepting payments', function () {

        it('should add referral source to whitelist', async function () {
          await increaseTimeTo(this.openingTime);
          await this.crowdsale.addReferralAccount(investor, 20, 3, { from: owner });
          await this.crowdsale.addToWhitelist(investor, { from: owner });
        });

        it('sshould add referred source to whitelist', async function () {
          await increaseTimeTo(this.openingTime);
          await this.crowdsale.addReferralAccount(authorized, 20, 3, { from: owner });
          await this.crowdsale.addToWhitelist(authorized, { from: owner });
          await this.crowdsale.addReferredAccount(unauthorized, authorized, { from: owner });
          await this.crowdsale.addToWhitelist(unauthorized, { from: owner });
        });

        it('should allow referral source to purchase tokens at discounted price', async function () {
          let purchaseAmount = ether(2);
          await increaseTimeTo(this.openingTime);
          await this.crowdsale.addReferralAccount(investor, 20, 3, { from: owner });
          await this.crowdsale.addReferralAccount(purchaser, 10, 3, { from: owner });
          let res = await this.crowdsale.buyTokens(investor, { value: ether(500), from: owner });
          let res2 = await this.crowdsale.buyTokens(purchaser, { value: ether(300), from: owner });
          await increaseTimeTo(this.afterClosingTime);
          await this.crowdsale.withdrawTokens({ from: purchaser });
          await this.crowdsale.withdrawTokens({ from: investor });
          let balance = await this.token.balanceOf(investor);
          let balance2 = await this.token.balanceOf(purchaser);
          let funds = await this.paymentSplitter.claim({from: owner1});
        });

        it('should allow referred account to purchase tokens, then issue token fee to referral source', async function () {
          let purchaseAmount = ether(2);
          await increaseTimeTo(this.openingTime);
          await this.crowdsale.addReferralAccount(investor, 20, 3, { from: owner });
          await this.crowdsale.addReferredAccount(purchaser, investor, { from: owner });
          let res = await this.crowdsale.buyTokens(investor, { value: ether(1), from: owner });
          let res2 = await this.crowdsale.buyTokens(purchaser, { value: ether(300), from: owner });
          await increaseTimeTo(this.afterClosingTime);
          await this.crowdsale.withdrawTokens({ from: purchaser });
          await this.crowdsale.withdrawTokens({ from: investor });
          let balance = await this.token.balanceOf(investor);
          let balance2 = await this.token.balanceOf(purchaser);
          let funds = await this.paymentSplitter.claim({from: owner1});
        });

      });

});
