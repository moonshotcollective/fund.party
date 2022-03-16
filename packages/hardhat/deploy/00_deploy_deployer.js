// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // // deploy dummy GTC on non-mainnet networks
  if (chainId !== "1") {
    GTC = await deploy("GTC", {
      from: deployer,
      args: ["0xb010ca9Be09C382A9f31b79493bb232bCC319f01"],
      log: true,
    });
  }

  await deploy("PGDeployer", {
    from: deployer,
    log: true,
  });

  // Getting a previously deployed contract
  const PGDeployer = await ethers.getContract("PGDeployer", deployer);

  // PGDeployer.transferOwnership(YOUR_ADDRESS_HERE);

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  /* if (chainId !== localChainId) {
    await run("verify:verify", {
      address: PGDeployer.address,
      contract: "contracts/PGDeployer.sol:PGDeployer",
      contractArguments: [],
    });
  } */
};
module.exports.tags = ["PGDeployer"];
