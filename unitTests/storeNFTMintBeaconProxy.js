const { ethers } = require("hardhat");

async function main() {
    // Replace with the actual addresses
    const marketplaceAddress = "0x736eafe09346fd4bf48a06319f40794926cf4282";
    const beaconProxyAddress = "0xe0C6ABd9b1B1AB7a8EF867F97226C0890C9Faeb6";
    
    // Connect to the deployed NFTMarketplaceUpgradable contract
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplaceUpgradableV2");
    const marketplace = NFTMarketplace.attach(marketplaceAddress);

    // Assuming the first signer is the owner of the marketplace contract
    const signers = await ethers.getSigners();
    const owner = signers[0];

    // Call the storeMintingContracts function
    const tx = await marketplace.connect(owner).storeMintingContracts(beaconProxyAddress);
    await tx.wait();

    console.log(`Beacon proxy address stored: ${beaconProxyAddress}`);
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
