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

        const _tokenId = 4

        //await nftMint.erc1155.claimConditions.set(tokenId, claimConditions, true);
        const data = await nftMint.call("uri", [_tokenId])

        console.log("URI:", data)
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();