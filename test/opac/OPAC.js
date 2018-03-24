import ether from '../helpers/ether';
import { advanceBlock } from '../helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';

var OPAC = artifacts.require('OPAC');

contract('OPAC', function (accounts) {
  let opacInstance;
  var owner = accounts[0];
  var shareholders = [accounts[1],accounts[2],accounts[3],accounts[4]];
  it('should create an OPAC', async function () {

  });
});
