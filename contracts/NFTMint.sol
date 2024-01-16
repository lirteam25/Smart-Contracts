// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable-4.7.3/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";

/*  
    Note: 
    NFTMarketplace is the contract that plays the role of token holder.
    NFTMint is the contract that plays the role of token creator.
*/

/*
    This contract has been developed "BESPOKE" to interact with NFTMarketplace. Consequently, it functions closely with NFTMarketplace.
    The idea is to create a unique smart contract for each artist: we want each artist to have their own name, symbol, and token counter.
    The contracts would be identical for each artist, differing only in the name and symbol of the token.
*/

/*
    We import two functions from the NFTMarketplace contract. 
    This allows creating and listing a token, as well as reselling it, to be accomplished in a single transaction (instead of two).
*/
interface Marketplace {
    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        uint256 royalties,
        uint256 firstSalesFees,
        uint256 supply,
        uint256 amount,
        address payable
    ) external;

    function resellTokens(
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        address contractAddress
    ) external;
}

contract NFTMintUpgradable is ERC1155URIStorageUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    mapping(uint256 => address) public tokenCreator;
    mapping(uint256 => uint256) public tokenSupply;
    mapping(uint256 => uint256) public tokenRoyalties;

    address payable private _owner;

    // Initialization variable to avoid double initialization through Reentrancy
    bool private initialized;

    // Variable for importing functions from NFTMarketplace
    Marketplace public nftMarketplaceInstance;

    // Symbol and name of created tokens
    string public name;
    string public symbol;

    event TokenCreated(uint256 indexed tokenId, address smartContract);

    function initialize(
        string memory nameToken,
        string memory symbolToken
    ) public initializer {
        require(
            !initialized,
            "Contract instance has already being initialized"
        );
        initialized = true;
        _owner = payable(msg.sender);
        setName(nameToken);
        setSymbol(symbolToken);
    }

    function setName(string memory _name) private {
        name = _name;
    }

    function setSymbol(string memory _symbol) private {
        symbol = _symbol;
    }

    function viewSymbol() public view returns (string memory) {
        return symbol;
    }

    function viewName() public view returns (string memory) {
        return name;
    }

    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "Only the owner of the marketplace can call this function"
        );
        _;
    }

    /*
        Function called to create the token.
    */
    function createToken(
        string memory tokenURI,
        uint256 supply,
        uint256 royalties
    ) public onlyOwner returns (uint256) {
        // 1)
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId, supply, "");
        tokenSupply[newTokenId] = supply;
        tokenCreator[newTokenId] = msg.sender;
        tokenRoyalties[newTokenId] = royalties;
        _setURI(newTokenId, tokenURI);
        emit TokenCreated(newTokenId, address(this));
        return newTokenId;
    }

    /*
        Function called to list tokens for sale.
    */
    function firstListing(
        uint256 tokenId,
        uint256 price,
        uint256 supply,
        uint256 amount,
        uint256 royalties,
        uint256 firstSalesFees,
        address NFTMarketplaceAddress
    ) public onlyOwner {
        setApprovalForAll(NFTMarketplaceAddress, true);
        nftMarketplaceInstance = Marketplace(NFTMarketplaceAddress);
        nftMarketplaceInstance.createMarketItem(
            tokenId,
            price,
            royalties,
            firstSalesFees,
            supply,
            amount,
            payable(msg.sender)
        );
    }

    /*
        Function called to create and list the token. 
        The functions are separated to give artists the option to not list all the tokens they create for sale.
    */
    function createAndListToken(
        string memory tokenURI,
        uint256 price,
        uint256 supply,
        uint256 amount,
        uint256 royalties,
        uint256 firstSalesFees,
        address NFTMarketplaceAddress
    ) external onlyOwner {
        uint256 newTokenId = createToken(tokenURI, supply, royalties);
        firstListing(
            newTokenId,
            price,
            supply,
            amount,
            royalties,
            firstSalesFees,
            NFTMarketplaceAddress
        );
    }

    /*
        Function called to RE-list the token and list it for sale again.
        Three key steps: 
            1) Sending re-listing data to NFTMarketplace
            2) Approval for future transactions by NFTMarketplace
    */
    function secondaryListing(
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        address NFTMarketplaceAddress
    ) external {
        setApprovalForAll(NFTMarketplaceAddress, true);
        nftMarketplaceInstance = Marketplace(NFTMarketplaceAddress);
        nftMarketplaceInstance.resellTokens(
            tokenId,
            amount,
            price,
            payable(msg.sender)
        );
    }

    function getLastTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
}
