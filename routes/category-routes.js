const express = require("express");
const routes = express.Router();

const categoryController = require("../controllers/category-controller.js");

//Create Category
routes.post("/create-category", categoryController.createCategory);
routes.get("/get-all-categories", categoryController.getAllCategories);
routes.delete("/delete-category", categoryController.deleteCategory);

module.exports = routes;
