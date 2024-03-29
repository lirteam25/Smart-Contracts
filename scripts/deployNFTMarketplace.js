const { ethers, upgrades } = require('hardhat');
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');

async function main() {
    const exchangeRateAddress = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
    //0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
    //0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplaceUpgradable");
    console.log("Deploying NFTMarketplace...");
    const nftMarketplace = await upgrades.deployProxy(NFTMarketplace, [exchangeRateAddress], { initializer: 'initialize' });

    await nftMarketplace.waitForDeployment();

    const proxyAddress = (await nftMarketplace.getAddress()).toLowerCase();
    console.log('NFTMarketplace proxy deployed to:', proxyAddress);

    // Retrieve and log the implementation address
    const implementationAddress = await getImplementationAddress(ethers.provider, proxyAddress);
    console.log('NFTMarketplace implementation deployed to:', implementationAddress.toLowerCase());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });