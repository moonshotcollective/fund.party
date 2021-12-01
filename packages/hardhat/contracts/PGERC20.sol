// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PGERC20 is ERC20, Ownable {
    uint8 private _decimalOverride = 16;

    constructor(
        address admin,
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimal
    ) ERC20(name, symbol) {
        _mint(admin, initialSupply * 10**decimal);
        _decimalOverride = decimal;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimalOverride;
    }
}
