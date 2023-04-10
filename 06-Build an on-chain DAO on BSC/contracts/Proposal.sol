// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DAOProposal {
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

    mapping (uint => Proposal) public Proposals;
    uint40 public proposalCount = 0;
    mapping (address => mapping(bytes32 => bool))  votes;


    constructor() {

    }

    function createProposal(string memory _title, string memory _description) external returns (uint40){
        Proposal storage proposal = Proposals[proposalCount];
        proposal.owner = msg.sender;
        proposal.id = proposalCount; // we use the hash of the proposal index as the id to avoid collisions
        proposal.proposalId = keccak256(abi.encodePacked(proposalCount));
        proposal.title = _title;
        proposal.description = _description;
        proposalCount++;
        return proposalCount - 1;
    }

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

    function executeProposal(uint40 proposalIndex) external {
        Proposal storage proposal = Proposals[proposalIndex];
        require(proposal.id != 0, "Proposal does not exist");
        require(proposal.owner == msg.sender, "You are not the owner of this proposal");
        require(proposal.votesYes > proposal.votesNo, "Proposal has not passed");
        require(proposal.executed == false, "Proposal has already been executed");
        proposal.executed = true;
    }

}