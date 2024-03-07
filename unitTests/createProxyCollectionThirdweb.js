const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const beaconProxyAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"; //"0xB9e7771a68BeC052A46cD264d4B32966F2A4893c" 
        const signers = await ethers.getSigners();
        const beacon_admin = signers[1];

        const sdk = await ThirdwebSDK.fromSigner(beacon_admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const nftMint = await sdk.getContract(beaconProxyAddress);

        // Data for creating an NFT
        const _to = beacon_admin.address;
        const _tokenId = 1;//ethers.constants.MaxUint256;
        const _uri = "NA";
        const _amount = 100;

        // Call the createToken function
        const createTokenTx = await nftMint.call("mintTo", [_to, _tokenId, _uri, _amount]);
        //await createTokenTx.wait();
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
