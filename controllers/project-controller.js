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

exports.deployContract = async (req, res, next) => {
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
    .send({ from: creatorAddress, gas: 5425342 })
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
    imageUrl = "_";
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
    .send({ from: creator, gas: 723898 }, (error, transaction) => {
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

exports.createModule = async (req, res, next) => {
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
    .send({ from: creator, gas: 611360 }, (error, transaction) => {
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
  const { projectId } = req.body;

  try {
    const contract = await getProjectContract();
    let rawPro = await contract.methods.getProject(projectId).call();

    let rawMod = await contract.methods.getAllModules().call();

    let modules = [];

    for (let i = 0; i < rawMod.length; i++) {
      if (rawPro[3] == rawMod[i]["projectId"]) {
        let status = "";
        if (rawMod[i].status == 0) {
          status = "NotStarted";
        } else if (rawMod[i].status == 1) {
          status = "Ongoing";
        } else if (rawMod[i].status == 2) {
          status = "Upcoming";
        } else if (rawMod[i].status == 3) {
          status = "Paid";
        } else if (rawMod[i].status == 4) {
          status = "Completed";
        } else if (rawMod[i].status == 5) {
          status = "Issued";
        }

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
          status: status,
        });
      }
    }

    let projectFunds = {
      targetFunds: rawPro[6][0],
      raisedFunds: rawPro[6][1],
      remainingFunds: rawPro[6][2],
    };

    let status = "";
    if (rawPro[11] == 0) {
      status = "NotStarted";
    } else if (rawPro[11] == 1) {
      status = "Ongoing";
    } else if (rawPro[11] == 2) {
      status = "Upcoming";
    } else if (rawPro[11] == 3) {
      status = "Paid";
    } else if (rawPro[11] == 4) {
      status = "Completed";
    } else if (rawPro[11] == 5) {
      status = "Issued";
    }

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
      status: status,
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

exports.getProjects = async (req, res, next) => {
  const { userId, categoryId } = req.body;

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
          let status = "";
          if (result[j][11] == 0) {
            status = "NotStarted";
          } else if (result[j][11] == 1) {
            status = "Ongoing";
          } else if (result[j][11] == 2) {
            status = "Upcoming";
          } else if (result[j][11] == 3) {
            status = "Paid";
          } else if (result[j][11] == 4) {
            status = "Completed";
          } else if (result[j][11] == 5) {
            status = "Issued";
          }

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
            status: status,
          });
        }
      }
      let status = "";
      if (result[j][11] == 0) {
        status = "NotStarted";
      } else if (result[j][11] == 1) {
        status = "Ongoing";
      } else if (result[j][11] == 2) {
        status = "Upcoming";
      } else if (result[j][11] == 3) {
        status = "Paid";
      } else if (result[j][11] == 4) {
        status = "Completed";
      } else if (result[j][11] == 5) {
        status = "Issued";
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
        status: status,
      };

      if (userId == "" && categoryId == "") projects.push(project);
      else if (userId == project.userId && categoryId == "")
        projects.push(project);
      else if (userId == "" && categoryId == project.categoryId)
        projects.push(project);
      else if (userId == project.userId && categoryId == project.categoryId)
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

exports.donateProject = async (req, res, next) => {
  const { projectId, moduleId, userAddress, amount, userId } = req.body;

  try {
    const contract = await getProjectContract();
    res.json({
      result: await contract.methods
        .fundsToProjectModule(projectId, moduleId, userId)
        .send({
          from: userAddress,
          value: amount,
          gas: 399254,
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
  const { ownerAddress, projectId, moduleId, userId } = req.body;

  try {
    const contract = await getProjectContract();

    const result = await contract.methods
      .withdrawFunds(ownerAddress, projectId, moduleId, userId)
      .send({
        from: ownerAddress,
        gas: 299290,
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

exports.getUserStats = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const contract = await getProjectContract();

    var result = await contract.methods.getUserStats().call();

    let stats = [];

    for (let i = 0; i < result.length; i++) {
      let stat = {
        userId: result[i][0],
        contribution: result[i][2] ? `-${result[i][1]}` : `+${result[i][1]}`,
        isFundsDonating: result[i][2],
        timestamp: result[i][3],
        description: result[i][4],
      };
      if (stat.userId == userId) stats.push(stat);
    }

    res.json({
      message: "Stats fetched successfully.",
      success: true,
      stats: stats,
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
