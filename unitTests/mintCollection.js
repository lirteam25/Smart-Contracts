const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const nftMintAddress = "0x4dC5a900D414454bfFe05F1128F21D529D1b4062"
        const signers = await ethers.getSigners();
        const admin = signers[1];

        const sdk = await ThirdwebSDK.fromSigner(admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(nftMintAddress);

        // Data for creating an NFT
        const _to = admin.address;
        const _tokenId = ethers.constants.MaxUint256;
        const _uri = "Collection";
        const _amount = 100;

        // Call the createToken function
        const createTokenTx = await nftMint.call("mintTo", [_to, _tokenId, _uri, _amount]);
        const events = await contract.events.getEvents("TokensMinted")

        console.log(events)
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
