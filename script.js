const contractAddress = "0x610DCB0e4d049243a28416a3897eFA85af69C829";
const contractABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "description",
                type: "string",
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "proposalID",
                type: "bytes32",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "votingEnds",
                type: "uint256",
            },
        ],
        name: "CreateProposal",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_description",
                type: "string",
            },
        ],
        name: "execute",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_description",
                type: "string",
            },
        ],
        name: "propose",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_to",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "proposalID",
                type: "bytes32",
            },
            {
                internalType: "uint8",
                name: "voteType",
                type: "uint8",
            },
        ],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "allProposals",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getLengthAllProporsal",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        name: "proposals",
        outputs: [
            {
                internalType: "string",
                name: "description",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "votingStarts",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "votingEnds",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "executed",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        name: "proposalsVotes",
        outputs: [
            {
                internalType: "uint256",
                name: "againstVotes",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "forVotes",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "abstaitnVotes",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "proposalID",
                type: "bytes32",
            },
        ],
        name: "state",
        outputs: [
            {
                internalType: "enum Voting.ProposalState",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "VOTING_DURATION",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];

const provider = new ethers.providers.Web3Provider(window.ethereum, 97);
let signer;
let contract;
let lastProposal;
let proposalID;
let abstaitnVotes;
let forVotes;
let againstVotes;
let state;

provider.send("eth_requestAccounts", []).then(() => {
    provider.listAccounts().then((accounts) => {
        signer = provider.getSigner(accounts[0]);

        contract = new ethers.Contract(contractAddress, contractABI, signer);
    });
});

window.onload = () => {
    const buttons = document.querySelectorAll(".choice-buttons");

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            buttons.forEach((button) => {
                button.classList.remove("choice-active");
            });
            this.classList.add("choice-active");
        });
    });
};

function choiceToNum(choice) {
    switch (choice) {
        case "Поддерживаю":
            return 1;
        case "Отказываюсь":
            return 0;
        case "Воздерживаюсь":
            return 2;
        default:
            return "None";
    }
}

function numToState(state) {
    switch (state) {
        case 0:
            return "Ожидание";
        case 1:
            return "Идет сбор голосов";
        case 2:
            return "Успех";
        case 3:
            return "Поражение";
        case 4:
            return "Исполнено";
        default:
            return "None";
    }
}

async function resultOfProposal(proposalID) {
    const result = await contract.proposalsVotes(proposalID);
    abstaitnVotes = result[0];
    forVotes = result[1];
    againstVotes = result[2];
    return { abstaitnVotes, forVotes, againstVotes };
}

async function stateOfProposal(proposalID) {
    return numToState(await contract.state(proposalID).then((state) => state));
}

async function showLastProposal() {
    lastProposal = await contract
        .getLengthAllProporsal()
        .then((length) => length - 1);
    await contract.allProposals(lastProposal).then(async (proposalID) => {
        let proposal = await contract.proposals(proposalID);
        document.querySelector(
            "body > main > div > button.proposal"
        ).innerText = proposal.description;
        await resultOfProposal(proposalID);
        document.querySelector(
            "body > main > div > div.choice-wrapper > button:nth-child(2)"
        ).innerText = forVotes;
        document.querySelector(
            "body > main > div > div.choice-wrapper > button:nth-child(4)"
        ).innerText = abstaitnVotes;
        document.querySelector(
            "body > main > div > div.choice-wrapper > button:nth-child(6)"
        ).innerText = againstVotes;
        let state = await stateOfProposal(proposalID);
        document.querySelector(
            "body > main > div > div.state"
        ).innerHTML = `Статус голосования: ${state}`;
    });
}

async function vote() {
    try {
        const activeChoice = document.querySelector(".choice-active");
        const choice = activeChoice
            ? choiceToNum(activeChoice.innerText)
            : null;
        let proposalID = await contract
            .allProposals(lastProposal)
            .then((proposalID) => {
                return proposalID;
            });
        // if (!choice) throw new Error("Выберите вариант");
        await contract.vote(proposalID, choice);
        await contract.proposalsVotes(proposalID).then((result) => {
            abstaitnVotes = result[0];
            forVotes = result[1];
            againstVotes = result[2];
        });
    } catch (error) {
        console.error(error);
    }
}
