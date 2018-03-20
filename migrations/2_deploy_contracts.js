// const config = require('../truffle.js');
module.exports = function (deployer) {
  // deployer.deploy(Ownable);
};
// var CRWNRR_ReferralBasedCrowdsale = artifacts.require("./CRWNRR_ReferralBasedCrowdsale.sol");
// var CRWNRR_Token = artifacts.require("./CRWNRR_Token.sol");
// var SplitPayment = artifacts.require("./SplitPayment.sol");
//
//
//
// module.exports = function (deployer, accounts) {
//   const accounts = web3.eth.accounts;
//   const start = web3.eth.getBlock('latest').timestamp;
//   const finish = start + (84600 * 30);
//   const cap = ether(8888);
//   const lessThanCap = ether(60);
//   const initialRate = new BigNumber(9166);
//   const finalRate = new BigNumber(5500);
//   const minimumPurchase = ether(1);
//
//   return deployer.deploy(CRWNRR_Token, accounts[0]).then(() =>{
//     return CRWNRR_Token.deployed().then(async CRWNRR_TokenInstance => {
//       return deployer.deploy(SplitPayment, [accounts[1],accounts[2]], [15,15], {from: owner}).then(() => {
//         return SplitPayment.deployed().then(async SplitPaymentInstance => {
//           return deployer.deploy(CRWNRR_ReferralBasedCrowdsale, start, finish, initialRate, finalRate, cap, SplitPaymentInstance.address, CRWNRR_TokenInstance.address, minimumPurchase, {from: owner}).then(() => {
//             return CRWNRR_ReferralBasedCrowdsale.deployed().then(async crowdsaleInstance => {
//                 await CRWNRR_TokenInstance.transferOwnership(crowdsaleInstance.address, {from: owner});
//                 return deployer;
//             });
//           });
//         });
//       });
//     });
//   });
// };
//
// function deployPresaleContracts()
// {
//
// }
//
//
// function ether (n) {
//   return new web3.BigNumber(web3.toWei(n, 'ether'));
// }
