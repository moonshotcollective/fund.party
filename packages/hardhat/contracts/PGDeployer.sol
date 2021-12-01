//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./PGERC20.sol";
import "./PGERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract PGDeployer is Ownable {
    event pgerc20Deployed(address indexed token);
    event pgerc721Deployed(address indexed token, uint256 deployId, uint256 totalSupply);

    using Counters for Counters.Counter;
    Counters.Counter private _nftDeployCount;

    function deployERC20(
        address tokenOwner,
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimal
    ) public {
        // deploy new token
        PGERC20 token = new PGERC20(
            tokenOwner,
            name,
            symbol,
            initialSupply,
            decimal
        );

        // transfer token to owner
        token.transferOwnership(tokenOwner);

        // emit event
        emit pgerc20Deployed(address(token));
    }

    function deployERC721(
        uint256 maxSupply,
        uint256 curve,
        uint256 basePrice,
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI,
        string[] memory uris
    ) public {
        // deploy new token
        PGERC721 token = new PGERC721(
            maxSupply,
            curve,
            basePrice,
            name,
            symbol,
            baseURI,
            contractURI,
            uris
        );

        // transfer token to owner
        token.transferOwnership(msg.sender);

        // track deploys by count
        _nftDeployCount.increment();
        uint256 deployId = _nftDeployCount.current();

        // emit event
        emit pgerc721Deployed(address(token), deployId, maxSupply);
    }
}
