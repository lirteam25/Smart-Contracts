const { ethers, upgrades } = require('hardhat');
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');
const hre = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();
  const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
  console.log("Deploying NFTMint...");
  const nameToken = "LIRmusic";
  const symbolToken = "lir";
  const ownerAddress = signers[0].address;
  const nftMint = await upgrades.deployProxy(NFTMint, [nameToken, symbolToken, ownerAddress], { initializer: 'initialize' });

  await nftMint.waitForDeployment();

  const proxyAddress = (await nftMint.getAddress()).toLowerCase();
  console.log('NFTMint proxy deployed to:', proxyAddress);

  // Retrieve and log the implementation address
  const implementationAddress = await getImplementationAddress(ethers.provider, proxyAddress);
  console.log('NFTMint implementation deployed to:', implementationAddress.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
