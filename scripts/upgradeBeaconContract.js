const { ethers } = require("hardhat");

async function main() {
    const factoryAddress = "0x5166728452CcFedE1D280B55D4a51211Ec135afB"; // Replace with your factory contract address
    const newImplementationAddress = "0xc05a733afcd95aa612be614ad76beed647db71cd";
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
