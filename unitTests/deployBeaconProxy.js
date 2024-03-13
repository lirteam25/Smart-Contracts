const {ethers} = require("hardhat");

async function main() {
    // Getting the signer from Hardhat's environment
    const signers = await ethers.getSigners();
    const beacon_admin = signers[0];
    const proxy_admin = signers[1];

    // NFTMintFactory contract address
    const factoryAddress = "0xC7DB5f3f985845027d5aE80FEfAA1fF0ddEa61A3";

    // Load the NFTMintFactory contract using Hardhat's environment
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory", beacon_admin);
    const factoryContract = NFTMintFactory.attach(factoryAddress);

    // Data for initializing the new NFTMint contract
    // Assuming you want to initialize with specific name and symbol
    const nameToken = "testNFT2";
    const symbolToken = "TNFT2";
    const ownerAddress = beacon_admin.address
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
