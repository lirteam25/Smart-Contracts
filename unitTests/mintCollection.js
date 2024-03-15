const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const nftMintAddress = "0x64171747AE6AdDe869fd949E142782E7538ed2ef"; //"0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
        const signers = await ethers.getSigners();
        const admin = signers[0];
        const minter = signers[3];

        const sdk = await ThirdwebSDK.fromSigner(minter, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(nftMintAddress);

        // Data for creating an NFT
        const _to = minter.address;
        const _tokenId = 0;
        const _uri = "Collection";
        const _amount = 10;

        // Call the createToken function
        const createTokenTx = await nftMint.call("mintTo", [_to, _tokenId, _uri, _amount]);
        const events = await nftMint.events.getEvents("TokensMinted")

        console.log(events)
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
