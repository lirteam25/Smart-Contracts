const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const nftMintAddress = "0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41"; //"0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
        const signers = await ethers.getSigners();
        const buyer = signers[2];

        const sdk = await ThirdwebSDK.fromSigner(buyer, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(nftMintAddress);

        const data = []

        const results = await nftMint.call("lazyMint", [1, "baseURI", data]); // uploads and creates the NFTs on chain
        const events = await nftMint.events.getEvents("TokensLazyMinted")
        
        console.log(events[0].data.startTokenId.toString())
        console.log("Transaction successful!");

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();