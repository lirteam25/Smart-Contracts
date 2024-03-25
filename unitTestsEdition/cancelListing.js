const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Marketplace
        const marketplaceAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
        const signers = await ethers.getSigners();
        const lister = signers[0];

        const sdk = await ThirdwebSDK.fromSigner(lister, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const NFTMarkeplace = await sdk.getContract(marketplaceAddress);

        // The ID of the listing you want to cancel
        const listingId = 0;

        await NFTMarkeplace.directListings.cancelListing(listingId);
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
