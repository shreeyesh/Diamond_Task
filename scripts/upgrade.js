const { getSelectors, FacetCutAction } = require('./libraries/diamond.js');
const { BigNumber } = require("ethers");
async function upgradeTest(){

    const DiamondCutFacet = await ethers.getContractAt('DiamondCutFacet', '0xCace1b78160AE76398F486c8a18044da0d66d86D');
    const ACAP = await ethers.getContractFactory('A')
    const A = await ACAP.deploy()
    await A.deployed()
    console.log('A deployed:', A.address)
    await A.setNumber("10");
    console.log("Set number is", await A.getNumber());
    
    
    const cut = []
    cut.push({
        facetAddress: A.address,
        action: FacetCutAction.Replace,
        functionSelectors: getSelectors(A)
    })
    let tx = await DiamondCutFacet.diamondCut(cut, ethers.constants.AddressZero, "0x");
    await tx.wait();
    console.log("Tx: ", tx.hash);
    await A.setNumber("5");
    console.log("Set number is",await A.getNumber());

}

upgradeTest();