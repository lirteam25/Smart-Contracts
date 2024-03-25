const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const nftMintAddress = "0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41"; //"0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
        const signers = await ethers.getSigners();
        const buyer = signers[3];

        const sdk = await ThirdwebSDK.fromSigner(buyer, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(nftMintAddress);

        const tokenId = 0; // the id of the NFT you want to claim
        const quantity = 1; // how many NFTs you want to claim

        const tx = await nftMint.erc1155.claim(tokenId, quantity);
        const receipt = tx.receipt; // the transaction receipt

        console.log(receipt)
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();