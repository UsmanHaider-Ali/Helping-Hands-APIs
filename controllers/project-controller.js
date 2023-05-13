var web3 = require("../provider.js");
var solc = require("solc");
var fs = require("fs");

var projectContractFile = fs.readFileSync("contracts/Project.sol").toString();

var contractInput = {
  language: "Solidity",
  sources: {
    "contracts/Project.sol": {
      content: projectContractFile,
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

exports.deployeProjectContract = async (req, res, next) => {
  const { creatorAddress } = req.body;

  var contractAbi =
    contractOutput.contracts["contracts/Project.sol"]["Project"].abi;
  var contractByteCode =
    contractOutput.contracts["contracts/Project.sol"]["Project"].evm.bytecode
      .object;

  var projectContract = new web3.eth.Contract(contractAbi);

  await projectContract
    .deploy({
      data: contractByteCode,
      arguments: [],
    })
    .send({ from: creatorAddress, gas: 4700000 })
    .on("receipt", (contractReceipt) => {
      fs.writeFileSync(
        "build/addresses/project-contract-address.json",
        JSON.stringify({ address: contractReceipt.contractAddress }, null, 2)
      );

      res.json({
        message: "Contract deployed successfully.",
        success: true,
        result: contractReceipt,
      });
      return;
    });
};

const getProjectContract = async () => {
  const contractAddress = JSON.parse(
    fs.readFileSync("build/addresses/project-contract-address.json")
  );

  var contractAbi =
    contractOutput.contracts["contracts/Project.sol"]["Project"].abi;

  return new web3.eth.Contract(contractAbi, contractAddress.address);
};

exports.createProject = async (req, res, next) => {
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
    investerId,
    targetFunds,
    creator,
    investerAddress,
  } = req.body;

  var contract = await getProjectContract();

  await contract.methods
    .createProject(
      userId,
      categoryId,
      title,
      description,
      targetFunds,
      imageUrl,
      investerId,
      investerAddress
    )
    .send({ from: creator, gas: 2000000 }, (error, transaction) => {
      if (error) {
        res.json({
          message: "Error while creating project.",
          success: false,
          error,
        });
        return;
      }

      res.json({
        message: "Project created successfully.",
        success: true,
        result: transaction,
      });
      return;
    });
};

exports.createProjectModule = async (req, res, next) => {
  const {
    projectId,
    title,
    description,
    targetFunds,
    startDate,
    endDate,
    creator,
  } = req.body;

  var contract = await getProjectContract();

  await contract.methods
    .createProjectModule(
      projectId,
      title,
      description,
      targetFunds,
      startDate,
      endDate
    )
    .send({ from: creator, gas: 2000000 }, (error, transaction) => {
      if (error) {
        res.json({
          error,
          message: "Error while module project.",
          success: false,
        });
        return;
      }

      res.json({
        message: "Module created successfully.",
        success: true,
        result: transaction,
      });
      return;
    });
};

exports.getProject = async (req, res, next) => {
  const { id } = req.body;

  try {
    const contract = await getProjectContract();
    let rawPro = await contract.methods.getProject(id).call();

    let rawMod = await contract.methods.getAllModules().call();

    let modules = [];

    for (let i = 0; i < rawMod.length; i++) {
      if (rawPro[3] == rawMod[i]["projectId"]) {
        modules.push({
          projectId: rawMod[i]["projectId"],
          moduleId: rawMod[i]["moduleId"],
          title: rawMod[i]["title"],
          description: rawMod[i]["description"],
          moduleFunds: {
            targetFunds: rawMod[i]["moduleFunds"]["targetFunds"],
            raisedFunds: rawMod[i]["moduleFunds"]["raisedFunds"],
            remainingFunds: rawMod[i]["moduleFunds"]["remainingFunds"],
          },
          startDate: rawMod[i]["startDate"],
          endDate: rawMod[i]["endDate"],
          status: rawMod[i]["status"],
        });
      }
    }

    let projectFunds = {
      targetFunds: rawPro[6][0],
      raisedFunds: rawPro[6][1],
      remainingFunds: rawPro[6][2],
    };

    let project = {
      creator: rawPro[0],
      userId: rawPro[1],
      categoryId: rawPro[2],
      projectId: rawPro[3],
      title: rawPro[4],
      description: rawPro[5],
      projectFunds: projectFunds,
      imageURL: rawPro[7],
      modules: modules,
      investerId: rawPro[9],
      investerAddress: rawPro[10],
      isOpened: rawPro[11],
    };

    res.json({
      message: "Project fetched successfully.",
      success: true,
      project: project,
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

exports.getAllProjects = async (req, res, next) => {
  try {
    const contract = await getProjectContract();

    let rawMod = await contract.methods.getAllModules().call();
    let modules = [];

    var result = await contract.methods.getAllProjects().call();
    let projects = [];

    for (let j = 0; j < result.length; j++) {
      let projectFunds = {
        targetFunds: result[j][6][0],
        raisedFunds: result[j][6][1],
        remainingFunds: result[j][6][2],
      };

      for (let i = 0; i < rawMod.length; i++) {
        if (result[j][3] == rawMod[i]["projectId"]) {
          modules.push({
            projectId: rawMod[i]["projectId"],
            moduleId: rawMod[i]["moduleId"],
            title: rawMod[i]["title"],
            description: rawMod[i]["description"],
            moduleFunds: {
              targetFunds: rawMod[i]["moduleFunds"]["targetFunds"],
              raisedFunds: rawMod[i]["moduleFunds"]["raisedFunds"],
              remainingFunds: rawMod[i]["moduleFunds"]["remainingFunds"],
            },
            startDate: rawMod[i]["startDate"],
            endDate: rawMod[i]["endDate"],
            status: rawMod[i]["status"],
          });
        }
      }

      let project = {
        creator: result[j][0],
        userId: result[j][1],
        categoryId: result[j][2],
        projectId: result[j][3],
        title: result[j][4],
        description: result[j][5],
        projectFunds: projectFunds,
        imageURL: result[j][7],
        modules: modules,
        investerId: result[j][9],
        investerAddress: result[j][10],
        isOpened: result[j][11],
      };

      projects.push(project);

      modules = [];
    }

    res.json({
      message: "Projects fetched successfully.",
      success: true,
      projects: projects,
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

exports.donateProjectModule = async (req, res, next) => {
  const { projectId, moduleId, userAddress, amount } = req.body;

  try {
    const contract = await getProjectContract();
    res.json({
      result: await contract.methods
        .fundsToProjectModule(projectId, moduleId)
        .send({
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
