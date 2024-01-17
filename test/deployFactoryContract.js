const { ethers, upgrades } = require("hardhat");

async function main() {

    // Deploy the Factory Contract
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = await NFTMintFactory.deploy("0x3D0F85cB85f52aA301BC8Ee4EAA52e06c4Cbfba0", "0xB36C0BcD40EC2837c01840CDBF42C347D07885B1"); // The factory constructor needs only the beacon address
    await factory.waitForDeployment();
    console.log("NFTMintFactory deployed to:", (await factory.getAddress()));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
