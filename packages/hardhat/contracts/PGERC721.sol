// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PGERC721 is ERC721, Ownable {
    address payable public constant gitcoin =
        payable(0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6);

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public admin;
    uint256 public currentSupply = 0;
    uint256 public _vCurve;
    uint256 public _vPrice;
    string public contractURI = "";
    string[] private uris;

    uint256 private _vMaxSupply;
    string private _userURI;

    constructor(
        address _admin,
        uint256 _maxSupply,
        uint256 _curve,
        uint256 _basePrice,
        string memory name,
        string memory symbol,
        string memory base,
        string memory _contractURI,
        string[] memory _uris
    ) ERC721(name, symbol) {
        //
        admin = _admin;
        _vMaxSupply = _maxSupply;
        _vCurve = _curve;
        _vPrice = _basePrice;
        _userURI = base;
        contractURI = _contractURI;
        uris = _uris;
    }

    function _baseURI() internal view override returns (string memory) {
        return _userURI;
    }

    function mintItem() public payable returns (uint256) {
        _vPrice = (_vPrice * _vCurve) / 1000;

        require(msg.value >= _vPrice, "Tx value less than mint price");

        require(
            _tokenIds.current() < _vMaxSupply,
            "Minting complete, please check secondary markets"
        );

        _tokenIds.increment();
        currentSupply++;
        uint256 id = _tokenIds.current();

        _mint(msg.sender, id);

        (bool success, ) = gitcoin.call{value: msg.value}("");
        require(success, "Could not send, please retry");

        return id;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        require(tokenId <= _vMaxSupply, "Nonexistent token");

        return
            bytes(_userURI).length > 0
                ? string(abi.encodePacked(_userURI, uris[tokenId - 1]))
                : "";
    }

    /**
     * @notice Returns current floor value
     */
    function floor() public view returns (uint256) {
        if (currentSupply == 0) {
            return address(this).balance;
        }
        return address(this).balance / currentSupply;
    }

    function currentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @notice Executes a sale and updates the floor price
     * @param _id nft id
     */
    function redeem(uint256 _id) external {
        require(ownerOf(_id) == msg.sender, "Not Owner");
        uint256 currentFloor = floor();
        require(
            currentFloor > 0,
            "sale cannot be made until floor is established"
        );
        currentSupply--;
        super._burn(_id);
        (bool success, ) = msg.sender.call{value: currentFloor}("");
        require(success, "sending floor price failed");
    }

    /**
     * @notice Fallback
     */
    receive() external payable {}
}
