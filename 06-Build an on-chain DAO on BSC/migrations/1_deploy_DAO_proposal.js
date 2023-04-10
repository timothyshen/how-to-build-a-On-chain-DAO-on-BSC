const BSCDAO = artifacts.require("DAOProposal");

module.exports = function (deployer) {
  deployer.deploy(BSCDAO);
};
