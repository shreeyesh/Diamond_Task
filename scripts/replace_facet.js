const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");


task("replacefacets", "Replaces one or more facets to diamond")
  .addParam("diamondaddress", "Diamond address")
  .addParam("facetname", "Facet name to replace")
  .addParam("func", "Function name to replace")
  .addOptionalParam("diamondinitparams", "Diamond init params")
  .setAction(async (taskArgs, hre) => {
    let diamondinitparams = [];
    if (taskArgs.diamondinitparams) {
      diamondinitparams = taskArgs.diamondinitparams.split(",");
    }
    const accounts = await hre.ethers.getSigners();
    const upgradeAdmin = accounts[0];

    console.log(`upgradeAdmin ${upgradeAdmin.address}`);

    const facetNames = taskArgs.facetname;
    const cut = [];
    const Facet = await ethers.getContractFactory(facetNames);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${facetNames} deployed: ${facet.address}`);
    if (taskArgs.func == "all") {
      //  replace all functions in facet ){
      functionSelectors = getSelectors(facet);
    } else {
      functionSelectors = [facet.interface.getSighash(taskArgs.func)];
    }
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Replace,
      functionSelectors,
    });
    console.log("getSelectors(facet) : ", getSelectors(facet));
    console.log("cut : ", cut[0]);
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
