const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {

    const beaconProxyAddress = "0x64171747AE6AdDe869fd949E142782E7538ed2ef"; 
    const signers = await ethers.getSigners();
    const beacon_admin = signers[0];

    const sdk = await ThirdwebSDK.fromSigner(beacon_admin, "mumbai", {secretKey: process.env.THIRDWEB_API_KEY});
    const nftMint = await sdk.getContract(beaconProxyAddress);

    const operator = "0x0ab38Fa75C98721F0604dcc5E52D30D9C1a68459"; // NFTMarketplaceV3 address
    await nftMint.erc1155.setApprovalForAll(operator, true);

    console.log('Marketplace Approved');
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
