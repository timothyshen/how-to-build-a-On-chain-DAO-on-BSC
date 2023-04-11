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
  return new web3.eth.Contract(
    DAOProposal.abi,
    "0x4633B99D5D54D7F4205aE16Ccb2b509d92Bb1e3E"
  );
};
