const { ethers, upgrades } = require("hardhat");
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');

async function main() {
    const proxyAddress = "0xc9db66ecb75075f345c20af65c0d3d2f72df7bdf"; // Replace with your proxy address

    const NFTMintV2 = await ethers.getContractFactory("NFTMintUpgradableV2");
    console.log("Upgrading NFTMint...");

    // Perform the upgrade
    const upgraded = await upgrades.upgradeProxy(proxyAddress, NFTMintV2);
    await upgraded.waitForDeployment();
    const newProxyAddress = (await upgraded.getAddress()).toLowerCase();
    console.log("NFTMint has been upgraded to:", newProxyAddress);

    // Retrieve and log the implementation address
    const implementationAddress = await getImplementationAddress(ethers.provider, newProxyAddress);
    console.log('NFTMint implementation deployed to:', implementationAddress.toLowerCase());
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
