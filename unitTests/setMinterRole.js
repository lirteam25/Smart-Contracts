const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const beaconProxyAddress = "0x64171747AE6AdDe869fd949E142782E7538ed2ef"//"0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"; //"0xB9e7771a68BeC052A46cD264d4B32966F2A4893c" 
        const signers = await ethers.getSigners();
        const beacon_admin = signers[0];
        const minter = signers[3]

        const sdk = await ThirdwebSDK.fromSigner(beacon_admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(beaconProxyAddress);

        // Call the createToken function
        const createTokenTx = await nftMint.roles.grant("minter", minter.address);
        console.log(createTokenTx)
        //await createTokenTx.wait();
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
