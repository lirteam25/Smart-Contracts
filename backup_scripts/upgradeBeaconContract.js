const { ethers, upgrades } = require('hardhat');

async function main() {
    // The address of your UpgradeableBeacon
    const beaconAddress = '0x439Ff9F6034bea3d7436e19D3Efb2c9e3FFaaaA2';

    // The address of the new implementation contract
    const newImplementationContractAddress = '0xc05a733afcd95aa612be614ad76beed647db71cd';

    // Connect to the UpgradeableBeacon
    const nftmint_v2 = await ethers.getContractFactory('NFTMintUpgradableV2');
    await upgrades.upgradeBeacon(beaconAddress, nftmint_v2);
    

    console.log(`Beacon upgraded to new implementation: ${newImplementationContractAddress}`);
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
