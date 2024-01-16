const { ethers, upgrades } = require('hardhat');

async function main() {
  const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
  console.log("Deploying NFTMint...");
  const nameToken = "LIR MUSIC PROVA";
  const symbolToken = "GMCZ";
  const nftMint = await upgrades.deployProxy(NFTMint, [nameToken, symbolToken], { initializer: 'initialize' });

  await nftMint.waitForDeployment();

  console.log('NFTMint deployed to:', (await nftMint.getAddress()).toLowerCase());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });