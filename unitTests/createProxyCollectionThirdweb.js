const { ethers } = require("hardhat");

async function main() {
    // The address of your deployed Beacon Proxy
    const beaconProxyAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA";

    // The account that will interact with the contract
    // Ensure this account is the owner of the contract
    const signers = await ethers.getSigners();
    const beacon_admin = signers[0];
    const proxy_admin = signers[1];

    // ABI for the NFTMint contract
    const NFTMintABI = require('../NFTMintABI.json'); // Adjust the path accordingly 

    // Create a contract instance for NFTMint using its ABI
    const nftMint = new ethers.Contract(beaconProxyAddress, NFTMintABI, beacon_admin);

    // Data for creating an NFT
    const _to = beacon_admin.address;
    const _tokenId = "1";  
    const _uri = "NA"; 
    const _amount = 100

    // Call the createToken function
    const createTokenTx = await nftMint.mintTo(_to, _tokenId, _uri, _amount);
    await createTokenTx.wait();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
