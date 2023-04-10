const BSCDAO = artifacts.require("DAOProposal");

contract("ProposalContract", (accounts) => {
  let daoContract;
  const owner = accounts[0];
  const user1 = accounts[1];
  beforeEach(async function () {
    daoContract = await BSCDAO.deployed();
  });
  describe("init", () => {
    it("should set proposal count to 0", async () => {
      const proposalCount = await daoContract.proposalCount();
      assert.equal(proposalCount, 0);
    });
  });

  describe("createProposal", () => {
    it("should create a proposal", async () => {
      await daoContract.createProposal("Test proposal", "Test description");
      const proposalCount = await daoContract.proposalCount();
      assert.equal(proposalCount, 1);
    });
  });

  describe("vote", () => {
    it("should vote for a proposal, yes", async () => {
      await daoContract.voteOnProposal(0, 0);
      const proposal = await daoContract.Proposals(0);
      assert.equal(proposal.votesYes, 1);
    });

    it("should vote for a proposal, no", async () => {
      await daoContract.voteOnProposal(0, 1);
      const proposal = await daoContract.Proposals(0);
      assert.equal(proposal.votesNo, 1);
    });

    it("should not vote for non-exist proposal", async () => {
      try {
        await daoContract.voteOnProposal(1, 1);
      } catch (err) {
        assert.equal(err.reason, "The proposal does not exist");
      }
    });

    it("should not allow to vote twice", async () => {
      try {
        await daoContract.voteOnProposal(0, 1);
      } catch (err) {
        assert.equal(err.reason, "You have already voted on this proposal");
      }
    });
  });

  describe("execute proposal", () => {
    it("should not execute proposal if not enough votes", async () => {
      try {
        await daoContract.executeProposal(0);
      } catch (err) {
        assert.equal(err.reason, "Proposal has not passed");
      }
    });

    it("should execute proposal if enough votes", async () => {
      await daoContract.voteOnProposal(0, 0);
      await daoContract.voteOnProposal(0, 0);

      await daoContract.executeProposal(0);
      const proposal = await daoContract.Proposals(0);
      assert.equal(proposal.executed, true);
    });

    it("only owner can execute proposal", async () => {
      try {
        await daoContract.executeProposal(0, { from: user1 });
      } catch (err) {
        assert.equal(err.reason, "You are not the owner of this proposal");
      }
    });

    it("should not execute proposal if already executed", async () => {
      try {
        await daoContract.executeProposal(0);
      } catch (err) {
        assert.equal(err.reason, "Proposal has already been executed");
      }
    });
  });
});
