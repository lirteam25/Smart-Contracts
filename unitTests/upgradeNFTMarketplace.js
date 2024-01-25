const { ethers, upgrades } = require("hardhat");
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');

async function main() {
    const proxyAddress = '0x49671363b3ce57c56aeb29cbe6402cf6f09f6cd8' // "0x405c2520d74b5e8df51668f62a9c598d29f465e7";  Replace with your proxy address
    // const currentImplementationAddress = "0xf8c098542BF4E18dc21f1Cd4AA3b7D9BA778fBC4"; // Replace with the current implementation address

    const NFTMarketplaceV2 = await ethers.getContractFactory("NFTMarketplaceUpgradableV2");
    console.log("Preparing to upgrade NFTMarketplace...");

    // // Force import the existing proxy
    // await upgrades.forceImport(proxyAddress, NFTMarketplace, { implementation: currentImplementationAddress });

    // console.log("Upgrading NFTMarketplace...");

    // Perform the upgrade
    const upgraded = await upgrades.upgradeProxy(proxyAddress, NFTMarketplaceV2);
    await upgraded.waitForDeployment();
    console.log("NFTMarketplace has been upgraded");

    // Retrieve and log the new implementation address
    const newImplementationAddress = await getImplementationAddress(ethers.provider, (await upgraded.getAddress()).toLowerCase());
    console.log('New NFTMarketplace implementation deployed to:', newImplementationAddress.toLowerCase());
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
