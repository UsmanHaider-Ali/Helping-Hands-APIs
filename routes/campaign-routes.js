const express = require("express");
const routes = express.Router();
const uploadImage = require("../middlewares/image-upload.js");

const campaignController = require("../controllers/campaign-controller.js");

routes.post(
  "/deploy-campaign-contract",
  campaignController.deployContract
);
routes.post(
  "/create-campaign",
  uploadImage.single("imageUrl"),
  campaignController.createCampaign
);
routes.post("/send-funds", campaignController.donateFunds);
routes.post("/withdraw-funds", campaignController.withdrawFunds);
routes.post("/get-campaign", campaignController.getCampaign);
routes.post("/get-campaigns", campaignController.getCampaigns);
routes.post("/get-campaign-funders", campaignController.getCampaignFunders);
routes.post("/get-user-stats", campaignController.getUserStats);

module.exports = routes;
