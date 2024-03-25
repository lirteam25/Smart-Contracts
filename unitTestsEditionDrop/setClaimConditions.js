const { ethers } = require("hardhat");
const { ThirdwebSDK, NATIVE_TOKEN_ADDRESS } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const nftMintAddress = "0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41"; //"0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
        const signers = await ethers.getSigners();
        const admin = signers[2];

        const sdk = await ThirdwebSDK.fromSigner(admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(nftMintAddress);

        const publicSaleStartTime = new Date();
        const tokenId = 0;
        const claimConditions = [
        {
        },
        {
            startTime: publicSaleStartTime, 
            currencyAddress: NATIVE_TOKEN_ADDRESS,
            price: 0.001, // public sale price
            maxClaimableSupply: 100
        }
        ];
        await nftMint.erc1155.claimConditions.set(tokenId, claimConditions);

        const events = await nftMint.events.getEvents("ClaimConditionsUpdated")

        console.log(events)
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();