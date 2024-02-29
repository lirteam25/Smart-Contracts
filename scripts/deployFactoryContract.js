const { ethers, upgrades } = require("hardhat");

async function main() {

    // Deploy the Factory Contract
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = await NFTMintFactory.deploy("0x1440e929fE5FfC51aa8e2E3f3eF4521fC412ADB2");
    await factory.waitForDeployment();
    console.log("NFTMintFactory deployed to:", (await factory.getAddress()));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
