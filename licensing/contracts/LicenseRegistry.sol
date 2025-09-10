// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LicenseRegistry {
    address public immutable issuer;
    mapping(bytes32 => uint256) public anchoredAt;

    event Anchored(bytes32 indexed licenseHash, address indexed by, uint256 timestamp);

    constructor(address _issuer) {
        require(_issuer != address(0), "issuer required");
        issuer = _issuer;
    }

    function anchorLicense(bytes32 licenseHash) external {
        require(msg.sender == issuer, "only issuer");
        require(licenseHash != bytes32(0), "bad hash");
        require(anchoredAt[licenseHash] == 0, "already anchored");
        anchoredAt[licenseHash] = block.timestamp;
        emit Anchored(licenseHash, msg.sender, block.timestamp);
    }

    function isAnchored(bytes32 licenseHash) external view returns (bool) {
        return anchoredAt[licenseHash] != 0;
    }
}
