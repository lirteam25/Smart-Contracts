const { ethers } = require("hardhat");
const { ThirdwebSDK, NATIVE_TOKEN_ADDRESS } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const beaconProxyAddress = "0x64171747AE6AdDe869fd949E142782E7538ed2ef"//"0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"; //"0xB9e7771a68BeC052A46cD264d4B32966F2A4893c" 
        const signers = await ethers.getSigners();
        const beacon_admin = signers[0];
        const marketplaceAdmin = signers[1];
        const buyer = signers[2];

        const sdk = await ThirdwebSDK.fromSigner(beacon_admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(beaconProxyAddress);

        // Signature payload
        const payload = {
            tokenId: 0, // Instead of metadata, we specify the token ID of the NFT to mint supply to
            to: buyer.address, // Who will receive the NFT (or AddressZero for anyone)
            quantity: 1, // the quantity of NFTs to mint
            price: 0.001, // the price per NFT
            currencyAddress: NATIVE_TOKEN_ADDRESS, // the currency to pay with
            mintStartTime: new Date(Date.now()), // can mint anytime from now
            mintEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // to 24h from now
            royaltyRecipient: beacon_admin.address, // custom royalty recipient for this NFT
            royaltyBps: 500, // custom royalty fees for this NFT (in bps)
            primarySaleRecipient: beacon_admin.address // custom sale recipient for this NFT
        };
        // see how to craft a payload to sign in the `contract.erc1155.signature.generate()` documentation
        const signedPayload = await nftMint.erc1155.signature.generateFromTokenId(payload);
        console.log(signedPayload);
        // Now you can verify that the payload is valid
        const isValid = await nftMint.erc1155.signature.verify(signedPayload);
        console.log(isValid);

        const sdk2 = await ThirdwebSDK.fromSigner(buyer, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint2 = await sdk2.getContract(beaconProxyAddress);
        // now anyone can mint the NFT
        //const tx = await nftMint2.call("mintWithSignature", [payload, signedPayload]);
        const tx = await nftMint2.erc1155.signature.mint(signedPayload)
        const receipt = tx.receipt; // the mint transaction receipt
        const mintedId = tx.id; // the id of the NFT minted
        
        console.log("Transaction successful!");
        console.log(mintedId);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();