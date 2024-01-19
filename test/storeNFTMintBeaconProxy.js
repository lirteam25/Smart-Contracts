const { ethers } = require("hardhat");

async function main() {
    // Replace with the actual addresses
    const marketplaceAddress = "0xd240a511b1d7702a6cd72d1e9947ed61afd6cb6a";
    const beaconProxyAddress = "0xf3E60c9b99C4Fd613eC14f0880E913B673B8d500";
    
    // Connect to the deployed NFTMarketplaceUpgradable contract
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplaceUpgradable");
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
