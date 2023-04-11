import Head from "next/head";
import React, { useState, useCallback, useMemo } from "react";
import { initWeb3, initContract } from "../app/utils";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [proposalCount, setProposalCount] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onVoting, setOnVoting] = useState(false);
  const [onExecution, setOnExecution] = useState(false);
  const [toggle, setToggle] = useState(false);

  const handleConnectClick = useCallback(async () => {
    try {
      // Initialize Web3
      const web3 = await initWeb3();
      // Set connected flag and provider
      setConnected(true);
      // Set account
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      // Initialize contract
      const contract = await initContract(web3);
      setContract(contract);
      await getProposals(contract);
    } catch (error) {
      // Display error message
      alert(`Error connecting wallet: ${error.message}`);
    }
  }, []);

  // Fetch proposal counts on page load
  const getProposals = useCallback(async (contract) => {
    try {
      // Get proposal count
      const proposalCount = await contract.methods.proposalCount().call();
      setProposalCount(proposalCount);
    } catch (error) {
      // Display error message
      alert(`Error getting proposals count: ${error.message}`);
    }
  }, []);

  // Fetch proposals on page load
  const getAllProposals = useCallback(async () => {
    try {
      const proposalPromises = [];

      for (let i = 0; i < proposalCount; i++) {
        proposalPromises.push(contract.methods.Proposals(i).call());
      }

      const proposals = await Promise.all(proposalPromises);
      setProposals(proposals);
    } catch (error) {
      alert(`Error retrieving proposals: ${error.message}`);
    }
  }, [proposalCount, contract]);

  const createProposal = async () => {
    try {
      // Validate input
      setLoading(true);
      if (!title || !description) {
        alert("Please enter a title and description for the proposal.");
        await setLoading(false);
        return;
      }

      // Send the createProposal transaction
      const result = await contract.methods
        .createProposal(title, description)
        .send({ from: account });

      // Check for successful transaction
      if (result.status) {
        alert("Proposal created successfully");
        setLoading(false);
        setTitle("");
        setDescription("");
        // Fetch updated proposals
        await getAllProposals();
      } else {
        alert("Error creating proposal");
      }
    } catch (error) {
      alert(`Error submitting proposal: ${error.message}`);
    }
  };

  const toggleProposal = () => {
    setToggle(!toggle);
  };

  // Vote on a proposal
  const voteProposal = async (id, vote) => {
    try {
      setOnVoting(true);
      await contract.methods.voteOnProposal(id, vote).send({ from: account });
      setOnVoting(false);
    } catch (error) {
      setOnVoting(false);
      alert(`Error voting on proposal: ${error.message}`);
    }
  };

  // Execute a proposal
  const executeProposal = async (id) => {
    try {
      setOnExecution(true);
      await contract.methods.executeProposal(id).send({ from: account });
      await getAllProposals();
      setOnExecution(false);
    } catch (error) {
      setOnExecution(false);
      alert(`Error executing proposal: ${error.message}`);
    }
  };

  const sortedProposals = useMemo(() => {
    return proposals.sort((a, b) => {
      if (a.executed && !b.executed) {
        return 1;
      } else if (!a.executed && b.executed) {
        return -1;
      } else {
        return b.id - a.id;
      }
    });
  }, [proposals]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {connected ? (
          <div className={styles.proposalBody}>
            <div className={styles.proposalHeader}>
              <h1>Proposal</h1>
              <p>Current available Proposal Number: {proposalCount}</p>
            </div>
            <div className={styles.buttonsContainer}>
              <button
                className={`${styles.button} ${styles.topButton}`}
                onClick={getAllProposals}
              >
                View Proposals
              </button>
              <button
                className={`${styles.button} ${styles.topButton}`}
                onClick={toggleProposal}
              >
                Create Proposal
              </button>
            </div>
            {sortedProposals.map((proposal, index) => (
              <div key={index} className={styles.proposal}>
                <h3>{proposal.title}</h3>
                <p>{proposal.description}</p>
                <div>
                  <p>Votes Yes: {proposal.votesYes}</p>
                  <p>Votes No: {proposal.votesNo}</p>
                </div>
                <p className={styles.voteCounts}>
                  Executed: {proposal.executed ? "Yes" : "No"}
                </p>
                <div className={styles.operationButton}>
                  {proposal.executed ? null : (
                    <div className={styles.voteButtonsContainer}>
                      <button
                        className={`${styles.button} ${styles.yesButton}`}
                        onClick={() => voteProposal(proposal.id, 0)}
                        disabled={onVoting}
                      >
                        {onVoting ? "Voting..." : "Yes"}
                      </button>
                      <button
                        className={`${styles.button} ${styles.noButton}`}
                        onClick={() => voteProposal(proposal.id, 1)}
                        disabled={onVoting}
                      >
                        {onVoting ? "Voting..." : "No"}
                      </button>
                    </div>
                  )}

                  {proposal.owner == account && (
                    <button
                      className={styles.button}
                      onClick={() => executeProposal(proposal.id)}
                    >
                      {onExecution ? "Executing..." : "Execute"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {toggle ? (
              <div className={styles.proposal}>
                <h3>Create a Proposal</h3>
                <form>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Proposal Title</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      placeholder="Enter proposal title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Proposal Description
                    </label>
                    <textarea
                      className={styles.formTextarea}
                      placeholder="Enter proposal description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </form>
                <button className={styles.button} onClick={createProposal}>
                  {loading ? `Loading...` : `Submit Proposal`}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={styles.homepage}>
            <p className={styles.homePageP}>Welcome to BSC DAO</p>
            <p className={styles.homePageP2}>
              First connect your wallet to start
            </p>
            <button className={styles.button} onClick={handleConnectClick}>
              Connect
            </button>
          </div>
        )}
      </main>
    </>
  );
}
