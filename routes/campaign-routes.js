const express = require("express");
const routes = express.Router();

const campaignController = require("../controllers/campaign-controller.js");

routes.post("/create-campaign", campaignController.createCampaign);
routes.post("/send-funds", campaignController.sendFunds);
routes.post("/get-raised-funds", campaignController.getRaisedFunds);
routes.post("/get-remaining-funds", campaignController.getRemainingFunds);
routes.post("/get-total-contributors", campaignController.getTotalContributors);
routes.post("/get-contribution", campaignController.getFundsOfContributor);
routes.post("/withdraw-funds", campaignController.withdrawFunds);
routes.post("/get-contract-owner", campaignController.getContractOwner);
routes.post("/get-contrat-details", campaignController.getContractDetails);
routes.post("/get-all-contracts", campaignController.getAllContracts);

module.exports = routes;
