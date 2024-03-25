const { ethers } = require("hardhat");

async function main() {
    const factoryAddress = "0xC7A9074039C7ef74c8fb087dFA9546B4917510f7" // Replace with your factory contract address
    const newImplementationAddress = "0xCCf28A443e35F8bD982b8E8651bE9f6caFEd4672"
    const signers = await ethers.getSigners(); // Fetch the signers
    

    // Connect to the deployed NFTMintFactory
    const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
    const factory = NFTMintFactory.attach(factoryAddress);

    // The first signer is assumed to be the owner
    const owner = signers[2];

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
