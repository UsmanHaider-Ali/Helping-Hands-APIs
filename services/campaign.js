// var web3 = require("../web3.js");
// var solc = require("solc");
// var fs = require("fs");

// var campaignContractFile = fs.readFileSync("contracts/Campaign.sol").toString();

// var contractInput = {
//   language: "Solidity",
//   sources: {
//     "contracts/Campaign.sol": {
//       content: campaignContractFile,
//     },
//   },
//   settings: {
//     outputSelection: {
//       "*": {
//         "*": ["*"],
//       },
//     },
//   },
// };

// var contractOutput = JSON.parse(solc.compile(JSON.stringify(contractInput)));

// var contractAbi =
//   contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].abi;
// var contractByteCode =
//   contractOutput.contracts["contracts/Campaign.sol"]["Campaign"].evm.bytecode
//     .object;

// var campaignContract = new web3.eth.Contract(contractAbi);
// var contractArgs = [1, "Title", "Description", 1, 10000000000000, 600];

// campaignContract
//   .deploy({
//     data: contractByteCode,
//     arguments: contractArgs,
//   })
//   .send({ from: "0x21A9d6e7E83e0B73d36d24bc705a99993e7796c6", gas: 4700000 })
//   .on("receipt", (receipt) => {
//     console.log("Contract Address:", receipt.contractAddress);
//   })
//   .then((campaign) => {
//     campaign.methods
//       .sendFunds()
//       .send({
//         from: "0x371C2E9F7c698bF1148738188069935364a8389C",
//         gas: 3000000,
//         value: 100,
//       })
//       .on("receipt", function (data, error) {
//         console.log(data);
//         campaign.methods
//           .isContibutors("0x371C2E9F7c698bF1148738188069935364a8389C")
//           .call((err, data) => {
//             console.log("Campaign Result => ", data);
//           });

//         campaign.methods
//           .getFundsOfContributor("0x371C2E9F7c698bF1148738188069935364a8389C")
//           .call((err, data) => {
//             console.log("Campaign Result => ", data);
//           });
//         campaign.methods.getRaisedFunds().call((err, data) => {
//           console.log("Campaign Result => ", data);
//         });
//       });
//     campaign.methods
//       .isContibutors("0x8Ac99A449bf471E1E09c68548E7949b67612579e")
//       .call((err, data) => {
//         console.log("Campaign Result => ", data);
//       });
//   });
