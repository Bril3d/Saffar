// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

/// @title DrugRegistry - Records antibiotic dispensation by pharmacies
/// @notice Only registered pharmacies can record sales to registered veterinarians
contract DrugRegistry {
    struct DrugSale {
        address pharmacy;
        address veterinarian;
        string atcCode;
        string batchNumber;
        uint256 quantity;
        uint256 timestamp;
        string awareClass; // "Access" | "Watch" | "Reserve"
        bool active;
    }

    mapping(uint256 => DrugSale) public sales;
    mapping(address => uint256[]) public vetPurchases;
    uint256 public saleCount;

    AccessControl private immutable _ac;

    event SaleRegistered(
        uint256 indexed saleId,
        address indexed pharmacy,
        address indexed vet,
        string atcCode,
        string awareClass
    );

    modifier onlyPharmacy() {
        require(
            _ac.getRole(msg.sender) == AccessControl.Role.PHARMACY,
            "DrugRegistry: caller is not a registered pharmacy"
        );
        _;
    }

    constructor(address accessControlAddr) {
        require(accessControlAddr != address(0), "DrugRegistry: zero address");
        _ac = AccessControl(accessControlAddr);
    }

    /// @notice Register a drug sale from pharmacy to veterinarian
    function registerSale(
        address vet,
        string calldata atcCode,
        string calldata batchNumber,
        uint256 quantity,
        string calldata awareClass
    ) external onlyPharmacy returns (uint256) {
        require(
            _ac.getRole(vet) == AccessControl.Role.VETERINARIAN,
            "DrugRegistry: veterinarian not registered"
        );
        require(quantity > 0, "DrugRegistry: quantity must be > 0");
        require(bytes(atcCode).length > 0, "DrugRegistry: empty ATC code");

        uint256 saleId = ++saleCount;
        sales[saleId] = DrugSale({
            pharmacy: msg.sender,
            veterinarian: vet,
            atcCode: atcCode,
            batchNumber: batchNumber,
            quantity: quantity,
            timestamp: block.timestamp,
            awareClass: awareClass,
            active: true
        });
        vetPurchases[vet].push(saleId);

        emit SaleRegistered(saleId, msg.sender, vet, atcCode, awareClass);
        return saleId;
    }

    function getSale(uint256 saleId) external view returns (DrugSale memory) {
        require(saleId > 0 && saleId <= saleCount, "DrugRegistry: sale not found");
        return sales[saleId];
    }

    function getVetPurchases(address vet) external view returns (uint256[] memory) {
        return vetPurchases[vet];
    }
}
