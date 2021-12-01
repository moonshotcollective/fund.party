// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PGERC721 is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 private _vMaxSupply;
    string private _base;

    string public contractURI = "";

    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        string memory base,
        string memory _contractURI
    ) ERC721(name, symbol) {
        //
        _vMaxSupply = _maxSupply;
        _base = base;
        contractURI = _contractURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _base;
    }

    function mintItem() public returns (uint256) {
        _tokenIds.increment();
        uint256 id = _tokenIds.current();

        require(
            _vMaxSupply >= id,
            "Minting complete, please check secondary markets"
        );

        _mint(msg.sender, id);

        return id;
    }
}
