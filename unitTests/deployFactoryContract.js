const { ethers, upgrades } = require("hardhat");

async function main() {

    // Deploy the Factory Contract
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = await NFTMintFactory.deploy("0x7a3d52eba0477cfeaeb3742e13d89c6ba120fd5f"); 
    await factory.waitForDeployment();
    console.log("NFTMintFactory deployed to:", (await factory.getAddress()));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
