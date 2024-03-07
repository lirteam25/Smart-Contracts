const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {
    try {
        const signers = await ethers.getSigners();
        const admin = signers[1];

        const sdk = await ThirdwebSDK.fromSigner(admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
        const contract_address = await sdk.deployer.deployEdition({
            name: "NFTMint",
            primary_sale_recipient: admin.address, 
          });
        console.log("Deployed at", contract_address);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
