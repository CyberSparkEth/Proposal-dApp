// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    address owner;

    struct ProposalVote {
        uint againstVotes;
        uint forVotes;
        uint abstaitnVotes;
        mapping(address => bool) hasVoted;
    }

    struct Proposal {
        string description;
        uint votingStarts;
        uint votingEnds;
        bool executed;
    }

    event CreateProposal(
        string description,
        bytes32 proposalID,
        uint256 votingEnds
    );

    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed
    }

    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => ProposalVote) public proposalsVotes;
    bytes32[] public allProposals;

    uint public constant VOTING_DURATION = 60;

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address _to) external onlyOwner {
        require(msg.sender == owner);
        owner = _to;
    }

    function getLengthAllProporsal() public view returns (uint) {
        return allProposals.length;
    }

    function propose(
        string calldata _description
    ) external onlyOwner returns (bytes32) {
        bytes32 proposalID = generateProposalId(keccak256(bytes(_description)));
        require(
            proposals[proposalID].votingStarts == 0,
            "Proposal already exists"
        );

        proposals[proposalID] = Proposal({
            description: _description,
            votingStarts: block.timestamp,
            votingEnds: block.timestamp + VOTING_DURATION,
            executed: false
        });
        allProposals.push(proposalID);
        emit CreateProposal(
            _description,
            proposalID,
            proposals[proposalID].votingEnds
        );
        return proposalID;
    }

    function vote(bytes32 proposalID, uint8 voteType) external {
        require(state(proposalID) == ProposalState.Active, "Invalid State");
        ProposalVote storage proposalVote = proposalsVotes[proposalID];
        require(!proposalVote.hasVoted[msg.sender], "Already voted");

        if (voteType == 0) {
            proposalVote.againstVotes += 1;
        } else if (voteType == 1) {
            proposalVote.forVotes += 1;
        } else {
            proposalVote.abstaitnVotes += 1;
        }

        proposalVote.hasVoted[msg.sender] = true;
    }

    function state(bytes32 proposalID) public view returns (ProposalState) {
        Proposal storage proposal = proposals[proposalID];
        ProposalVote storage proposalVote = proposalsVotes[proposalID];

        require(
            proposals[proposalID].votingStarts > 0,
            "Proposal doesnt exist"
        );

        if (proposal.executed) {
            return ProposalState.Executed;
        }

        if (block.timestamp < proposal.votingStarts) {
            return ProposalState.Pending;
        }

        if (
            block.timestamp >= proposal.votingStarts &&
            proposal.votingEnds > block.timestamp
        ) {
            return ProposalState.Active;
        }

        if (proposalVote.forVotes > proposalVote.againstVotes) {
            return ProposalState.Succeeded;
        } else {
            return ProposalState.Defeated;
        }
    }

    function execute(string calldata _description) external {
        bytes32 proposalID = generateProposalId(keccak256(bytes(_description)));
        require(state(proposalID) == ProposalState.Succeeded, "invalid state");
        Proposal storage proposal = proposals[proposalID];
        proposal.executed = true;
    }

    function generateProposalId(
        bytes32 _descriptionHash
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(_descriptionHash));
    }
}
