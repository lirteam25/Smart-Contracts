const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const beaconProxyAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"//"0xF68C94c0BdfA9492A5FE931011583A4bDb43d94f"; //"0xB9e7771a68BeC052A46cD264d4B32966F2A4893c" 
        const signers = await ethers.getSigners();
        const beacon_admin = signers[0];

        const sdk = await ThirdwebSDK.fromSigner(beacon_admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(beaconProxyAddress);

        // Call the createToken function
        const createTokenTx = await nftMint.call("owner", []);
        console.log(createTokenTx)
        //await createTokenTx.wait();
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
