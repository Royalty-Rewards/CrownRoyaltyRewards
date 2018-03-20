import ether from '../helpers/ether';
import { advanceBlock } from '../helpers/advanceToBlock';
import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';

const BigNumber = web3.BigNumber;
const EVMRevert = "revert";
let goal = 500;
const INACTIVE = 0;
const INPROGRESS = 1;
const VERIFICATION = 2;
const COMPLETE = 3;

var Milestone = artifacts.require('Milestone');

contract('Milestone', function (accounts) {
  let milestone;
  var owner = accounts[0];
  var shareholders = [accounts[1],accounts[2],accounts[3],accounts[4]];

  it('should create discrete milestone', async function () {
    milestone = await Milestone.new("discreteMilestoneTest");
    await milestone.setDiscreteMilestone(10);
    let goal = await milestone.goal.call();
    goal = goal.toNumber();
    assert.equal(goal, 10);
  });

  it('should make sure discrete milestone amount cannot be changed', async function () {
    milestone = await Milestone.new("discreteMilestoneTest");
    await milestone.setDiscreteMilestone(10);
    let goal = await milestone.goal.call();
    goal = goal.toNumber();
    assert.equal(goal, 10);
    await milestone.setDiscreteMilestone(10).should.be.rejectedWith(EVMRevert);
  });

  it('should start discrete milestone progress', async function () {
    milestone = await Milestone.new("discreteMilestoneTest");
    await milestone.setDiscreteMilestone(10);
    let goal = await milestone.goal.call();
    goal = goal.toNumber();
    assert.equal(goal, 10);
    let started =  await milestone.startProgress();
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, 1);
  });

  it('should make sure milestone is not passed after updating', async function () {
    milestone = await Milestone.new("discreteMilestoneTest");
    await milestone.setDiscreteMilestone(10);
    let goal = await milestone.goal.call();
    goal = goal.toNumber();
    assert.equal(goal, 10);
    let started =  await milestone.startProgress();
    let isMet = await milestone.checkMilestone(9);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, 1);
    // let isMet = await milestone.checkMilestone(9);
    // assert.equal(isMet, false);
  });

  it('should update progress, and complete discrete milestone', async function () {
    milestone = await Milestone.new("discreteMilestoneTest");
    await milestone.setDiscreteMilestone(10);
    let goal = await milestone.goal.call();
    goal = goal.toNumber();
    assert.equal(goal, 10);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, 0);
    let started =  await milestone.startProgress();
    let isMet = await milestone.checkMilestone(11);
    assert.equal(isMet.logs[0].event, "MilestoneComplete");
  });

  it('should create consensus milestone, and make sure it is inactive',
  async function () {
    milestone = await Milestone.new("consensusMilestoneTest");
    //set milestone as consensus milestone (voting required to pass)
    await milestone.setConsensusMilestone(shareholders);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, INACTIVE);
  });

  it('should check the number of shareholders',
  async function () {
    milestone = await Milestone.new("consensusMilestoneTest");
    //set milestone as consensus milestone (voting required to pass)
    await milestone.setConsensusMilestone(shareholders);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, INACTIVE);

    let numShareholders =  await milestone.getNumberOfShareholders.call();
    numShareholders = numShareholders.toNumber();
    assert.equal(numShareholders, 4);
  });

  it('should check the voting weight of a shareholder',
  async function () {
    milestone = await Milestone.new("consensusMilestoneTest");
    //set milestone as consensus milestone (voting required to pass)
    await milestone.setConsensusMilestone(shareholders);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, INACTIVE);

    let numShareholders =  await milestone.getNumberOfShareholders.call();
    numShareholders = numShareholders.toNumber();
    assert.equal(numShareholders, 4);

    let totalShares =  await milestone.getTotalShares.call();
    assert.equal(totalShares, 4000000000000000000000000);
    let individualShares =  await milestone.getNumberOfSharesBelongingTo.call(accounts[1]);
    individualShares = individualShares.toNumber();
    totalShares = totalShares.toNumber();
    let weight = individualShares / totalShares;
    assert.equal(weight, 0.25);
  });

  it('should make sure that shareholder cannot vote before verification state',
  async function () {
    milestone = await Milestone.new("consensusMilestoneTest");
    //set milestone as consensus milestone (voting required to pass)
    await milestone.setConsensusMilestone(shareholders);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, INACTIVE);

    let numShareholders =  await milestone.getNumberOfShareholders.call();
    numShareholders = numShareholders.toNumber();
    assert.equal(numShareholders, 4);

    let totalShares =  await milestone.getTotalShares.call();
    assert.equal(totalShares, 4000000000000000000000000);
    let individualShares =  await milestone.getNumberOfSharesBelongingTo.call(accounts[1]);
    individualShares = individualShares.toNumber();
    totalShares = totalShares.toNumber();
    let weight = individualShares / totalShares;
    assert.equal(weight, 0.25);

    let started =  await milestone.startProgress();
    let isInProgress =  await milestone.getStage.call();
    isInProgress = isInProgress.toNumber();
    assert.equal(isInProgress, INPROGRESS);

    let voted =  await milestone.vote(accounts[1], true).should.be.rejectedWith(EVMRevert);;
  });

  it('should enable milestone verification',
  async function () {
    milestone = await Milestone.new("consensusMilestoneTest");
    //set milestone as consensus milestone (voting required to pass)
    await milestone.setConsensusMilestone(shareholders);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, INACTIVE);

    let numShareholders =  await milestone.getNumberOfShareholders.call();
    numShareholders = numShareholders.toNumber();
    assert.equal(numShareholders, 4);

    let totalShares =  await milestone.getTotalShares.call();
    assert.equal(totalShares, 4000000000000000000000000);
    let individualShares =  await milestone.getNumberOfSharesBelongingTo.call(accounts[1]);
    individualShares = individualShares.toNumber();
    totalShares = totalShares.toNumber();
    let weight = individualShares / totalShares;
    assert.equal(weight, 0.25);

    let started =  await milestone.startProgress();
    let isInProgress =  await milestone.getStage.call();
    isInProgress = isInProgress.toNumber();
    assert.equal(isInProgress, INPROGRESS);

    let verifiable =  await milestone.beginVerification();
    let isVerifiable =  await milestone.getStage.call();
    isVerifiable = isVerifiable.toNumber();
    console.log(isVerifiable);
    assert.equal(isVerifiable, VERIFICATION);
  });

  it('should make sure shareholder can vote after verification has begun',
  async function () {
    milestone = await Milestone.new("consensusMilestoneTest");
    //set milestone as consensus milestone (voting required to pass)
    await milestone.setConsensusMilestone(shareholders);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, INACTIVE);

    let numShareholders =  await milestone.getNumberOfShareholders.call();
    numShareholders = numShareholders.toNumber();
    assert.equal(numShareholders, 4);

    let totalShares =  await milestone.getTotalShares.call();
    assert.equal(totalShares, 4000000000000000000000000);
    let individualShares =  await milestone.getNumberOfSharesBelongingTo.call(accounts[1]);
    individualShares = individualShares.toNumber();
    totalShares = totalShares.toNumber();
    let weight = individualShares / totalShares;
    assert.equal(weight, 0.25);

    let started =  await milestone.startProgress();
    let isInProgress =  await milestone.getStage.call();
    isInProgress = isInProgress.toNumber();
    assert.equal(isInProgress, INPROGRESS);

    let verifiable =  await milestone.beginVerification();
    let isVerifiable =  await milestone.getStage.call();
    isVerifiable = isVerifiable.toNumber();
    console.log(isVerifiable);
    assert.equal(isVerifiable, VERIFICATION);

    let voted =  await milestone.vote(accounts[1], true);
    let voted2 =  await milestone.vote(accounts[2], true);
    let totalYesVotes =  await milestone.getTotalVotes.call(true);
    totalYesVotes = totalYesVotes.toNumber();
    let yesWeight = totalYesVotes / totalShares;
    assert.equal(yesWeight, 0.5);

  });

  it('should sure milestone is complete after voting consensus is reached',
  async function () {
    milestone = await Milestone.new("consensusMilestoneTest");
    //set milestone as consensus milestone (voting required to pass)
    await milestone.setConsensusMilestone(shareholders);
    let stage =  await milestone.getStage.call();
    stage = stage.toNumber();
    assert.equal(stage, INACTIVE);

    let numShareholders =  await milestone.getNumberOfShareholders.call();
    numShareholders = numShareholders.toNumber();
    assert.equal(numShareholders, 4);

    let totalShares =  await milestone.getTotalShares.call();
    assert.equal(totalShares, 4000000000000000000000000);
    let individualShares =  await milestone.getNumberOfSharesBelongingTo.call(accounts[1]);
    individualShares = individualShares.toNumber();
    totalShares = totalShares.toNumber();
    let weight = individualShares / totalShares;
    assert.equal(weight, 0.25);

    let started =  await milestone.startProgress();
    let isInProgress =  await milestone.getStage.call();
    isInProgress = isInProgress.toNumber();
    assert.equal(isInProgress, INPROGRESS);

    let verifiable =  await milestone.beginVerification();
    let isVerifiable =  await milestone.getStage.call();
    isVerifiable = isVerifiable.toNumber();
    console.log(isVerifiable);
    assert.equal(isVerifiable, VERIFICATION);

    let voted =  await milestone.vote(accounts[1], true);
    let voted2 =  await milestone.vote(accounts[2], true);
    let totalYesVotes =  await milestone.getTotalVotes.call(true);
    totalYesVotes = totalYesVotes.toNumber();
    let yesWeight = totalYesVotes / totalShares;
    assert.equal(yesWeight, 0.5);

    let voted3 =  await milestone.vote(accounts[3], true);
    let isComplete =  await milestone.getStage.call();
    isComplete = isComplete.toNumber();
    assert.equal(isComplete, COMPLETE);
  });

});
