const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Marketplace
        const marketplaceAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
        const signers = await ethers.getSigners();
        const buyer = signers[0];

        const sdk = await ThirdwebSDK.fromSigner(buyer, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const NFTMarkeplace = await sdk.getContract(marketplaceAddress);

        // The ID of the listing you want to buy from
        const listingId = 0;
        // Quantity of the asset you want to buy
        const quantityDesired = 1;

        await NFTMarkeplace.directListings.buyFromListing(listingId, quantityDesired, buyer.address);
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
