const { ethers } = require("hardhat");

async function main() {
    const [owner, buyer, addr3] = await ethers.getSigners();

    // Contract instances
    console.log('loading the contracts...')
    const NFTMint = await ethers.getContractAt("NFTMintUpgradable", "0xc9db66ecb75075f345c20af65c0d3d2f72df7bdf");
    const NFTMarketplace = await ethers.getContractAt("NFTMarketplaceUpgradableV2", "0x49671363b3ce57c56aeb29cbe6402cf6f09f6cd8");

    // Register NFTMint in NFTMarketplace
    console.log('storing nftmint...')
    await NFTMarketplace.connect(owner).storeMintingContracts("0xc9db66ecb75075f345c20af65c0d3d2f72df7bdf");

    // Create an NFT
    const tokenURI = "https://example.com/token.json"; // Replace with your token URI
    const supply = 10;
    const royalties = 10; // Set as appropriate
    const createTx = await NFTMint.connect(owner).createToken(tokenURI, supply, royalties);
    const receipt = await createTx.wait();
    // console.log('retrieve 1 from emitted event...')
    // const 1 = receipt.events.find(e => e.event === 'TokenCreated').args.1;

    // List the NFT at price 0
    console.log('listing...')
    await NFTMint.connect(owner).firstListing(1, 0, supply, supply, royalties, 10, "0x49671363b3ce57c56aeb29cbe6402cf6f09f6cd8");

    // Buy the NFT using GasFreeTransaction
    console.log('gasFree sale...')
    await NFTMarketplace.connect(owner).GasFreeTransaction(1, "0xc9db66ecb75075f345c20af65c0d3d2f72df7bdf", owner.address, buyer.address);

    // Verify Ownership Transfer
    const newOwnerBalance = await NFTMint.balanceOf(buyer.address, 1);
    console.log("New Owner Balance:", newOwnerBalance.toString());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
