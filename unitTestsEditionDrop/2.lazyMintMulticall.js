const { ethers } = require("hardhat");
const { ThirdwebSDK, NATIVE_TOKEN_ADDRESS, TokenMintInputSchema } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const nftMintAddress = "0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41"; //"0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"
        const signers = await ethers.getSigners();
        const buyer = signers[2];

        const sdk = await ThirdwebSDK.fromSigner(buyer, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(nftMintAddress);

        const nextTokenIdToMint = parseInt(await nftMint.call("nextTokenIdToMint", []));
        console.log("TokenId: ", nextTokenIdToMint)

        const publicSaleStartTime = new Date();
        const claimConditions = [
        {
        },
        {
            startTime: publicSaleStartTime, 
            currencyAddress: NATIVE_TOKEN_ADDRESS,
            price: 0.001, // public sale price
            maxClaimableSupply: 1
        }];

        const data = []

        console.log('Starting lazyMint...')

        console.log("Econding data...")
        const encodedMint = nftMint.encoder.encode("lazyMint", [1, "baseURI", data])
        let tx = await nftMint.erc1155.claimConditions.set.prepare(nextTokenIdToMint, claimConditions, true);
        const encodedConditions = tx.encode()
        //const encodedConditions = nftMint.encoder.encode("setClaimConditions", [nextTokenIdToMint, claimConditions, false])

        const results = await nftMint.call("multicall", [
            [
                encodedMint, encodedConditions
            ]
        ]);
              
        const events = await nftMint.events.getEvents("TokensLazyMinted")
        
        console.log("TokenId Minted: ", events[0].data.startTokenId.toString())
        console.log("Transaction successful!");

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();