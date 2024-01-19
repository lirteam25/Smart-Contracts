const { ethers, upgrades } = require("hardhat");

async function main() {
    const deployers = await ethers.getSigners();

    // Deploy the UpgradeableBeacon with the address of NFTMintUpgradable
    const UpgradeableBeacon = await ethers.getContractFactory("NFTMintUpgradable");
    const beacon = await upgrades.deployBeacon(UpgradeableBeacon, deployers[0].address);
    await beacon.waitForDeployment();
    console.log("UpgradeableBeacon deployed to:", (await beacon.getAddress()));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
