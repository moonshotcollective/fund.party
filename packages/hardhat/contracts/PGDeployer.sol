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
        uint256 supply
    );
    event pgerc20Deployed(address indexed token);
    event pgerc721Deployed(address indexed token, uint256 totalSupply);
    event FundProjects(
        address indexed sender,
        uint256 amount,
        address[] streams
    );

    address[] public projects;

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
        emit pgDeployed(address(token), msg.sender, pgType.erc20, supply);
    }

    function deployERC721(
        address admin,
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 basePrice,
        uint256 curve,
        string memory base,
        string[] memory uris
    ) public {
        // deploy new token
        PGERC721 token = new PGERC721(
            admin,
            name,
            symbol,
            maxSupply,
            basePrice,
            curve,
            base,
            uris
        );

        // transfer token to owner
        token.transferOwnership(admin);

        projects.push(address(token));

        // emit event
        emit pgDeployed(address(token), msg.sender, pgType.erc721, maxSupply);
    }

    function fundProjects() public payable {
        require(projects.length > 0, "no projects");
        require(msg.value > 0.001 ether, "not worth the gas");
        for (uint8 a = 0; a < projects.length; a++) {
            //thisProject = projects[a];
            (bool success, ) = projects[a].call{
                value: msg.value / projects.length,
                gas: 150000
            }("");
            require(success, "could not send");
        }
        emit FundProjects(msg.sender, msg.value, projects);
    }
}
