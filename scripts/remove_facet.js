const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

task("removefacets", "Removes one or more facets to diamond")
  .addParam("diamondaddress", "Diamond address")
  .addParam("facetname", "Facet name to add")
  .addParam("func", "Function signature to remove")
  .addOptionalParam("diamondinitparams", "Diamond init params")
  .setAction(async (taskArgs, hre) => {
    let diamondinitparams = [];
    if (taskArgs.diamondinitparams) {
      diamondinitparams = taskArgs.diamondinitparams.split(",");
    }
    const accounts = await hre.ethers.getSigners();
    const upgradeAdmin = accounts[0];

    console.log(`upgradeAdmin ${upgradeAdmin.address}`);
    console.log(`diamond addr ${taskArgs.diamondaddress}`);

    console.log("func : ", taskArgs.func);
    const facetNames = taskArgs.facetname;
    console.log("facetNames : ", facetNames);
    const cut = [];
    const facet = await ethers.getContractFactory(facetNames, taskArgs.diamondaddress);
    if (taskArgs.func == "all") {
      //  remove all functions in facet and add to cut
      functionSelectors = getSelectors(facet);
    } else {
      functionSelectors = [facet.interface.getSighash(taskArgs.func)];
    }
    cut.push({
      facetAddress: hre.ethers.constants.AddressZero,
      action: FacetCutAction.Remove,
      functionSelectors,
    });
    let tx;
    console.log("try to cut diamond");
    const diamondCutFacet = await ethers.getContractAt("DiamondCutFacet", taskArgs.diamondaddress);
    console.log(`diamondCutFacet ${diamondCutFacet.address}`);
    if (diamondinitparams.length > 0) {
      const DiamondInit = await ethers.getContractFactory("DiamondInit");
      const diamondInit = await DiamondInit.deploy();
      await diamondInit.deployed();
      console.log("DiamondInit deployed: ", diamondInit.address);

      let functionCall = diamondInit.interface.encodeFunctionData("init", diamondinitparams);
      console.log("diamondInit calldata: ", functionCall);
      tx = await diamondCutFacet.diamondCut(cut, diamondInit.address, functionCall);
      console.log("Diamond cut tx: ", tx.hash);
    } else {
      console.log(cut);
      console.log("Diamond cut intitiallize: ");
      tx = await diamondCutFacet.diamondCut(cut, hre.ethers.constants.AddressZero, "0x");
      console.log("Diamond cut tx: ", tx.hash);
    }

    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }
    console.log("Completed diamond cut");
  });

module.exports = {};
