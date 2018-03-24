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


const ROUX_Crowdsale = artifacts.require('ROUX_Crowdsale');
const ROUX_Token = artifacts.require('ROUX_Token');

contract('ROUX_Crowdsale', function  ([_, owner, investor, wallet, purchaser, thirdparty]) {
  const cap = ether(8888);
  const lessThanCap = ether(60);
  const value = ether(60);
  const initialRate = new BigNumber(9166);
  const finalRate = new BigNumber(5500);
  const rateAtTime150 = new BigNumber(9166);
  const rateAtTime300 = new BigNumber(9165);
  const rateAtTime1500 = new BigNumber(9157);
  const rateAtTime30 = new BigNumber(9166);
  const rateAtTime150000 = new BigNumber(8257);
  const rateAtTime450000 = new BigNumber(6439);

    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
      await advanceBlock();
    });

    beforeEach(async function () {
      this.openingTime = latestTime() + duration.weeks(1);
      this.closingTime = this.openingTime + duration.weeks(1);
      this.beforeEndTime = this.closingTime - duration.hours(1);
      this.afterClosingTime = this.closingTime + duration.hours(1);
      this.token = await ROUX_Token.new();
      this.crowdsale = await ROUX_Crowdsale.new(this.openingTime, this.closingTime, initialRate, finalRate, cap, wallet, this.token.address, {from: owner});
      await this.token.transferOwnership(this.crowdsale.address);
    });

    it('should not immediately assign tokens to beneficiary', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(0);
    });

    it('should not allow beneficiaries to withdraw tokens before crowdsale ends', async function () {
      await increaseTimeTo(this.beforeEndTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      await this.crowdsale.withdrawTokens({ from: investor }).should.be.rejectedWith(EVMRevert);
    });

    it('should allow beneficiaries to withdraw tokens after crowdsale ends', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.withdrawTokens({ from: investor }).should.be.fulfilled;
    });

    it('should return the amount of tokens bought', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.withdrawTokens({ from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(value.mul(initialRate));
    });

    it('should return the amount of tokens bought at time 450000', async function () {
      await increaseTimeTo(this.openingTime + 450000);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.withdrawTokens({ from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(value.mul(rateAtTime450000));
    });

    describe('accepting payments', function () {
      it('should accept payments within cap', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
        await this.crowdsale.send(lessThanCap).should.be.fulfilled;
      });

      it('should reject payments outside cap', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.send(cap);
        await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
      });

      it('should reject payments that exceed cap', async function () {
        await increaseTimeTo(this.openingTime);
        await this.crowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMRevert);
      });
    });
});
