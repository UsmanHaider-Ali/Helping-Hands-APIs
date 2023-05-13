var web3 = require("../provider.js");
var solc = require("solc");
var fs = require("fs");

const gasLimit = 2100000;

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

exports.deployeCampaignContract = async (req, res, next) => {
  const { creatorAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;
  var contractByteCode =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].evm.bytecode
      .object;

  var campaignContract = new web3.eth.Contract(contractAbi);

  await campaignContract
    .deploy({
      data: contractByteCode,
      arguments: [],
    })
    .send({ from: creatorAddress, gas: gasLimit })
    .on("receipt", (contractReceipt) => {
      fs.writeFileSync(
        "build/addresses/campaign-contract-address.json",
        JSON.stringify({ address: contractReceipt.contractAddress }, null, 2)
      );

      res.json({
        result: contractReceipt,
        message: "Contract deployed successfully.",
        success: true,
      });
      return;
    });
};

const getCampaignContract = async () => {
  const contractAddress = JSON.parse(
    fs.readFileSync("build/addresses/campaign-contract-address.json")
  );

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  return new web3.eth.Contract(contractAbi, contractAddress.address);
};

exports.createCampaign = async (req, res, next) => {
  var imageUrl = "";

  if (req.file === undefined) {
    res.json({
      message: "Please select the image.",
      success: false,
    });
    return;
  } else {
    imageUrl = req.file.path;
  }

  const {
    userId,
    title,
    description,
    categoryId,
    deadline,
    targetFunds,
    creator,
  } = req.body;

  var contract = await getCampaignContract();

  await contract.methods
    .createCampaign(
      userId,
      categoryId,
      title,
      description,
      targetFunds,
      deadline,
      imageUrl
    )
    .send({ from: creator, gas: gasLimit }, (error, transaction) => {
      if (error) {
        res.json({
          error,
          message: "Error while creating campaign.",
          success: false,
        });
        return;
      }

      res.json({
        result: transaction,
        message: "Campaign created successfully.",
        success: true,
      });
      return;
    });
};

exports.donateFunds = async (req, res, next) => {
  const { userAddress, amount, campaignId, userId } = req.body;

  try {
    const contract = await getCampaignContract();
    res.json({
      message: "Funds donated successfully.",
      success: true,
      result: await contract.methods.donateFunds(campaignId, userId).send({
        from: userAddress,
        value: amount,
        gas: gasLimit,
      }),
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
  const { ownerAddress, campaignId, userId } = req.body;

  try {
    const contract = await getCampaignContract();

    const result = await contract.methods
      .withdrawFunds(ownerAddress, campaignId, userId)
      .send({
        from: ownerAddress,
        gas: gasLimit,
      });

    res.json({
      message: "Funds withdraw successfully.",
      success: true,
      result: result,
    });
    return;
  } catch (err) {
    res.json({
      success: false,
      message: "" + err,
    });
    return;
  }
};

exports.getCampaign = async (req, res, next) => {
  const { id } = req.body;

  try {
    const contract = await getCampaignContract();
    let result = await contract.methods.getCampaign(id).call();

    let campaign = {
      creator: result[0],
      userId: result[1],
      categoryId: result[2],
      campaignId: result[3],
      title: result[4],
      description: result[5],
      targetFunds: result[6],
      deadline: result[7],
      raisedFunds: result[8],
      remainingFunds: result[9],
      imageUrl: result[10],
      status: result[11] == 0 ? "Ongoing" : "Completed",
    };

    res.json({
      message: "Campaign fetched successfully.",
      success: true,
      campaign: campaign,
    });
    return;
  } catch (err) {
    res.json({
      success: false,
      message: `${err}`,
    });
    return;
  }
};

exports.getAllCampaigns = async (req, res, next) => {
  try {
    const contract = await getCampaignContract();

    var result = await contract.methods.getAllCampaigns().call();

    let campaigns = [];

    for (let i = 0; i < result.length; i++) {
      let campaign = {
        creator: result[i][0],
        userId: result[i][1],
        categoryId: result[i][2],
        campaignId: result[i][3],
        title: result[i][4],
        description: result[i][5],
        targetFunds: result[i][6],
        deadline: result[i][7],
        raisedFunds: result[i][8],
        remainingFunds: result[i][9],
        imageUrl: result[i][10],
        status: result[i][11] == 0 ? "Ongoing" : "Completed",
      };
      campaigns.push(campaign);
    }

    res.json({
      message: "Campaigns fetched successfully.",
      success: true,
      campaigns: campaigns,
    });
    return;
  } catch (err) {
    res.json({
      success: false,
      error: `${err}`,
    });
    return;
  }
};

exports.getMyCampaigns = async (req, res, next) => {
  const id = req.body.id;
  const creator = req.body.creator;
  try {
    const contract = await getCampaignContract();

    var result = await contract.methods.getAllCampaigns().call();

    let campaigns = [];

    for (let i = 0; i < result.length; i++) {
      let campaign = {
        creator: result[i][0],
        userId: result[i][1],
        categoryId: result[i][2],
        campaignId: result[i][3],
        title: result[i][4],
        description: result[i][5],
        targetFunds: result[i][6],
        deadline: result[i][7],
        raisedFunds: result[i][8],
        remainingFunds: result[i][9],
        imageUrl: result[i][10],
        status: result[i][11] == 0 ? "Ongoing" : "Completed",
      };
      if (campaign.userId == id && campaign.creator == creator)
        campaigns.push(campaign);
    }

    res.json({
      message: "Campaigns fetched successfully.",
      success: true,
      campaigns: campaigns,
    });
    return;
  } catch (err) {
    res.json({
      success: false,
      error: `${err}`,
    });
    return;
  }
};

exports.getCampaignFunders = async (req, res, next) => {
  const id = req.body.id;
  try {
    const contract = await getCampaignContract();

    var result = await contract.methods.getCampaignFunders(id).call();

    let funders = [];

    for (let i = 0; i < result.length; i++) {
      let funder = {
        funder: result[i][0],
        contribution: result[i][1],
        timestamp: result[i][2],
      };
      funders.push(funder);
    }

    res.json({
      message: "Funders fetched successfully.",
      success: true,
      funders: funders,
    });
    return;
  } catch (err) {
    res.json({
      success: false,
      error: `${err}`,
    });
    return;
  }
};

exports.getAllCampaignsByCategory = async (req, res, next) => {
  const id = req.body.id;
  try {
    const contract = await getCampaignContract();

    var result = await contract.methods.getAllCampaigns().call();

    let campaigns = [];

    for (let i = 0; i < result.length; i++) {
      let campaign = {
        creator: result[i][0],
        userId: result[i][1],
        categoryId: result[i][2],
        campaignId: result[i][3],
        title: result[i][4],
        description: result[i][5],
        targetFunds: result[i][6],
        deadline: result[i][7],
        raisedFunds: result[i][8],
        remainingFunds: result[i][9],
        imageUrl: result[i][10],
        status: result[i][11] == 0 ? "Ongoing" : "Completed",
      };

      if (campaign.categoryId == id) campaigns.push(campaign);
    }

    res.json({
      message: "Campaigns fetched successfully.",
      success: true,
      campaigns: campaigns,
    });
    return;
  } catch (err) {
    res.json({
      success: false,
      error: `${err}`,
    });
    return;
  }
};

exports.getMyCampaignsByCategory = async (req, res, next) => {
  const categoryId = req.body.categoryId;
  const userId = req.body.userId;
  const creator = req.body.creator;
  try {
    const contract = await getCampaignContract();

    var result = await contract.methods.getAllCampaigns().call();

    let campaigns = [];

    for (let i = 0; i < result.length; i++) {
      let campaign = {
        creator: result[i][0],
        userId: result[i][1],
        categoryId: result[i][2],
        campaignId: result[i][3],
        title: result[i][4],
        description: result[i][5],
        targetFunds: result[i][6],
        deadline: result[i][7],
        raisedFunds: result[i][8],
        remainingFunds: result[i][9],
        imageUrl: result[i][10],
        status: result[i][11] == 0 ? "Ongoing" : "Completed",
      };
      if (
        campaign.categoryId == categoryId &&
        campaign.userId == userId &&
        campaign.creator == creator
      )
        campaigns.push(campaign);
    }

    res.json({
      message: "Campaigns fetched successfully.",
      success: true,
      campaigns: campaigns,
    });
    return;
  } catch (err) {
    res.json({
      success: false,
      error: `${err}`,
    });
    return;
  }
};
