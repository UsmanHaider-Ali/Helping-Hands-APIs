var web3 = require("../provider.js");
var solc = require("solc");
var fs = require("fs");

var campaignContractFile = fs.readFileSync("contracts/Campaign.sol").toString();

var contractInput = {
  language: "Solidity",
  sources: {
    "contracts/Campaign.sol": {
      content: campaignContractFile,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

var contractOutput = JSON.parse(solc.compile(JSON.stringify(contractInput)));

exports.createCampaign = async (req, res, next) => {
  const {
    userId,
    creatorAddress,
    title,
    description,
    categoryId,
    startTime,
    deadline,
    targetAmount,
  } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;
  var contractByteCode =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].evm.bytecode
      .object;

  var campaignContract = new web3.eth.Contract(contractAbi);

  var contractArgs = [
    userId,
    title,
    description,
    categoryId,
    targetAmount,
    startTime,
    deadline,
  ];

  campaignContract
    .deploy({
      data: contractByteCode,
      arguments: contractArgs,
    })
    .send({ from: creatorAddress, gas: 4700000 })
    .on("receipt", (contractReceipt) => {
      res.json({
        data: contractReceipt,
        message: "Contract created successfully.",
        success: true,
      });
      return;
    });
};

exports.sendFunds = async (req, res, next) => {
  const { contractAddress, userAddress, amount } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    res.json({
      data: await contract.methods.sendFunds().send({
        from: userAddress,
        value: amount,
        gas: 4700000,
      }),
      message: "Funds donated successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};
exports.getRaisedFunds = async (req, res, next) => {
  const { contractAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    res.json({
      data: await contract.methods.getRaisedFunds().call(),
      message: "Raised funds fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};

exports.getRemainingFunds = async (req, res, next) => {
  const { contractAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    res.json({
      data: await contract.methods.getRemainingFunds().call(),
      message: "Remaining funds fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};
exports.getTotalContributors = async (req, res, next) => {
  const { contractAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    res.json({
      data: await contract.methods.getTotalContributors().call(),
      message: "Total contributors fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};
exports.getFundsOfContributor = async (req, res, next) => {
  const { contractAddress, userAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    res.json({
      data: await contract.methods.getFundsOfContributor(userAddress).call(),
      message: "Contribution fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};

exports.getContractOwner = async (req, res, next) => {
  const { contractAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    res.json({
      data: await contract.methods.getContractOwner().call(),
      message: "Contract owner fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};

exports.withdrawFunds = async (req, res, next) => {
  const { contractAddress, ownerAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    const result = await contract.methods.withdrawFunds(ownerAddress).call();
    console.log(result);
    res.json({
      data: result,
      message: "Funds withdraw successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};

exports.getContractDetails = async (req, res, next) => {
  const { contractAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    const rawResult = await contract.methods.getCampaignDetails().call();

    const result = {
      creator: rawResult.creator,
      userId: rawResult.userId,
      title: rawResult.title,
      description: rawResult.description,
      categoryId: rawResult.categoryId,
      targetFunds: rawResult.targetFunds,
      startTime: rawResult.startTime,
      deadline: rawResult.deadline,
      raisedFunds: rawResult.raisedFunds,
      remainingFunds: rawResult.remainingFunds,
      noOfContributors: rawResult.noOfContributors,
    };

    res.json({
      data: result,
      message: "Contract details fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};

exports.getAllContracts = async (req, res, next) => {
  const { contractAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  try {
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    res.json({
      data: await contract.methods.getAllContracts().call(),
      message: "All Contracts fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: "" + err,
      success: false,
    });
    return;
  }
};
