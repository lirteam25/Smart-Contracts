const { ethers } = require("hardhat");

async function main() {
    // Getting the signer from Hardhat's environment
    const signers = await ethers.getSigners();
    const beacon_admin = signers[0];
    const proxy_admin = signers[1];

    // NFTMintFactory contract address
    const factoryAddress = "0x2D6378A1cb0B4875aB5Af3a0505Cf8D3800a5B2D";

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
    const _defaultAdmin = beacon_admin.address;
    const _name = "testNFT2";
    const _symbol = "TNFT2";
    const _contractURI = "your_contract_uri";
    const _trustedForwarders = [];
    const _primarySaleRecipient = proxy_admin.address;
    const _royaltyRecipient = proxy_admin.address;
    const _royaltyBps = 500; // Example: 500 basis points
    const _platformFeeBps = 200; // Example: 200 basis points
    const _platformFeeRecipient = beacon_admin.address;

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
