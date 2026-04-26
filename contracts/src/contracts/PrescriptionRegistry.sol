// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./DrugRegistry.sol";
import "./DrugWithdrawalRegistry.sol";

/// @title PrescriptionRegistry - Manages veterinary prescriptions with legal enforcement
/// @notice Smart contract enforces withdrawal minimums — vets CANNOT bypass legal periods
contract PrescriptionRegistry {
    struct Prescription {
        uint256 drugSaleId;
        address veterinarian;
        address farmer;
        string animalLotId;
        string diagnosis;
        uint256 dosage;
        uint256 startDate;
        uint256 withdrawalEnd; // = startDate + max(input, legalMin) * 1 days
        bool administered;
        uint256 adminTimestamp;
    }

    mapping(uint256 => Prescription) public prescriptions;
    mapping(address => uint256[]) public farmPrescriptions;
    uint256 public rxCount;

    AccessControl private immutable _ac;
    DrugRegistry private immutable _dr;
    DrugWithdrawalRegistry private immutable _dwr;

    event PrescriptionCreated(
        uint256 indexed rxId,
        address indexed vet,
        address indexed farmer,
        string lotId,
        uint256 withdrawalEnd
    );
    event AdministrationConfirmed(
        uint256 indexed rxId,
        address indexed farmer,
        uint256 timestamp
    );

    modifier onlyVet() {
        require(
            _ac.getRole(msg.sender) == AccessControl.Role.VETERINARIAN,
            "PrescriptionRegistry: caller is not a registered vet"
        );
        _;
    }

    constructor(
        address acAddr,
        address drAddr,
        address dwrAddr
    ) {
        require(acAddr != address(0) && drAddr != address(0) && dwrAddr != address(0), "zero address");
        _ac = AccessControl(acAddr);
        _dr = DrugRegistry(drAddr);
        _dwr = DrugWithdrawalRegistry(dwrAddr);
    }

    /// @notice Create a prescription. Contract enforces the legal withdrawal minimum.
    /// @param withdrawalDays Vet's input — if less than legal minimum, legal minimum is used
    function createPrescription(
        uint256 saleId,
        address farmer,
        string calldata lotId,
        string calldata diagnosis,
        uint256 dosage,
        uint256 withdrawalDays
    ) external onlyVet returns (uint256) {
        DrugRegistry.DrugSale memory sale = _dr.getSale(saleId);
        require(
            sale.veterinarian == msg.sender,
            "PrescriptionRegistry: not your drug purchase"
        );
        require(
            _ac.getRole(farmer) == AccessControl.Role.FARMER,
            "PrescriptionRegistry: farmer not registered"
        );
        require(bytes(lotId).length > 0, "PrescriptionRegistry: empty lot ID");

        // KEY SECURITY: legal minimum always wins over vet input
        uint256 legalMin = _dwr.getLegalMinDays(sale.atcCode);
        uint256 effectiveDays = withdrawalDays > legalMin ? withdrawalDays : legalMin;

        uint256 rxId = ++rxCount;
        prescriptions[rxId] = Prescription({
            drugSaleId: saleId,
            veterinarian: msg.sender,
            farmer: farmer,
            animalLotId: lotId,
            diagnosis: diagnosis,
            dosage: dosage,
            startDate: block.timestamp,
            withdrawalEnd: block.timestamp + effectiveDays * 1 days,
            administered: false,
            adminTimestamp: 0
        });
        farmPrescriptions[farmer].push(rxId);

        emit PrescriptionCreated(rxId, msg.sender, farmer, lotId, prescriptions[rxId].withdrawalEnd);
        return rxId;
    }

    /// @notice Farmer confirms they administered the prescribed treatment
    function confirmAdministration(uint256 rxId) external returns (bool) {
        Prescription storage rx = prescriptions[rxId];
        require(rx.farmer == msg.sender, "PrescriptionRegistry: not your prescription");
        require(!rx.administered, "PrescriptionRegistry: already confirmed");
        require(rx.drugSaleId > 0, "PrescriptionRegistry: prescription not found");

        rx.administered = true;
        rx.adminTimestamp = block.timestamp;

        emit AdministrationConfirmed(rxId, msg.sender, block.timestamp);
        return true;
    }

    function getPrescription(uint256 rxId) external view returns (Prescription memory) {
        require(rxId > 0 && rxId <= rxCount, "PrescriptionRegistry: not found");
        return prescriptions[rxId];
    }

    function getFarmPrescriptions(address farmer) external view returns (uint256[] memory) {
        return farmPrescriptions[farmer];
    }
}
