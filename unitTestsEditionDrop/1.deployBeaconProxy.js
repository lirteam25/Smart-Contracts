const { ethers } = require("hardhat");

async function main() {
    // Getting the signer from Hardhat's environment
    const signers = await ethers.getSigners();
    const beacon_admin = signers[2];
    const mrkt_admin = signers[0];

    // NFTMintFactory contract address
    const factoryAddress = "0xD41341856bBDB36aDEfDB6a08Ad9d3c523a8973E";

    // Load the NFTMintFactory contract using Hardhat's environment
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory", beacon_admin);
    const factoryContract = NFTMintFactory.attach(factoryAddress);

    // ABI for the NFTMint contract
    const NFTMintABI = require('../NFTMintABI.json'); // Adjust the path accordingly 
    const NFTMintAddress = "0xCCf28A443e35F8bD982b8E8651bE9f6caFEd4672"; // Replace with the actual NFTMint contract address

    // Create a contract instance for NFTMint using its ABI
    const NFTMint = new ethers.Contract(NFTMintAddress, NFTMintABI, beacon_admin);

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
    const _platformFeeBps = 300; // Example: 200 basis points
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
