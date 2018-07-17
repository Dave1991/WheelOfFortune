var Migrations = artifacts.require("./Migrations.sol");
var WheelOfFortune = artifacts.require("./WheelOfFortune.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(WheelOfFortune);
};
