const { ethers, upgrades } = require("hardhat");

async function main() {
    const proxyAddress = '0x5f5f41df03c52c47067543c5534800204ad0a634' // "0x405c2520d74b5e8df51668f62a9c598d29f465e7";  Replace with your proxy address
    const currentImplementationAddress = "0x760772dc4923cace9765B293a43FBa5003fBEf69"; // Replace with the current implementation address

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplaceUpgradable");
    console.log("Preparing to upgrade NFTMarketplace...");

    const NFTMarketplaceV2 = await ethers.getContractFactory("NFTMarketplaceUpgradableV2");

    // // Force import the existing proxy
    await upgrades.forceImport(proxyAddress, NFTMarketplace, { implementation: currentImplementationAddress });

    console.log("Upgrading NFTMarketplace...");

    // Perform the upgrade
    const upgraded = await upgrades.upgradeProxy(proxyAddress, NFTMarketplaceV2);
    await upgraded.waitForDeployment();
    console.log("NFTMarketplace has been upgraded");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
