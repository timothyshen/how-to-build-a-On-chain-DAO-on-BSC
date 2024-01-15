# Overview

An easy-to-understand tutorial for newbies to develop On-Chain DAO on BNB Smart Chain.

# What You Willl Learn

1. Set up a On-Chain DAO Dapps using BSC Truffle box
2. Deploying the DAO contract to Binance Smart Chain
3. Developing the frontend
4. Integrating the contract with the frontend
5. Testing the proposal and voting
6. Launching the DAO

# Technology Stack

- Node v16.19.1
- NPM v8.19.3
- Nextjs
- Truffle versions
    - Truffle v5.8.1 (core: 5.8.1)
    - Ganache
    - Solidity
    - Web3.js v1.6.1

# Setup

- **Clone the repository** `gh repo clone https://github.com/bnb-chain/bnb-chain-tutorial`
- **Change the current directory** `cd 05-Hello World Full Stack dApp on BSC`
- **Install all the dependencies** `npm install`
- Create a `.secret` file with the secret phrase of MetaMask.
- **Compile Smart Contracts** `truffle compile`
- **Migrate Smart Contracts** `truffle migrate --reset --network bscTestnet`
- **To run the frontend first run** `cd client`
- **Install all the dependencies** `npm install`
- **Create build** `npm run build`
- **Run the application** `npm run dev`

# Available Scripts

```bash
Compile:              truffle compile
Migrate:              truffle migrate
Test contracts:       truffle test
Test dapp:            cd client && npm test
Run dev server:       cd client && npm run start
Build for production: cd client && npm run buildNextJS:
```

# Structure

```bash
NFT Mint.
|   .env
|   .gitattributes
|   LICENSE
|   package-lock.json
|   package.json
|   README.md
|   truffle-config.js
|   yarn.lock
|            
+---client
|   \---app
|       \---components
|               CreateProposal.jsx \\ The component for creating the proposal
|               ViewProposal.jsx \\ The component for viewing the proposal
|   \---utils \\ all utilities
|       \---contracts       
|               DAOProposal.json \\ NFTCollection.sol's abi
|       |---index.js \\ utilities functions
|.  \---page
|.      |---index.js \\ main page for the mint
|
+---contracts
|       Proposal.sol
|       
+---migrations
|       1_deploy_contracts.js
|                    
+---test
|       mynftTest.js       
|
```

# Explanation

The project consists of two parts: the contract and the frontend. In the Web3 space, or the blockchain world, the traditional backend is typically replaced with the smart contract. In this tutorial, we will focus on building an On-chain DAO.

We will start with the smart contract part. A DAO, or Decentralized Autonomous Organization, is what makes an organization decentralized and automative. The proposal system is a key component of a DAO. Therefore, our aim is to create a smart contract that satisfies the following requirements:

- Allow users to create a proposal
- Allow users to vote on a proposal (agree or disagree)
- Allow the owner of the proposal to execute the proposal

For the frontend section, we have chosen to use the tech stack Next.js and web3.js. Next.js is a framework built on the react.js library, which helps us easily kickstart a website. Web3.js is a node package specifically designed to interact with the smart contract (alternatively, you can choose to use Hardhat). There are two main missions of web3.js: to create a provider and to encapsulate the contract object for the frontend to interact with. We have created an index.js file under the utils folder to manage all web3 initializations.

# How it Works

## Smart contract

- Make sure you have MetaMask installed and logged in on your browser.
- Make sure that your MetaMask wallet is correctly configured to connect to BSC Testnet. Refer to this [guide](https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain) for details.
    - For testnet development
        - Create a file named `.secret`, save your MetaMask Secret Phrase in this file.
    - For local environement
        - Run the command `ganache`, choose one of the private key shown in the command line to `.secret` file
- Run the command `truffle compile` to compile the smart contracts.
- Run the command `truffle migrate --reset --network bscTestnet` to deploy the contract on the BSC Testnet. Or Run the command `truffle migrate` for local environment.

## Frontend

- Run the command `cd client` to move to the frontend folder
- Create a `.env` include the following variables
    - If you want to use local environment
        - `MODE=”development”`
        - `LOCAL_NODE=“ws://localhost:8545”`
    - Add `CONTRACTADDRESS=<your contract address>`
- Run the command `npm install` to install all the dependencies
- Run the command `npm run dev` to start the server
- Now you are all set mint your first NFT on **BSC testnet** or **local environment**

## Running the application

- The default deployment for NextJs is [`http://localhost:3000/`](http://localhost:3000/) Open a browser and go to this URL
- Make sure that your MetaMask wallet is correctly installed and configured to connect to BSC Testnet. Refer to this [guide](https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain) for details.
- Select your desired account of MetaMask that has BNB Test tokens to perform transactions.
- To get test tokens use the [BNB Smart Chain Faucet](https://testnet.binance.org/faucet-smart).
- Click the ******************************Connect wallet****************************** button to connect the wallet first.
- Click the **Create proposal** button to create a proposal
    - You must add both title and description in order to create proposal
    - Confirm the transaction when MetaMask pops up.
- Click the **View all Proposals** button to view the proposal
    - If you are the owner, you will see the ****execute**** button
        - You can then click the button to execute, and then confirm on the MetaMask
    - Otherwise you can click on **Yes** or ******No****** button to make your vote
- Confirm the transaction when MetaMask notification pops up.

## Step by Step guide

Smart contract

### Design pattern

To create an On-chain DAO, we first analysis what basic functions we need. 

- create proposal - allow user to start a proposal
- vote proposal - vote a proposal
- execute proposal - terminate the vote

In this case, we implemented manual termination instead of using a time lock, you can always create a time lock to auto execute.

First we identify the information we need for a proposal

```solidity
struct Proposal {
        address owner;
        string title;
        string description;
        bytes32 proposalId;
        uint40 id;
        uint40 votesYes;
        uint40 votesNo;
        bool executed;
    }
enum Vote {yes, no}
```

The code defines a struct **`Proposal`**that contains the necessary information for a proposal, such as its owner, title, description, unique ID, number of votes for and against, and execution status.

```solidity
mapping (uint => Proposal) public Proposals;
uint40 public proposalCount = 0;
mapping (address => mapping(bytes32 => bool))  votes;
```

**`Proposals`** mapping: This mapping stores all the proposals created by members of the DAO. The key is the proposal ID, and the value is the **`Proposal`** struct.

**`proposalCount`** variable: This variable keeps track of the number of proposals created so far.

**`votes`** mapping: This mapping records whether a member has voted on a proposal. The key is a combination of the member's address and the proposal ID, and the value is a boolean flag indicating whether the member has voted or not.

```solidity
function createProposal(string memory _title, string memory _description) external returns (uint40){
    Proposal storage proposal = Proposals[proposalCount];
    proposal.owner = msg.sender;
    proposal.id = proposalCount; // we use the hash of the proposal index as the id to avoid collisions
    proposal.proposalId = keccak256(abi.encodePacked(proposalCount));
    proposal.title = _title;
    proposal.description = _description;
    proposal.executed = false;
    proposalCount++;
    return proposalCount - 1;
}
```

**`createProposal`** function: This function allows any member of the DAO to create a new proposal. The function takes two parameters - the title and description of the proposal - and returns the ID of the new proposal. The function creates a new **`Proposal`** struct, sets its properties, and adds it to the **`Proposals`** mapping.

```solidity
function voteOnProposal(uint40 proposalIndex, Vote vote) external  {
    Proposal storage proposal = Proposals[proposalIndex];
    require(proposal.owner != address(0), "The proposal does not exist");
    require(votes[msg.sender][proposal.proposalId] == false, "You have already voted on this proposal");
    if (vote == Vote.yes) {
        proposal.votesYes++;
    } else {
        proposal.votesNo++;
    }
    votes[msg.sender][keccak256(abi.encodePacked(proposalIndex))] = true;
}
```

**`voteOnProposal`** function: This function allows members to vote on a proposal. The function takes two parameters - the ID of the proposal and the member's vote (yes or no). The function first checks whether the member has already voted on the proposal. If not, the function updates the vote count of the proposal and records the member's vote in the **`votes`** mapping.

```solidity
function executeProposal(uint40 proposalIndex) external {
    Proposal storage proposal = Proposals[proposalIndex];
    // require(proposal.id != 0, "Proposal does not exist");
    require(proposal.owner == msg.sender, "You are not the owner of this proposal");
    require(proposal.votesYes > proposal.votesNo, "Proposal has not passed");
    require(proposal.executed == false, "Proposal has already been executed");
    proposal.executed = true;
}
```

**`executeProposal`** function: This function allows the owner of a proposal to execute it if the proposal has passed (more votes for than against) and has not already been executed. The function takes one parameter - the ID of the proposal. The function first checks whether the owner of the proposal is calling the function and whether the proposal has passed and has not already been executed. If these conditions are met, the function sets the **`executed`** flag of the proposal to true.

**Deployment**

```jsx
module.exports = {
  contracts_build_directory: path.join(__dirname, "client/app/utils/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    bscTestnet: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://data-seed-prebsc-2-s1.binance.org:8545`
        ),
      network_id: 97,
      confirmations: 2,
      //timeoutBlocks: 200,
      skipDryRun: true,
    },
    bscMainnet: {
      provider: () =>
        new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.13",
    },
  },
  db: {
    enabled: false,
  },
};
```

This is a configuration file for the Truffle development framework for Ethereum.

The **`contracts_build_directory`** specifies the location where the compiled contract artifacts should be stored. In here we pointed to the client folder.

The **`networks`** object defines the different Ethereum networks to which the contracts can be deployed. In this case, there are three networks specified:

- **`development`**: a local development network running on **`localhost:8545`**.
- **`bscTestnet`**: the Binance Smart Chain testnet with network ID 97 and a custom RPC endpoint.
- **`bscMainnet`**: the Binance Smart Chain mainnet with network ID 56 and a custom RPC endpoint.

Each network has its own configuration options, such as the network ID, provider, and confirmation settings.

The **`compilers`** object specifies the version of the Solidity compiler that should be used to compile the smart contracts.

Finally, the **`db`** object specifies whether or not the framework should use a database for caching contract artifacts. In this case, database usage is disabled.

### Frontend

To interact with the smart contract, we need to create an interface that allows us to send transactions and read data from the smart contract. This interface will be created in the frontend part of our project using technologies such as `Next.js` and `web3.js`. Once we have created the interface, we can use it to create and vote on proposals, as well as execute them if they have received enough votes.

First install `Nextjs` and `Web3js`

```bash
npm install -g next@latest web3js
```

Create a Nextjs project

```bash
mkdir client
cd client
npx create-next-app@latest
npm run dev //start the server
```

Now you can see the starting page at `http://localhost:3000`

First we start with the util file first create a `index.js` file under the path `app/util` in this file we will code two functions `initWeb3` and `initContract`

```jsx
import Web3 from "web3";
import DAOProposal from "./contracts/DAOProposal.json";

export const initWeb3 = async () => {
  if (process.env.MODE == "development") {
    return new Web3(process.env.LOCAL_NODE); //for local development
  } else if (typeof window.ethereum === "undefined") {
    alert("Install MetaMask");
  } else {
    let web3 = new Web3(window.ethereum || "ws://localhost:8545");
    console.log(web3.currentProvider);
    await window.ethereum.enable();
    return web3;
  }
};

export const initContract = async (web3) => {
  return new web3.eth.Contract(DAOProposal.abi, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
};
```

**`initWeb3`**: This function initializes the **`Web3`** provider based on the environment mode. If the mode is set to "development," it returns a new **`Web3`** instance that points to a local node defined in the environment variables. Otherwise, it checks whether **`window.ethereum`** is defined (i.e., if the user has MetaMask installed). If it is defined, the function enables the Ethereum provider and returns a new **`Web3`** instance. If it is not defined, the function alerts the user to install MetaMask.

**`initContract`**: This function initializes the DAOProposal contract using the **`Web3`** instance passed as an argument. It returns a new instance of the contract using the contract ABI and the contract address defined in the environment variables.

Moving on to the UI part, all code will be stored within the `index` file under the `page` folder.

Before defining the file structure, we must first define the style.

```css
.homepage {
  text-align: center;
  height: 95vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
  margin: auto;
}

.homePageP {
  font-size: 2rem;
  margin-bottom: 20px;
}

.homePageP2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.proposalBody {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.proposalHeader {
  margin-bottom: 1rem;
  text-align: center;
}

.buttonsContainer {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.proposal {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 50rem;
}

.formGroup {
  margin-bottom: 1rem;
}

.formLabel {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.formInput,
.formTextarea {
  width: 90%;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  background-color: black;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid black;
  transition: background-color 0.2s ease-in-out;
}

.topButton {
  margin: 0 0.5rem;
}

.yesButton {
  background-color: green;
  border: 1px solid green;
  margin-right: 1rem;
}

.noButton {
  background-color: red;
  border: 1px solid red;
  margin-right: 1rem;
}

.button:hover {
  background-color: white;
  color: black;
  border: 1px solid black;
}

.voteCounts {
  margin-bottom: 1rem;
}

.operationButton {
  display: flex;
}
```

You need to store this code in a file called `Home.module.css` under the `styles` folder.

The main body

```jsx
import Head from "next/head";
import React, { useState, useCallback, useMemo } from "react";
import { initWeb3, initContract } from "../app/utils";
import styles from "@/styles/Home.module.css";
```

We imports **`Head`** from the **`next/head`**  module for managing the document head, **`React`** and several hooks from the **`react`** module for managing component state and performing side effects, and **`initWeb3`** and **`initContract`** from a custom module **`../app/utils`** for initializing the Web3 library and smart contract. Finally, it imports a CSS module **`@/styles/Home.module.css`** for styling the component.

```jsx
const [connected, setConnected] = useState(false);
const [contract, setContract] = useState(null);
const [account, setAccount] = useState(null);
const [proposalCount, setProposalCount] = useState(0);
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [proposals, setProposals] = useState([]);
const [loading, setLoading] = useState(false);
const [onVoting, setOnVoting] = useState(false);
const [onExecution, setOnExecution] = useState(false);
const [toggle, setToggle] = useState(false);
```

```jsx
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
```

This function `handleConnectClick` uses `useCallback` to memoize the function and prevent necessary re-renders.

- **`initWeb3()`** function is called to initialise the web3 object.
- The **`connected`** state variable is set to **`true`** using **`setConnected()`** function.
- The user account is obtained by calling **`web3.eth.getAccounts()`** and stored in the **`account`** state variable using **`setAccount()`** function.
- The contract is initialised by calling **`initContract()`** function with the **`web3`** object as the argument, and stored in the **`contract`** state variable using **`setContract()`** function.
- The **`getProposals()`** function is called with the **`contract`** object as the argument, which retrieves the number of proposals and updates the **`proposalCount`** state variable using **`setProposalCount()`** function.

```jsx
const getProposals = useCallback(async (contract) => {
  try {
    // Get proposal count
    const proposalCount = await contract.methods.proposalCount().call();
    if (proposalCount != 0) {
      setProposalCount(proposalCount);
    }
  } catch (error) {
    // Display error message
    alert(`Error getting proposals count: ${error.message}`);
  }
}, []);
```

This function `getProposals` also uses `useCallback` hook to memoize the function and prevent necessary re-renders.

- We take a `contract` object and use it to connect to contract.
- The purpose of the function is to retrieve the proposal count.

```jsx
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
```

This function `getAllProposals` also uses `useCallback` hook to memoize the function and prevent necessary re-renders.

- The purpose of the function is to retrieve all proposals from the block.
- And then we set the Proposal to state management.

```jsx
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
```

The `createProposal` function is used creates proposal, where we take title and description. 

```jsx
const toggleProposal = () => {
  setToggle(!toggle);
};
```

`ToggleProposal` is used to trigger the pop up.

```jsx
const voteProposal = async (id, vote) => {
  try {
    setOnVoting(true);
    await contract.methods.voteOnProposal(id, vote).send({ from: account });
    setOnVoting(false);
    await getAllProposals();
  } catch (error) {
    setOnVoting(false);
    alert(`Error voting on proposal: ${error.message}`);
  }
};
```

The `voteProposal` function is used to vote the proposal. 

```jsx
const executeProposal = async (id) => {
  try {
    setOnExecution(true);
    console.log(id);
    await contract.methods.executeProposal(id).send({ from: account });
    await getAllProposals();
    setOnExecution(false);
  } catch (error) {
    setOnExecution(false);
    alert(`Error executing proposal: ${error.message}`);
  }
};
```

The `executeProposal` function is used to `execute/terminate` the proposal.

```jsx
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
```

The `sortedProposals` function is used to pre-sort the proposals by execution status.

```jsx
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
            disabled={proposal.executed}
          >
            {onExecution ? "Executing..." : "Execute"}
          </button>
        )}
      </div>
    </div>
  ))}
```

This code is rendering a list of proposals on the UI using the **`map()`** function. For each proposal in the **`sortedProposals`** array, a **`<div>`** element with the class **`proposal`** is created, and the proposal's properties such as **`title`**, **`description`**, **`votesYes`**, **`votesNo`**, and **`executed`** are displayed using HTML elements such as **`<h3>`**, **`<p>`**, and **`<div>`**.

If the proposal has not been executed, two buttons are rendered using the CSS classes **`yesButton`** and **`noButton`**, respectively. These buttons allow the user to vote on the proposal. When a user clicks on one of these buttons, the **`voteProposal()`** function is called with the proposal ID and the user's vote (0 for yes, 1 for no).

If the proposal's owner is the same as the current user's account, a button with the label "Execute" is displayed, and clicking on this button calls the **`executeProposal()`** function with the proposal ID as an argument. If the proposal has already been executed, the vote buttons and the execute button are not displayed.

```jsx
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
```

This code renders a form for creating a new proposal when the **`toggle`** state is true. The form consists of two input fields: one for the proposal title and one for the proposal description. The values of these fields are controlled by the **`title`** and **`description`** state variables, respectively. When the user enters a value into either of these fields, the corresponding state variable is updated using the **`onChange`** event.

The form also includes a submit button that triggers the **`createProposal()`** function when clicked. If the form is submitted with empty fields, an alert message is displayed asking the user to enter a title and description. If the submission is successful, the user is notified with an alert message and the form is reset. The **`loading`** state is set to true during the submission process and reset to false once the submission is complete.

```jsx
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
    ...
   )}
      </div>
    </div>
  ))}
  {toggle ? (
    <div className={styles.proposal}>
      ....
    </div>
  ) : null}
</div>
) : (
<div className={styles.homepage}>
 .....
</div>
)}
```

This is a conditional rendering block in the JSX code that renders different components based on the state of the **`connected`** and **`toggle`** variables.

- If **`connected`** is true, it renders the proposal body that contains two buttons: "View Proposals" and "Create Proposal". It also renders the list of proposals by mapping over the **`sortedProposals`** array and passing each proposal as a prop to a child component.
- If **`toggle`** is true, it renders a form to create a new proposal.
- If **`connected`** is false, it renders a homepage component that prompts the user to connect their wallet.

# Unit Test of Smart Contracts

- Set up the ganache [localhost](http://localhost) by starting `ganache` in command line
    - If you have not installed the Ganache, please use the following command to install `npm install ganache --global`
- Replace the `mnemonic` with a ganache private key.
- To run the test case, you can use `truffle test`

# Unit Test Coverage

```
Contract: ProposalContract
  init
    ✔ should set proposal count to 0
  createProposal
    ✔ should create a proposal (54ms)
  vote
    ✔ should vote for a proposal, yes (64ms)
    ✔ should vote for a proposal, no (70ms)
    ✔ should not vote for non-exist proposal (216ms)
    ✔ should not allow to vote twice (41ms)
  execute proposal
    ✔ should not execute proposal if not enough votes
    ✔ should execute proposal if enough votes (149ms)
    ✔ only owner can execute proposal
    ✔ should not execute proposal if already executed

10 passing (1s)
```

# Contact

For more inquiries and conversations, feel free to contact us at our [Discord Channel](https://discord.com/channels/789402563035660308/912296662834241597) Give feedback
