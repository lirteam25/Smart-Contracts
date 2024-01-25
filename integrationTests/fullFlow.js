const { ethers, upgrades } = require('hardhat');
const { getImplementationAddress } = require('@openzeppelin/upgrades-core');

describe("NFT Marketplace and Minting System", function () {
    let NFTMarketplace, NFTMint, NFTMintFactory;
    let nftMarketplace, nftMint, nftMintFactory, nftMintV2;
    let owner, addr1, addr2;

    beforeEach(async function () {
        this.timeout(310000);
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy NFTMarketplace V1
        const exchangeRateAddress = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
        NFTMarketplace = await ethers.getContractFactory("NFTMarketplaceUpgradable");
        console.log("Deploying NFTMarketplace...");
        nftMarketplace = await upgrades.deployProxy(NFTMarketplace, [exchangeRateAddress], { initializer: 'initialize' });

        await nftMarketplace.waitForDeployment();

        const nftmarketplace_proxyAddress = (await nftMarketplace.getAddress()).toLowerCase();
        console.log('NFTMarketplace proxy deployed to:', proxyAddress);

        // Retrieve and log the implementation address
        const nftmarketplace_implementationAddress = await getImplementationAddress(ethers.provider, nftmarketplace_proxyAddress);
        console.log('NFTMarketplace implementation deployed to:', nftmarketplace_implementationAddress.toLowerCase());

        // Deploy NFTMint
        NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
        console.log("Deploying NFTMint...");
        const nameToken = "LIRmusic";
        const symbolToken = "lir";
        const ownerAddress = owner.address;
        nftMint = await upgrades.deployProxy(NFTMint, [nameToken, symbolToken, ownerAddress], { initializer: 'initialize' });
      
        await nftMint.waitForDeployment();
      
        const nftmint_proxyAddress = (await nftMint.getAddress()).toLowerCase();
        console.log('NFTMint proxy deployed to:', proxyAddress);
      
        // Retrieve and log the implementation address
        const nftmint_implementationAddress = await getImplementationAddress(ethers.provider, nftmint_proxyAddress);
        console.log('NFTMint implementation deployed to:', nftmint_implementationAddress.toLowerCase());

        // Deploy the Factory Contract
        NFTMintFactory = await ethers.getContractFactory("NFTMintFactory");
        nftMintFactory = await NFTMintFactory.deploy(nftmint_implementationAddress.toLowerCase()); 
        await factory.waitForDeployment();
        console.log("NFTMintFactory deployed to:", (await nftMintFactory.getAddress()));

        // Link NFTMint to NFTMarketplace
        await nftMarketplace.storeMintingContracts(nftMint.address);
        // Add additional setup here if necessary
    });

    it("should upgrade the beacon proxy and mint/list a token", async function () {
        this.timeout(310000);
        // Deploy a Beacon Proxy and Upgrade it to NFTMintUpgradableV2
        const factoryAddress = await nftMintFactory.getAddress();

        // Load the NFTMintFactory contract using Hardhat's environment
        const NFTMintFactory = await ethers.getContractFactory("NFTMintFactory", owner.address);
        const factoryContract = NFTMintFactory.attach(factoryAddress);

        // Data for initializing the new NFTMint contract
        // Assuming you want to initialize with specific name and symbol
        const nameToken = "testNFT2";
        const symbolToken = "TNFT2";
        const ownerAddress = addr1.address;
        const NFTMint = await ethers.getContractFactory("NFTMintUpgradable");
        const initData = NFTMint.interface.encodeFunctionData("initialize", [nameToken, symbolToken, ownerAddress]);

        // Create a new NFTMint proxy
        const tx = await factoryContract.createNFTMint(initData);

        // Test Upgraded Functionality
        // ...

        // Mint and List a Token Collection on NFTMarketplace
        // ...
    });

    it("should upgrade the marketplace and test the MarketSaleMaticGasFree function", async function () {
        this.timeout(310000);
        // Upgrade NFTMarketplace to V2
        // ...

        // Test Marketplace Upgrade
        // ...

        // Test MarketSaleMaticGasFree Function
        // ...
    });
});
