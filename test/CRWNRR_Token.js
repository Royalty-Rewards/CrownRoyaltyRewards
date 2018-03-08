// import regeneratorRuntime from "regenerator-runtime";
// var CRWNRR_Token = artifacts.require('./contracts/CRWNRR_Token.sol');
//
// contract('CRWNRR_Token_Test', function (accounts) {
//   let token;
//   let creator = accounts[0];
//   console.log(creator);
//
//   beforeEach(async function () {
//     token = await CRWNRR_Token.new(88888888);
//   });
//
//   it('should set a minting cap of 88888888', async function () {
//     let cap = await token.cap.call();
//     assert.equal(cap, 88888888);
//   });
//
//   it('should return mintingFinished false after construction', async function () {
//     let mintingFinished = await token.mintingFinished();
//     assert.equal(mintingFinished, false);
//   });
//
//   it('should mint a given amount of tokens to a given address', async function () {
//     const result = await token.mint(accounts[0], 100);
//     assert.equal(result.logs[0].event, 'Mint');
//     assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
//     assert.equal(result.logs[0].args.amount.valueOf(), 100);
//     assert.equal(result.logs[1].event, 'Transfer');
//     assert.equal(result.logs[1].args.from.valueOf(), 0x0);
//
//     let balance0 = await token.balanceOf(accounts[0]);
//     assert(balance0, 100);
//
//     let totalSupply = await token.totalSupply();
//     assert(totalSupply, 100);
//   });
//
// });
