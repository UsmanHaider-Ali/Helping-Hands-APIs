var Campaign = artifacts.require("Campaign");
module.exports = function (deployer) {
x=  deployer.deploy(Campaign, 1,"Title","Description",1,10000,600);
console.log("Value of x");
console.log(x);
};
