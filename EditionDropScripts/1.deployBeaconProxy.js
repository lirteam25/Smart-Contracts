const { ethers } = require("hardhat");

async function main() {
    // Getting the signer from Hardhat's environment
    const signers = await ethers.getSigners();
    const beacon_admin = signers[2];
    const mrkt_admin = signers[0];

    // NFTMintFactory contract address
    const factoryAddress = "0x6194880f5b2f24B4c5Ef4b6FF5c2498dc10B6d10";

    // Load the NFTMintFactory contract using Hardhat's environment
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory", beacon_admin);
    const factoryContract = NFTMintFactory.attach(factoryAddress);

    // ABI for the NFTMint contract
    const NFTMintDropABI = require('../NFTMintDropABI.json'); // Adjust the path accordingly 
    const NFTMintAddress = "0x76F948E5F13B9A84A81E5681df8682BBf524805E"; // Replace with the actual NFTMint contract address

    // Create a contract instance for NFTMint using its ABI
    const NFTMint = new ethers.Contract(NFTMintAddress, NFTMintDropABI, beacon_admin);

    // Data for initializing the new NFTMint contract
    // Assuming you want to initialize with a specific name and symbol
    const _defaultAdmin = beacon_admin.address; // Artist wallet
    const _name = "testNFT";
    const _symbol = "TNF";
    const _contractURI = "your_contract_uri";
    const _trustedForwarders = [];
    const _primarySaleRecipient = beacon_admin.address; // Artist wallet
    const _royaltyRecipient = beacon_admin.address; // Artist wallet
    const _royaltyBps = 500; // Example: 500 basis points
    const _platformFeeBps = 200; // Example: 200 basis points
    const _platformFeeRecipient = mrkt_admin.address; // Marketplace owner

    // Data for initializing the new NFTMint contract
    const initData = NFTMint.interface.encodeFunctionData("initialize", [
        _defaultAdmin,
        _name,
        _symbol,
        _contractURI,
        _trustedForwarders,
        _primarySaleRecipient,
        _royaltyRecipient,
        _royaltyBps,
        _platformFeeBps,
        _platformFeeRecipient
    ]);

    // Create a new NFTMint proxy
    const tx = await factoryContract.createNFTMint(initData);
    console.log(tx);

    //grant minter role to artist
    //await contract.roles.grant("minter", "{{wallet_address}}");

}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
