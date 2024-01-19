const { ethers } = require("hardhat");

async function main() {
    // Replace with the address of your Beacon Proxy
    const beaconProxyAddress = "0x558aB695c56826055D460c1aa2e304Ec257cd258";

    // Connect to the Beacon Proxy using the interface of NFTMintUpgradableV2
    const NFTMintV2 = await ethers.getContractFactory("NFTMintUpgradableV2");
    const nftMintV2 = NFTMintV2.attach(beaconProxyAddress);

    // Call the new function in NFTMintUpgradableV2 to test the upgrade
    try {
        const result = await nftMintV2.incrementLastTokenId();
        console.log("Function call result:", result);
        console.log("The proxy is using the new implementation.");
    } catch (error) {
        console.error("Function call failed, which may indicate the proxy is not using the new implementation.");
        console.error(error);
    }
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
