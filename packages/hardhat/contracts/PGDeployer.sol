//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./PGERC20.sol";
import "./PGERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract PGDeployer is Ownable {
    enum pgType {
        erc20,
        erc721
    }

    event pgDeployed(
        address indexed token,
        address indexed creator,
        pgType indexed pgtype,
        uint256 supply,
        uint256 timestamp
    );
    event pgerc20Deployed(address indexed token);
    event pgerc721Deployed(address indexed token, uint256 totalSupply);

    function deployERC20(
        address tokenOwner,
        string memory name,
        string memory symbol,
        uint256 supply,
        uint8 decimal
    ) public {
        // deploy new token
        PGERC20 token = new PGERC20(tokenOwner, name, symbol, supply, decimal);

        // transfer token to owner
        token.transferOwnership(tokenOwner);

        // emit event
        emit pgDeployed(
            address(token),
            msg.sender,
            pgType.erc20,
            supply,
            block.timestamp
        );
    }

    function deployERC721(
        address tokenOwner,
        string memory name,
        string memory symbol,
        uint256 supply,
        string memory baseURI,
        string memory contractURI
    ) public {
        // deploy new token
        PGERC721 token = new PGERC721(
            name,
            symbol,
            supply,
            baseURI,
            contractURI
        );

        // transfer token to owner
        token.transferOwnership(tokenOwner);

        // emit event
        emit pgDeployed(
            address(token),
            msg.sender,
            pgType.erc721,
            supply,
            block.timestamp
        );
    }
}
