const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Testing Contract Interactions", function () {
    let nftMint;
    let nftMarketplace;
    let nftMintAddress;
    let nftMarketplaceAddress;
    let owner;
    let secondAccount;
    let tokenId;
    const URI = "kmdeka";
    const supply = 20;
    const royalties = 10;
    const price = 0;
    const amount = 10;
    const firstSalesFees = 1;

    before(async function () {
        this.timeout(310000);
        const signers = await ethers.getSigners();
        owner = signers[0];
        secondAccount = signers[1];

        const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
        const nameToken = "PROVA"
        const symbolToken = "CIAO"
        const ownerAddress = owner.address
        nftMint = await upgrades.deployProxy(NFTMint, [nameToken, symbolToken, ownerAddress], { initializer: "initialize" });
        await nftMint.waitForDeployment();
        nftMintAddress = await nftMint.getAddress();
        console.log("nftMint deployed to:", nftMintAddress);

        const NFTMarketplace = await ethers.getContractFactory("NFTMarketplaceUpgradableV2");
        nftMarketplace = await upgrades.deployProxy(NFTMarketplace, ["0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"], { initializer: "initialize" });
        await nftMarketplace.waitForDeployment();
        nftMarketplaceAddress = await nftMarketplace.getAddress();
        console.log("nftMarketplace deployed to:", nftMarketplaceAddress);
    });


    it("Set Minting Contract in NFTMarketplace", async function () {
        this.timeout(310000);
        const transaction = await nftMarketplace.storeMintingContracts(nftMintAddress);
        await transaction.wait();

        console.log(await nftMarketplace.contractsAllowed(0));
        expect(await nftMarketplace.contractsAllowed(0)).to.equal(await nftMintAddress);
    });

    it("Create and list first token", async function () {
        this.timeout(310000);
        const valueInWei = ethers.parseEther(price.toString());
        const transaction = await nftMint.connect(owner).createAndListToken(URI, valueInWei, supply, amount, royalties, firstSalesFees, nftMarketplaceAddress);
        await transaction.wait();
        tokenId = await nftMint.getLastTokenId();
        const symbol = await nftMint.viewSymbol();
        const name = await nftMint.viewName();
        console.log(symbol, name);
        expect(await nftMint.getLastTokenId()).to.equal(1);
    });

    // for (let i = 0; i < 8; i++) {
    //     it(`Purchase token ${i}`, async function () {
    //         this.timeout(310000);
    //         const [roundId, startedAt,] = await nftMarketplace.getLatestPrice();
    //         const valueInWei = ethers.parseEther(price.toString());
    //         const MaticPrice = await nftMarketplace.getLatestPriceGivenRound(roundId, valueInWei);
    //         const transaction = await nftMarketplace.connect(secondAccount).createMarketSaleMatic(
    //             tokenId, nftMintAddress, owner.getAddress(), roundId, startedAt,
    //             { value: MaticPrice }
    //         );
    //         await transaction.wait();
    //    });
    //}
    
    it("Test MarketSaleMaticGasFree with price zero", async function () {
        this.timeout(310000);
    
        let balanceOfSellerBefore = await nftMint.balanceOf(owner.address, tokenId);
        let balanceOfBuyerBefore = await nftMint.balanceOf(secondAccount.address, tokenId);

        // Convert to BigNumber
        balanceOfSellerBefore = ethers.utils.parseUnits(balanceOfSellerBefore.toString());
        balanceOfBuyerBefore = ethers.utils.parseUnits(balanceOfBuyerBefore.toString());

        // Call MarketSaleMaticGasFree as the owner of the marketplace
        const transaction = await nftMarketplace.connect(owner).MarketSaleMaticGasFree(
            tokenId,
            nftMintAddress,
            owner.address, // Token seller's address
            secondAccount.address // Token buyer's address
        );
        await transaction.wait();

        // After transfer: Check ownership
        const balanceOfSellerAfter = await nftMint.balanceOf(owner.address, tokenId);
        const balanceOfBuyerAfter = await nftMint.balanceOf(secondAccount.address, tokenId);

        // Assert the transfer of ownership
        expect(balanceOfSellerBefore.sub(1)).to.equal(balanceOfSellerAfter);
        expect(balanceOfBuyerBefore.add(1)).to.equal(balanceOfBuyerAfter);
    });
    
})
