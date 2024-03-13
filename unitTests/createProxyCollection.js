const { ethers } = require("hardhat");

async function main() {
    // The address of your deployed Beacon Proxy
    const beaconProxyAddress = "0xe0C6ABd9b1B1AB7a8EF867F97226C0890C9Faeb6";

    // The account that will interact with the contract
    // Ensure this account is the owner of the contract
    const signers = await ethers.getSigners();
    const beacon_admin = signers[0];
    const proxy_admin = signers[1];

    // Connect to the Beacon Proxy using the interface of NFTMintUpgradable
    const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
    const nftMint = new ethers.Contract(beaconProxyAddress, NFTMint.interface, beacon_admin);

    // Data for creating an NFT
    const tokenURI = "https://example.com/nft2.json";
    const supply = 100;  // Total supply of the NFT
    const royalties = 10; // Royalty percentage

    // Call the createToken function
    const createTokenTx = await nftMint.createToken(tokenURI, supply, royalties);
    await createTokenTx.wait();

    // Fetch the newly created token's ID
    const newTokenId = await nftMint.getLastTokenId();
    console.log("Newly created Token ID:", newTokenId.toString());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
