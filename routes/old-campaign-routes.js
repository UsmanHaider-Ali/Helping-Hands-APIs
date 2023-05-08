const express = require("express");
const routes = express.Router();

const oldCampaignController = require("../controllers/old-campaign-controller.js");

routes.post("/deploy-contract", oldCampaignController.deployeContract);
routes.post("/create-campaign", oldCampaignController.createCampaign);
routes.post("/send-funds", oldCampaignController.sendFunds);
routes.post("/get-raised-funds", oldCampaignController.getRaisedFunds);
routes.post("/get-remaining-funds", oldCampaignController.getRemainingFunds);
routes.post("/get-total-contributors", oldCampaignController.getTotalContributors);
routes.post("/get-contribution", oldCampaignController.getFundsOfContributor);
routes.post("/withdraw-funds", oldCampaignController.withdrawFunds);
routes.post("/get-contract-owner", oldCampaignController.getContractOwner);
routes.post("/get-contrat-details", oldCampaignController.getContractDetails);
routes.post("/get-all-contracts", oldCampaignController.getAllContracts);
routes.post("/get-campaigns-count", oldCampaignController.getCompaignsCount);
routes.post("/get-one-campaign-detail", oldCampaignController.getOneCampaignDetail);

module.exports = routes;
