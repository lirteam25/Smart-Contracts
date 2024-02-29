const { ethers, upgrades } = require('hardhat');

async function main() {
  const signers = await ethers.getSigners();
  const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
  console.log("Deploying NFTMint...");
  const nameToken = "LIR MUSIC IMPLEMENTATION";
  const symbolToken = "LRI";
  const ownerAddress = signers[0].address;
  const nftMint = await upgrades.deployProxy(NFTMint, [nameToken, symbolToken, ownerAddress], { initializer: 'initialize' });

  await nftMint.waitForDeployment();

  const proxyAddress = (await nftMint.getAddress()).toLowerCase();
  console.log('NFTMint proxy deployed to:', proxyAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
