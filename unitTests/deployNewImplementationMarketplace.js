const { ethers } = require('hardhat');

async function main() {
    const NFTMarketplaceV2 = await ethers.getContractFactory("NFTMarketplaceUpgradableV2");
    console.log("Deploying new implementation of NFTMarketplace...");

    const nftMarketplaceV2 = await NFTMarketplaceV2.deploy(); // No parameters since it's a plain deployment
    await nftMarketplaceV2.waitForDeployment();

    const newAddress = (await nftMarketplaceV2.getAddress()).toLowerCase();

    console.log('New NFTMarketplace implementation deployed to:', newAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
