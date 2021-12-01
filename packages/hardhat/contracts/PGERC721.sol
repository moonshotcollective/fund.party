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

    uint256 public currentSupply = 0;
    uint256 public _vCurve;
    uint256 public _vPrice;
    string public contractURI = "";
    string[] private uris;

    uint256 private _vMaxSupply;
    string private _base;

    constructor(
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
        _vMaxSupply = _maxSupply;
        _vCurve = _curve;
        _vPrice = _basePrice;
        _base = base;
        contractURI = _contractURI;
        uris = _uris;
    }

    function _baseURI() internal view override returns (string memory) {
        return _base;
    }

    function mintItem() public payable returns (uint256) {
        _vPrice = (_vPrice * _vCurve) / 1000;

        require(
            msg.value >= _vPrice,
            "Tx value less than mint price"
        );

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

}
