const { ethers } = require("hardhat");

async function main() {
    const factoryAddress = "0xD41341856bBDB36aDEfDB6a08Ad9d3c523a8973E" // Replace with your factory contract address
    const newImplementationAddress = "0x54C97C29021A12CACb31F8388B32dd5486083F7B"
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
