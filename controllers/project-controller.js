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
        result: contractReceipt,
        message: "Contract deployed successfully.",
        success: true,
      });
      return;
    });
};

const getProjectContract = async () => {
  const contractAddress = JSON.parse(
    fs.readFileSync("build/addresses/project-contract-address.json")
  );

  var contractAbi =
    contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;

  return new web3.eth.Contract(contractAbi, contractAddress.address);
};
