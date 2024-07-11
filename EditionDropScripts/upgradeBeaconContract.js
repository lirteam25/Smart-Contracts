const { ethers } = require("hardhat");

async function main() {
    const factoryAddress = "0x6194880f5b2f24B4c5Ef4b6FF5c2498dc10B6d10" // Replace with your factory contract address
    const newImplementationAddress = "0x54C97C29021A12CACb31F8388B32dd5486083F7B"
    const signers = await ethers.getSigners(); // Fetch the signers
    

    // Connect to the deployed NFTMintFactory
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = NFTMintFactory.attach(factoryAddress);

    // The first signer is assumed to be the owner
    const owner = signers[0];

    // Upgrade the beacon implementation
    const tx = await factory.connect(owner).updateBeaconImplementation(newImplementationAddress);
    await tx.wait();

    console.log(`Beacon upgraded to new implementation: ${newImplementationAddress}`);
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
