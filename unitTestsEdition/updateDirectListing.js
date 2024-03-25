const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {

    const marketplaceAddress = "0x0ab38Fa75C98721F0604dcc5E52D30D9C1a68459"; 
    const nftMintAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
    const signers = await ethers.getSigners();
    const lister = signers[1];

    const sdk = await ThirdwebSDK.fromSigner(lister, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
    const NFTMarketplaceV3= await sdk.getContract(marketplaceAddress);

    const listing = {
        // address of the contract the asset you want to list is on
        assetContractAddress: nftMintAddress,
        // token ID of the asset you want to list
        tokenId: "0",
        // how many of the asset you want to list
        quantity: 2,
        // address of the currency contract that will be used to pay for the listing
        currencyContractAddress: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
        // The price to pay per unit of NFTs listed.
        pricePerToken: 1.5,
        // when should the listing open up for offers
        startTimestamp: new Date(Date.now()),
        // how long the listing will be open for
        endTimestamp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        // Whether the listing is reserved for a specific set of buyers.
        isReservedListing: false
    }
    
    const tx = await NFTMarketplaceV3.directListings.updateListing(listing);
    const event = await NFTMarketplaceV3.events.getEvents("UpdatedListing")

    console.log(event)
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
