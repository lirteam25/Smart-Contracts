const { ethers, upgrades } = require("hardhat");

async function main() {

    // Deploy the Factory Contract
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = await NFTMintFactory.deploy("0x9df5f32ebb7009fc329a3636ff13ac706bf1557b");
    await factory.waitForDeployment();
    console.log("NFTMintFactory deployed to:", (await factory.getAddress()));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
