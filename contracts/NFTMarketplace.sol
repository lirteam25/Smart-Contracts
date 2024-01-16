// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable-4.7.3/utils/CountersUpgradeable.sol";
// Import for the Matic/USD exchange rate
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/token/ERC1155/extensions/IERC1155MetadataURIUpgradeable.sol";
import "hardhat/console.sol";

/*
    Note:
    NFTMarketplace is the contract that serves as a marketplace. It no longer needs to be a token holder.
    NFTMint is the contract that acts as a token creator.
*/

/*
    The contract records all information related to tokens put up for sale.
    It also allows for their purchase and transfer to a new owner.
*/

contract NFTMarketplaceUpgradable is ERC1155HolderUpgradeable {
    /* VARIABLE, MODIFIER & CONSTRUCTOR DEFINITIONS */

    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private tokenIds;

    // Secondary Sales Fees
    uint256 secondarySalesFees;

    /* 
        Here are the two smart contracts this contract interacts with:
        1) NFTMint: contract(s) 
        2) exchangeRateMaticUsd (oracle): an external contract to access the exchange rate between Matic and USD
    */
    // 1)
    IERC1155MetadataURIUpgradeable private NFTMint;
    // 2)
    AggregatorV3Interface internal exchangeRateMaticUsd;

    // initializable function to make the smart contract upgradable (constructors are not allowed)
    function initialize(address _exchangeRateAddress) public initializer {
        exchangeRateMaticUsd = AggregatorV3Interface(_exchangeRateAddress);
        _owner = payable(msg.sender);
        secondarySalesFees = 0;
    }

    function updateSecondarySalesFee(
        uint256 _SecondarySalesFee
    ) public onlyOwner {
        secondarySalesFees = _SecondarySalesFee;
    }

    address payable private _owner;

    /*
        Only the contracts we created can call certain functions of this smart contract.
        All contracts with this right are saved in this array.
    */
    address[] public contractsAllowed;

    /*
        Given a tokenId and the address of the contract that minted it, it returns information about the token.
        INPUT: tokenId and address of the contract that minted the NFT
        OUTPUT: author of the NFT, royalties, token supply, URI, number of first sales (parameter explained later)
    */
    mapping(uint256 => mapping(address => TokenInfo)) public idToTokenInfo;
    struct TokenInfo {
        uint256 tokenId;
        address smartContract;
        address payable author;
        uint256 royalties;
        uint256 firstSalesFees;
        uint256 supply;
        string uri;
        uint256 numberOfFirstSells;
    }

    /*
        Given a tokenId and the address of the contract that minted it, it returns an array of addresses that are currently trying to sell the token.
        INPUT: tokenId and address of the contract that minted the NFT
        OUTPUT: list of current addresses that want to sell the NFT, quantity they want to sell, and price.
    */
    mapping(uint256 => mapping(address => TokenSellers)) private idToSellers;
    struct TokenSellers {
        address payable[] sellers;
        uint256[] sellingQuantity;
        uint256[] sellingPrice;
    }

    /*
        Given the address of an NFTMinting contract, it returns all the tokenIds created.
    */
    mapping(address => uint256[]) private smartContractToTokenIds;

    // Event emitted when an NFT is created
    event MarketItemCreated(
        uint256 indexed tokenId,
        address smartContract,
        address author,
        address seller,
        uint256 price,
        uint256 royalties,
        uint256 supply
    );

    // Event emitted when an NFT is re-listed
    event MarketItemReCreated(
        uint256 indexed tokenId,
        address smartContract,
        uint256 price,
        address seller
    );

    // Event emitted when an NFT is sold
    event MarketItemSold(
        uint256 indexed tokenId,
        address smartContract,
        address seller,
        uint256 price,
        address owner
    );

    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "Only the owner of the marketplace can call this function"
        );
        _;
    }

    // Function called to update the contracts that can interact with certain functions of the smart contract.
    function storeMintingContracts(address contracts) public onlyOwner {
        contractsAllowed.push(contracts);
    }

    // Modifier to ensure interaction only by certain smart contracts
    modifier onlyContracts() {
        require(
            findElementIndexInContracts(msg.sender) == 1,
            "Only allowed contracts can call this function"
        );
        _;
    }

    function findElementIndexInContracts(
        address contractAddress
    ) internal view returns (int) {
        for (uint i = 0; i < contractsAllowed.length; i++) {
            if (contractsAllowed[i] == contractAddress) {
                return int(1);
            }
        }
        return -1;
    }

    /* FUNCTIONS TO LIST, DELIST OR CHANGE NFT PRICE */

    /*
        Function responsible for listing an NFT for the first time.
        The function is called by the NFTMint contract and can only be called by "friendly" contracts.
        Key steps:
        1) Check if the token creator has the tokens they claim and if the NFTMarketplace contract is authorized to transfer them.
        2) Create a TokenInfo object: save all the token information.
        3) Create a TokenSellers object: save information about who is selling the token, quantity, and price.
    */
    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        uint256 royalties,
        uint256 firstSalesFees,
        uint256 supply,
        uint256 amount,
        address payable tokenCreator
    ) external onlyContracts {
        // 1)
        NFTMint = IERC1155MetadataURIUpgradeable(msg.sender);
        require(
            NFTMint.balanceOf(tokenCreator, tokenId) >= amount,
            "You do not own enough tokens"
        );
        require(
            NFTMint.isApprovedForAll(tokenCreator, address(this)) == true,
            "The contract is not approved for future transfers of tokens"
        );
        // 2)
        string memory uri = NFTMint.uri(tokenId);
        tokenIds.increment();
        idToTokenInfo[tokenId][msg.sender] = TokenInfo(
            tokenId,
            msg.sender,
            tokenCreator,
            royalties,
            firstSalesFees,
            supply,
            uri,
            0
        );
        // 3)
        idToSellers[tokenId][msg.sender].sellers.push(payable(tokenCreator));
        idToSellers[tokenId][msg.sender].sellingQuantity.push(amount);
        idToSellers[tokenId][msg.sender].sellingPrice.push(price);

        smartContractToTokenIds[msg.sender].push(tokenId);

        emit MarketItemCreated(
            tokenId,
            msg.sender,
            tokenCreator,
            address(this),
            price,
            royalties,
            supply
        );
    }

    /*
        Function for re-listing an NFT.
        The function is called by the NFTMint contract and can only be called by "friendly" contracts.
        Key steps:
        1) Check if the contract has the ability to transfer the token.
        2) Check if the seller was already registered: Does the token creator have enough tokens?
        3) If already registered, update the quantity for sale and the price; otherwise, create a new seller.
    */
    function resellTokens(
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        address payable ownerAddress
    ) external onlyContracts {
        // 1)
        NFTMint = IERC1155MetadataURIUpgradeable(msg.sender);
        require(
            NFTMint.isApprovedForAll(ownerAddress, address(this)) == true,
            "The contract is not approved for transferring tokens"
        );
        int indexSeller = findElementIndexInSellers(
            ownerAddress,
            tokenId,
            msg.sender
        );
        // 2)
        // findElementIndexInSellers: returns -1 if there is no seller of that token with that address
        //                           otherwise, it returns the index value of the array where it was found
        if (indexSeller == -1) {
            require(
                NFTMint.balanceOf(ownerAddress, tokenId) >= amount,
                "You do not own enough tokens"
            );
            idToSellers[tokenId][msg.sender].sellers.push(
                payable(ownerAddress)
            );
            idToSellers[tokenId][msg.sender].sellingQuantity.push(amount);
            idToSellers[tokenId][msg.sender].sellingPrice.push(price);
        } else {
            require(
                NFTMint.balanceOf(ownerAddress, tokenId) >=
                    amount +
                        idToSellers[tokenId][msg.sender].sellingQuantity[
                            uint(indexSeller)
                        ],
                "You do not own enough tokens"
            );
            idToSellers[tokenId][msg.sender].sellingQuantity[
                uint(indexSeller)
            ] += amount;
            idToSellers[tokenId][msg.sender].sellingPrice[
                uint(indexSeller)
            ] = price;
        }

        emit MarketItemReCreated(tokenId, msg.sender, price, ownerAddress);
    }

    /*
        Function to delist a predefined quantity of a token.
        Key steps:
        1) Check that the msg.sender is currently registered as a seller of a token.
        2) Update seller information (TokenSellers).
    */
    function delistTokens(
        uint256 tokenId,
        address contractAddress,
        uint256 amount
    ) public {
        // 1)
        int indexSeller = findElementIndexInSellers(
            msg.sender,
            tokenId,
            contractAddress
        );
        require(
            indexSeller != -1 &&
                idToSellers[tokenId][contractAddress].sellingQuantity[
                    uint(indexSeller)
                ] >=
                amount,
            "To delist a token, you must have listed one"
        );
        // 2)
        idToSellers[tokenId][contractAddress].sellingQuantity[
            uint(indexSeller)
        ] -= amount;
        //  Case where the seller delisted their last token => remove their row from the array
        if (
            idToSellers[tokenId][contractAddress].sellingQuantity[
                uint(indexSeller)
            ] == 0
        ) {
            cancelRowInTokenSeller(tokenId, contractAddress, indexSeller);
        }
    }

    /*
        Function to delist all tokens put up for sale.
        Key steps: see above
    */
    function delistAllTokens(uint256 tokenId, address contractAddress) public {
        // 1)
        int indexSeller = findElementIndexInSellers(
            msg.sender,
            tokenId,
            contractAddress
        );
        require(
            indexSeller != -1 &&
                idToSellers[tokenId][contractAddress].sellingQuantity[
                    uint(indexSeller)
                ] >
                0,
            "To delist tokens, you must have listed one"
        );
        // 2)
        idToSellers[tokenId][contractAddress].sellingQuantity[
            uint(indexSeller)
        ] = 0;
        // The seller sold their last token => remove their row from the array
        cancelRowInTokenSeller(tokenId, contractAddress, indexSeller);
    }

    /*
        Function to change the price of a token put up for sale.
        Key steps:
        1) Check that the msg.sender is selling a token.
        2) Change the price.
    */
    function changePrice(
        uint256 tokenId,
        address contractAddress,
        uint256 price
    ) public {
        // 1)
        int indexSeller = findElementIndexInSellers(
            msg.sender,
            tokenId,
            contractAddress
        );
        require(
            indexSeller != -1 &&
                idToSellers[tokenId][contractAddress].sellingQuantity[
                    uint(indexSeller)
                ] >
                0,
            "To change the token's price, you must have listed one"
        );
        // 2)
        idToSellers[tokenId][contractAddress].sellingPrice[
            uint(indexSeller)
        ] = price;
    }

    /* FUNCTIONS TO PURCHASE NFT */

    /*
        Function to buy an NFT with Matic/native blockchain currency.
        Key steps:
        1) Find the token seller and verify if they still have the token, are selling it, and at what price.
        
        Note: The price is given as input and is considered in US dollars. We do not want someone who wants to sell the token for 5 euros to end up selling it for 3 or 10.
        Only when someone buys the token is the conversion to Matic calculated.
        To ensure that the price matches the msg.value, we need an equal Matic/USD exchange rate between the front-end and the blockchain.
        To obtain it, we make sure that the roundId (a temporary measure that identifies a certain exchange rate) is the same.
        (p.s. it all works using our front-end).

        2) Calculate the price in Matic with the input RoundId.
        3) Update seller information (TokenSellers) and transfer the token to the new owner (the token transfer is within the function).
        4) Split the message value among the actors.
    */

    function createMarketSaleMatic(
        uint256 tokenId,
        address contractAddress,
        address payable tokenSeller,
        uint80 _roundId,
        uint256 _startedAt
    ) public payable {
        // 1)
        int indexSeller = findElementIndexInSellers(
            tokenSeller,
            tokenId,
            contractAddress
        );
        require(
            indexSeller != -1 &&
                idToSellers[tokenId][contractAddress].sellingQuantity[
                    uint(indexSeller)
                ] >
                0,
            "To buy the token, the owner must have listed one"
        );

        NFTMint = IERC1155MetadataURIUpgradeable(contractAddress);
        // Necessary check in case the seller has sold the token outside the marketplace
        if (NFTMint.balanceOf(tokenSeller, tokenId) == 0) {
            cancelRowInTokenSeller(tokenId, contractAddress, indexSeller);
            require(
                NFTMint.balanceOf(tokenSeller, tokenId) >= 1,
                "The seller of the token has already transferred the token"
            );
        }
        // 2)
        uint256 currentTimestamp = block.timestamp;
        require(
            currentTimestamp - _startedAt < 500,
            "Your transaction has taken too long. Please try again"
        );

        uint256 price = getLatestPriceGivenRound(
            _roundId,
            idToSellers[tokenId][contractAddress].sellingPrice[
                uint(indexSeller)
            ]
        );
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        NFTMint.safeTransferFrom(tokenSeller, msg.sender, tokenId, 1, "");
        // 3)
        updateIdToOwner(tokenId, contractAddress, tokenSeller);
        // 4)
        uint256 royalties = idToTokenInfo[tokenId][contractAddress].royalties;
        uint256 firstSalesFees = idToTokenInfo[tokenId][contractAddress]
            .firstSalesFees;
        uint256 sellerLost = secondarySalesFees + royalties;
        address payable author = idToTokenInfo[tokenId][contractAddress].author;
        address payable seller = tokenSeller;

        /*
            Second-sale case
            The token seller is not the author of the token => it is a second sale
                                    OR
            More tokens than the supply have been sold => it is a second sale
        */

        if (
            (author != seller) ||
            ((idToTokenInfo[tokenId][contractAddress].numberOfFirstSells ==
                idToTokenInfo[tokenId][contractAddress].supply) &&
                (author == seller))
        ) {
            seller.transfer(msg.value - ((msg.value * sellerLost) / 100));
            author.transfer((msg.value * royalties) / 100);
        } else {
            /*
                First-sale case
            */
            seller.transfer(msg.value - ((msg.value * firstSalesFees) / 100));
            idToTokenInfo[tokenId][contractAddress].numberOfFirstSells += 1;
        }

        emit MarketItemSold(
            tokenId,
            contractAddress,
            tokenSeller,
            price,
            msg.sender
        );
    }

    /*
        Function that returns the price of an NFT in Matic from USD given a certain round.
        For the function to work, it is required that the roundId was generated within a certain number of minutes (the exchange rate must be recent) (the roundId is a progressive number).
    */
    function getLatestPriceGivenRound(
        uint80 _roundId,
        uint256 USDprice
    ) public view returns (uint256) {
        (, int256 price, , , ) = exchangeRateMaticUsd.getRoundData(_roundId);
        uint256 MaticPrice = ((USDprice) / (uint256(price))) * 10 ** 8;
        return MaticPrice;
    }

    /*
        Function that returns the most up-to-date Matic/USD exchange rate and the corresponding roundID.
    */
    function getLatestPrice() public view returns (uint80, uint256, int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            ,

        ) = exchangeRateMaticUsd.latestRoundData();
        return (roundID, startedAt, price);
    }

    /*
        Function called CreateMarketSale with Matic.
        Key steps:
        1) Transfer the token to the new owner.
        2) Update the token seller's data.
    */
    function updateIdToOwner(
        uint256 tokenId,
        address contractAddress,
        address tokenSeller
    ) private {
        // 2)
        int indexSeller = findElementIndexInSellers(
            tokenSeller,
            tokenId,
            contractAddress
        );
        idToSellers[tokenId][contractAddress].sellingQuantity[
            uint(indexSeller)
        ] -= 1;
        //  Casistica in cui il venditore ha venduto il suo ultimo token => elimina dall'array la sua riga
        if (
            idToSellers[tokenId][contractAddress].sellingQuantity[
                uint(indexSeller)
            ] == 0
        ) {
            cancelRowInTokenSeller(tokenId, contractAddress, indexSeller);
        }
    }

    /*
        Function that cancels a row in the tokenSeller array.
        The row to be deleted is the one with index "indexSeller".
        A swap is made between the row to be deleted and the last row, and then the last row is deleted.
    */
    function cancelRowInTokenSeller(
        uint256 tokenId,
        address contractAddress,
        int indexSeller
    ) private {
        for (
            uint j = uint(indexSeller);
            j < idToSellers[tokenId][contractAddress].sellers.length - 1;
            j++
        ) {
            idToSellers[tokenId][contractAddress].sellers[j] = idToSellers[
                tokenId
            ][contractAddress].sellers[j + 1];
            idToSellers[tokenId][contractAddress].sellingQuantity[
                    j
                ] = idToSellers[tokenId][contractAddress].sellingQuantity[
                j + 1
            ];
            idToSellers[tokenId][contractAddress].sellingPrice[j] = idToSellers[
                tokenId
            ][contractAddress].sellingPrice[j + 1];
        }
        idToSellers[tokenId][contractAddress].sellers.pop();
        idToSellers[tokenId][contractAddress].sellingQuantity.pop();
        idToSellers[tokenId][contractAddress].sellingPrice.pop();
    }

    /*
        Funzione chiamata per avere la posizione di un seller nell'array tokenSellers. Ritorna -1 se non esiste. 
     */
    function findElementIndexInSellers(
        address owner,
        uint256 tokenId,
        address contractAddress
    ) private view returns (int) {
        for (
            uint i = 0;
            i < idToSellers[tokenId][contractAddress].sellers.length;
            i++
        ) {
            if (idToSellers[tokenId][contractAddress].sellers[i] == owner) {
                return int(i);
            }
        }
        return -1;
    }

    /*                                                               FUNCTIONS TO FETCH NFT OWNERS,...                                                    */

    /*
        List all sellers of a specific Token 
     */
    function getSellers(
        uint256 tokenId,
        address contractAddress
    ) public view returns (TokenSellers memory) {
        return idToSellers[tokenId][contractAddress];
    }

    /*
        Function to return all Tokens of a given Smart Contract sold by a specific owner
     */
    function getTokensCurrentlySelling(
        address owner,
        address contractAddress
    ) public view returns (uint256[] memory, uint[] memory) {
        uint256 lunghezza = smartContractToTokenIds[contractAddress].length;
        uint256 lastTokenId = smartContractToTokenIds[contractAddress][
            lunghezza - 1
        ];
        uint256[] memory tokenIdArray = new uint256[](lastTokenId);
        uint[] memory amountTokenSelling = new uint[](lastTokenId);
        for (uint i = 0; i < lastTokenId; i++) {
            tokenIdArray[i] = i + 1;
            int index = findElementIndexInSellers(
                owner,
                i + 1,
                contractAddress
            );
            if (index != -1) {
                amountTokenSelling[i] = idToSellers[i + 1][contractAddress]
                    .sellingQuantity[uint(index)];
            } else {
                amountTokenSelling[i] = 0;
            }
        }
        return (tokenIdArray, amountTokenSelling);
    }

    /*
        Given a Smart Contract the function returns all Tokens created
     */
    function getTokenIds(
        address smartContract
    ) public view returns (uint256[] memory) {
        return smartContractToTokenIds[smartContract];
    }

    function withdraw() public payable onlyOwner {
        _owner.transfer(address(this).balance);
    }
}
