const { ethers } = require("hardhat");

async function main() {
    // Getting the signer from Hardhat's environment
    const signers = await ethers.getSigners();
    const beacon_admin = signers[0];

    // NFTMintFactory contract address
    const factoryAddress = "0x19C5a6C343715E72354f4A55aeb1E64B4aBb45AC";

    // Load the NFTMintFactory contract using Hardhat's environment
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory", beacon_admin);
    const factoryContract = NFTMintFactory.attach(factoryAddress);

    // Data for initializing the new NFTMint contract
    // Assuming you want to initialize with specific name and symbol
    const nameToken = "ArtistNFT2";
    const symbolToken = "ART2";
    const ownerAddress = proxy_admin.address;
    const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
    const initData = NFTMint.interface.encodeFunctionData("initialize", [nameToken, symbolToken, ownerAddress]);

    // Create a new NFTMint proxy
    const tx = await factoryContract.createNFTMint(initData);
    console.log(tx)

    // Find the deployed proxy address from the event
    // const event = tx.logs.find(event => event.event === 'NFTMintDeployed');
    // const proxyAddress = event.args.proxyAddress;
    // console.log("Deployed NFTMint proxy address:", proxyAddress);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
