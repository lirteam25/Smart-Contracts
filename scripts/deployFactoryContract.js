const { ethers, upgrades } = require("hardhat");

async function main() {

    // Deploy the Factory Contract
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = await NFTMintFactory.deploy("0x54C97C29021A12CACb31F8388B32dd5486083F7B"); // Replace with the current NFTMint implementation address
    await factory.deployed();
    console.log("NFTMintFactory deployed to:", (await factory.address));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
