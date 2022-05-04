//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;

contract A {
    uint256 public number;
    bool public reentrant = false;
    function setNumber(uint256 _number) public {
        number = number + _number + 1000000000000000;
    }
    function getNumber() public view returns (uint256) {
        return number;
    }

    modifier nonReentrant() {
        require(reentrant = false, "Reentrancy is not allowed");
        reentrant = true;
        _;
        reentrant = false;
    }
}