const { ethers, upgrades } = require("hardhat");

async function main() {

    // Deploy the Factory Contract
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = await NFTMintFactory.deploy("0xCCf28A443e35F8bD982b8E8651bE9f6caFEd4672"); // Replace with the current NFTMint implementation address
    await factory.waitForDeployment();
    console.log("NFTMintFactory deployed to:", (await factory.getAddress()));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
