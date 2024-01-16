const { ethers, upgrades } = require('hardhat');

async function main() {
  try {
    const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
    console.log("Deploying NFTMint...");
    const nftMint = await upgrades.deployProxy(NFTMint, { initializer: 'initialize' });

    await nftMint.waitForDeployment();

    console.log('NFTMint deployed to:', (await nftMint.getAddress()).toLowerCase());

    // For MarketPlace
    const exchangeRateAddress = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
    //0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
    //0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplaceUpgradable");
    console.log("Deploying NFTMarketplace...");
    const nftMarketplace = await upgrades.deployProxy(NFTMarketplace, [exchangeRateAddress], { initializer: 'initialize' });

    await nftMarketplace.waitForDeployment();

    console.log('NFTMarketplace deployed to:', (await nftMarketplace.getAddress()).toLowerCase());

    const transaction = await nftMarketplace.storeMintingContracts(nftMint.getAddress())
    console.log(transaction);
  } catch (error) {
    console.error("Error in script:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });