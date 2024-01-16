This project contains the two upgradable smart contracts used in LIR music creation.
This are the most important commands:

```shell

//To compile the contract
npx hardhat compile

//To test contract
npx hardhat test

//For the first deployment of the contracts
npx hardhat run scripts/firstDeploy.js --network polygon_mumbai
npx hardhat run scripts/firstDeploy.js --network polygon_mainnet

//Deployment of NFTMint
npx hardhat run scripts/deployNFTMint.js --network polygon_mumbai
npx hardhat run scripts/deployNFTMint.js --network polygon_mainnet

//Deployment of NFTMarketplace
npx hardhat run scripts/deployNFTMarketplace.js --network polygon_mumbai
npx hardhat run scripts/deployNFTMarketplace.js --network polygon_mainnet

//To verify the contract and the Implementation-Proxy link 
npx hardhat verify --contract "contracts/NFTMint.sol:NFTMintUpgradable" contract.address --network polygon_mumbai
npx hardhat verify --contract "contracts/NFTMint.sol:NFTMintUpgradable" contract.address --network polygon_mainnet

npx hardhat verify --contract "contracts/NFTMarketplace.sol:NFTMarketplaceUpgradable" contract.address --network polygon_mumbai
npx hardhat verify --contract "contracts/NFTMarketplace.sol:NFTMarketplaceUpgradable" contract.address --network polygon_mainnet

//To transfer the Ownership of the contract
npx hardhat run scripts/transferOwnership.js --network polygon_mainnet

//To update the contract that can interact with NFTMarketplace
npx hardhat run scripts/addNewContract.js --network polygon_mumbai "contractAddress"
npx hardhat run scripts/addNewContract.js --network polygon_mainnet "contractAddress"