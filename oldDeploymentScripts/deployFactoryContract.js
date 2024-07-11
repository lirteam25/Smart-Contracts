const { ethers, upgrades } = require("hardhat");

async function main() {

    // Deploy the Factory Contract
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = await NFTMintFactory.deploy("0x76F948E5F13B9A84A81E5681df8682BBf524805E"); // Replace with the current NFTMint implementation address
    await factory.deployed();
    console.log("NFTMintFactory deployed to:", (await factory.address));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
