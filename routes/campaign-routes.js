const express = require("express");
const routes = express.Router();
const uploadImage = require("../middlewares/image-upload.js");

const campaignController = require("../controllers/campaign-controller.js");

routes.post("/deploy-contract", campaignController.deployeContract);
routes.post(
  "/create-campaign",
  uploadImage.single("imageUrl"),
  campaignController.createCampaign
);
routes.post("/send-funds", campaignController.donateFunds);
routes.post("/withdraw-funds", campaignController.withdrawFunds);
routes.post("/get-campaign", campaignController.getCampaign);
routes.post("/get-all-campaigns", campaignController.getAllCampaigns);
routes.post("/get-my-campaigns", campaignController.getMyCampaigns);
routes.post(
  "/get-all-campaigns-by-category",
  campaignController.getAllCampaignsByCategory
);
routes.post(
  "/get-my-campaigns-by-category",
  campaignController.getMyCampaignsByCategory
);

module.exports = routes;
