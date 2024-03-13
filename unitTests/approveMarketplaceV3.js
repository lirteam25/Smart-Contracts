const { ethers } = require("hardhat");
const { ThirdwebSDK } = require("@thirdweb-dev/sdk");

async function main() {

    const beaconProxyAddress = "0xC1CF42c4d8cc13bdAb713709D333Ca74c53A49EA"; 
    const signers = await ethers.getSigners();
    const beacon_admin = signers[1];

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
