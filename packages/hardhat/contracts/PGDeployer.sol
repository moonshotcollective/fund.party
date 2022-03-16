//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./StreamFactory.sol";
import "./SimpleStream.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract PGDeployer {
    enum pgType {
        erc20,
        erc721
    }

    event pgDeployed(
        address indexed token,
        address indexed creator,
        string org,
        string preview,
        pgType indexed pgtype
    );
    event pgerc20Deployed(address indexed token);
    event pgerc721Deployed(address indexed token, uint256 totalSupply);
    event FundProjects(
        address indexed sender,
        uint256 amount,
        address[] streams
    );
    event FundSelected(
        address indexed sender,
        uint256 amount,
        address[] selected
    );

    address[] public projects;

    function deployOrg(
        string memory _orgName,
        string memory _previewURI,
        address owner,
        address[] calldata admins
    ) public {
        // deploy new token
        StreamFactory token = new StreamFactory(
            _orgName,
            _previewURI,
            owner,
            admins
        );

        /*  // transfer token to owner
        token.transferOwnership(msg.sender); */

        projects.push(address(token));

        // emit event
        emit pgDeployed(
            address(token),
            msg.sender,
            string(_orgName),
            string(_previewURI),
            pgType.erc721
        );
    }

    function fundProjects() public payable {
        require(projects.length > 0, "no projects");
        require(msg.value > 0.001 ether, "not worth the gas");
        for (uint8 a = 0; a < projects.length; a++) {
            (bool success, ) = projects[a].call{
                value: msg.value / projects.length,
                gas: 150000
            }("");
            require(success, "could not send");
        }
        emit FundProjects(msg.sender, msg.value, projects);
    }

    function fundSelectedProjects(address[] memory selected) public payable {
        require(selected.length > 0, "no projects");
        require(msg.value > 0.001 ether, "not worth the gas");
        for (uint8 a = 0; a < selected.length; a++) {
            (bool success, ) = selected[a].call{
                value: msg.value / selected.length,
                gas: 150000
            }("");
            require(success, "could not send");
        }
        emit FundSelected(msg.sender, msg.value, selected);
    }
}
