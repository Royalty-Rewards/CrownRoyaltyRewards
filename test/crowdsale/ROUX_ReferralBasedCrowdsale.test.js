import ether from '../helpers/ether';
import { advanceBlock } from '../helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';

const BigNumber = web3.BigNumber;
const EVMRevert = "revert";

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const ROUX_ReferralBasedCrowdsale = artifacts.require('ROUX_ReferralBasedCrowdsale');
const ROUX_Token = artifacts.require('ROUX_Token');
const SplitPayment = artifacts.require('SplitPayment');
const SimpleSavingsWallet = artifacts.require('SimpleSavingsWallet');

contract('ROUX_ReferralBasedCrowdsale', function  ([_, owner, investor, referralSource, purchaser, referredAccount, owner1, owner2, authorized, unauthorized]) {
  const cap = ether(8888);
  const lessThanCap = ether(60);
  const accountStartingBalance = 1000000;
  const value = 100;
  const initialRate = new BigNumber(10000);
  const finalRate = new BigNumber(5000);
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
      this.ownerPercentages = [300, 100];
      this.openingTime = latestTime() + duration.weeks(1);
      this.closingTime = this.openingTime + duration.weeks(1);
      this.beforeEndTime = this.closingTime - duration.hours(1);
      this.afterClosingTime = this.closingTime + duration.hours(1);
      this.paymentSplitter = await SplitPayment.new(this.ownerArray, this.ownerPercentages);
      this.token = await ROUX_Token.new();
      this.crowdsale = await ROUX_ReferralBasedCrowdsale.new(
        this.openingTime,
        this.closingTime,
        initialRate,
        finalRate,
        cap,
        this.paymentSplitter.address,
        this.token.address,
        minimumPurchase,
        {from: owner});
      await this.token.transferOwnership(this.crowdsale.address);
    });

    it('should add a referral source account to whitelist', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.addReferralAccount(investor,  20, 3, { from: owner });
      await this.crowdsale.addToWhitelist(investor, { from: owner });
    });

    it('should add referred account to whitelist', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.addReferralAccount(authorized, 20, 3, { from: owner });
      await this.crowdsale.addReferredAccount(unauthorized, authorized, { from: owner });
    });

    it('should not add non-referred account to whitelist', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.addReferralAccount(authorized, 20, 3, { from: owner });
      await this.crowdsale.addReferredAccount(unauthorized, investor, { from: owner }).should.be.rejectedWith(EVMRevert);;
    });

    it('should not add accounts to whitelist unless they are already listed as referrals or reffered', async function () {
      await increaseTimeTo(this.beforeEndTime);
      await this.crowdsale.addToWhitelist(unauthorized, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

      describe('accepting payments', function () {


        it('should allow referral source to purchase tokens at discounted price', async function () {
          let purchaseAmount = ether(2);
          await increaseTimeTo(this.openingTime);
          let wallet1 = await SimpleSavingsWallet.new({from: referralSource});
          let referralSourceTokenWallet = wallet1.address;
          let wallet2 = await SimpleSavingsWallet.new({from: purchaser});
          let purchaserTokenWallet = wallet2.address;
          await this.crowdsale.addReferralAccount(referralSource, 20, 3, { from: owner });
          await this.crowdsale.addReferralAccount(purchaser, 5, 1, { from: owner });
          let res = await this.crowdsale.buyTokens(referralSource, { value: ether(1), from: referralSource });
          let res2 = await this.crowdsale.buyTokens(purchaser, { value: ether(100), from: purchaser });
          await increaseTimeTo(this.afterClosingTime);
          await this.crowdsale.withdrawTokens({ from: purchaser });
          await this.crowdsale.withdrawTokens({ from: referralSource });
          let balance = await this.token.balanceOf(referralSource);
          let balance2 = await this.token.balanceOf(purchaser);
          console.log("20% Discount Balance = " +  web3.fromWei(balance.toNumber(), "ether"));
          console.log("5% Discount Balance = " +  web3.fromWei(balance2.toNumber(), "ether"));
          await this.paymentSplitter.claim({from: owner1});
          await this.paymentSplitter.claim({from: owner2});
          console.log("75% OWNER BALANCE = " + (web3.fromWei(web3.eth.getBalance(owner1), "ether") - 1000000));
          console.log("25% OWNER BALANCE = " + ( web3.fromWei(web3.eth.getBalance(owner2), "ether") - 1000000));
        });

        it('should allow referred account to purchase tokens, then issue token fee to referral source', async function () {
          let purchaseAmount = ether(2);
          await increaseTimeTo(this.openingTime);
          await this.crowdsale.addReferralAccount(investor, 20, 3, { from: owner });
          await this.crowdsale.addReferredAccount(referredAccount, investor, { from: owner });
          let res = await this.crowdsale.buyTokens(investor, { value: ether(1), from: owner });
          let res2 = await this.crowdsale.buyTokens(referredAccount, { value: ether(100), from: owner });
          await increaseTimeTo(this.afterClosingTime);
          await this.crowdsale.withdrawTokens({ from: referredAccount });
          await this.crowdsale.withdrawTokens({ from: investor });
          let balance = await this.token.balanceOf(investor);
          let balance2 = await this.token.balanceOf(referredAccount);
          console.log("Referral Source BALANCE = " + web3.fromWei(balance.toNumber(), "ether"));
          console.log("Referred Account Balance BALANCE = " + web3.fromWei(balance2.toNumber(), "ether"));
          await this.paymentSplitter.claim({from: owner1});
          await this.paymentSplitter.claim({from: owner2});
          console.log("75% OWNER BALANCE = " + (web3.fromWei(web3.eth.getBalance(owner1), "ether") - 1000000));
          console.log("25% OWNER BALANCE = " +  (web3.fromWei(web3.eth.getBalance(owner2), "ether") - 1000000));
        });

      });

});
