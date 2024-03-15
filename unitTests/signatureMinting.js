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
        const MintRequest = {
            to: buyer.address,
            royaltyRecipient: beacon_admin.address,
            royaltyBps: beacon_admin.address,
            primarySaleRecipient: beacon_admin,
            tokenId: ethers.constants.MaxUint256,
            uri: "CollectionSigneatureMint",
            quantity: 1,
            pricePerToken: 0.001,
            currency: NATIVE_TOKEN_ADDRESS,
            validityStartTimestamp: new Date(Date.now()),
            validityEndTimestamp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            uid: new Date(Date.now())
        }
        // see how to craft a payload to sign in the `contract.erc1155.signature.generate()` documentation
        const signedPayload = nftMint.erc1155.signature().generate(MintRequest);

        // now anyone can mint the NFT
        const tx = nftMint.erc1155.signature.mint(signedPayload);
        const receipt = tx.receipt; // the mint transaction receipt
        const mintedId = tx.id; // the id of the NFT minted
        
        console.log("Transaction successful!");
        console.log(id);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();