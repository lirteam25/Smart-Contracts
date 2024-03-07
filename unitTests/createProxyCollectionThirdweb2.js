const { ethers } = require("hardhat");

async function main() {
    try {
        // The address of your deployed Beacon Proxy
        const beaconProxyAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"; //"0xB9e7771a68BeC052A46cD264d4B32966F2A4893c" 
        const signers = await ethers.getSigners();
        const beacon_admin = signers[1];

        // ABI for the NFTMint contract
        const NFTMintABI = require('../NFTMintABI.json'); // Adjust the path accordingly 

        // Create a contract instance for NFTMint using its ABI
        const nftMint = new ethers.Contract(beaconProxyAddress, NFTMintABI, beacon_admin);

        // Data for creating an NFT
        const _to = beacon_admin.address;
        const _tokenId = ethers.constants.MaxUint256;
        const _uri = "beaconProxyMint";
        const _amount = 10; 

        console.log('Calling the Minting function')
        // Call the createToken function
        const createTokenTx = await nftMint.mintTo(_to, _tokenId, _uri, _amount);
        //await createTokenTx.wait();
        
        console.log("Transaction successful!");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
