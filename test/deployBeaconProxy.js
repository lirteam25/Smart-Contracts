const {ethers} = require("hardhat");

async function main() {
    // Getting the signer from Hardhat's environment
    const signers = await ethers.getSigners();
    const beacon_admin = signers[0];
    const proxy_admin = signers[1];

    // NFTMintFactory contract address
    const factoryAddress = "0x5166728452CcFedE1D280B55D4a51211Ec135afB";

    // Load the NFTMintFactory contract using Hardhat's environment
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory", proxy_admin);
    const factoryContract = NFTMintFactory.attach(factoryAddress);

    // Data for initializing the new NFTMint contract
    // Assuming you want to initialize with specific name and symbol
    const nameToken = "ArtistNFT2";
    const symbolToken = "ART2";
    const ownerAddress = proxy_admin.address
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
