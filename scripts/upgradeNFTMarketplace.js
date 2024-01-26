const { ethers, upgrades } = require("hardhat");

async function main() {
    const proxyAddress = '0x2c783c72f46b1e6213a2cba0d92e9e3711b694ca' // "0x405c2520d74b5e8df51668f62a9c598d29f465e7";  Replace with your proxy address
    const currentImplementationAddress = "0xf8c098542BF4E18dc21f1Cd4AA3b7D9BA778fBC4"; // Replace with the current implementation address

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
