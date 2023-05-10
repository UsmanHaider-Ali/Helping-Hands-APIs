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

exports.deployeContract = async (req, res, next) => {
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
    .send({ from: creatorAddress, gas: 4700000 })
    .on("receipt", (contractReceipt) => {
      fs.writeFileSync(
        "build/contracts/contract-address.json",
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
    fs.readFileSync("build/contracts/contract-address.json")
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
    .send({ from: creator, gas: 2000000 }, (error, transaction) => {
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
  const { id, userAddress, amount } = req.body;

  try {
    const contract = await getCampaignContract();
    res.json({
      result: await contract.methods.donateFunds(id).send({
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

exports.withdrawFunds = async (req, res, next) => {
  const { id, ownerAddress } = req.body;

  try {
    const contract = await getCampaignContract();

    const result = await contract.methods
      .withdrawFunds(ownerAddress, id)
      .call();

    res.json({
      result: `${result}`,
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

exports.getCampaign = async (req, res, next) => {
  const { id } = req.body;

  try {
    const contract = await getCampaignContract();
    let rawCamp = await contract.methods.getCampaign(id).call();

    let campaign = {
      creator: rawCamp[0],
      userId: rawCamp[1],
      categoryId: rawCamp[2],
      campaignId: rawCamp[3],
      title: rawCamp[4],
      description: rawCamp[5],
      targetFunds: rawCamp[6],
      deadline: rawCamp[7],
      raisedFunds: rawCamp[8],
      remainingFunds: rawCamp[9],
      imageUrl: rawCamp[10],
      isOpened: rawCamp[11],
    };

    res.json({
      campaign: campaign,
      message: "Campaign fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      message: `${err}`,
      success: false,
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
        isOpened: result[i][11],
      };
      campaigns.push(campaign);
    }

    res.json({
      campaigns: campaigns,
      message: "Campaigns fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      error: `${err}`,
      success: false,
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
        isOpened: result[i][11],
      };
      if (campaign.userId == id && campaign.creator == creator)
        campaigns.push(campaign);
    }

    res.json({
      campaigns: campaigns,
      message: "Campaigns fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      error: `${err}`,
      success: false,
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
        isOpened: result[i][11],
      };
      if (campaign.campaignId == id) campaigns.push(campaign);
    }

    res.json({
      campaigns: campaigns,
      message: "Campaigns fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      error: `${err}`,
      success: false,
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
        isOpened: result[i][11],
      };
      if (
        campaign.categoryId == categoryId &&
        campaign.userId == userId &&
        campaign.creator == creator
      )
        campaigns.push(campaign);
    }

    res.json({
      campaigns: campaigns,
      message: "Campaigns fetched successfully.",
      success: true,
    });
    return;
  } catch (err) {
    res.json({
      error: `${err}`,
      success: false,
    });
    return;
  }
};
