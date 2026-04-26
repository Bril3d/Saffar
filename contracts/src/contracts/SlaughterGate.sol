// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./PrescriptionRegistry.sol";

/// @title SlaughterGate - Enforces withdrawal period at slaughterhouse
/// @notice Smart contract is the law — no human override possible
contract SlaughterGate {
    struct LotVerification {
        string animalLotId;
        address slaughterhouse;
        bool eligible;
        uint256 timestamp;
        bytes32 certificateHash;
    }

    mapping(string => LotVerification) public verifications;
    mapping(bytes32 => bool) public validCertificates;
    // lotId => rxId mapping (set when certifying)
    mapping(string => uint256) public lotRxId;

    AccessControl private immutable _ac;
    PrescriptionRegistry private immutable _pr;

    event LotChecked(string indexed lotId, bool eligible, uint256 daysRemaining);
    event LotCertified(string indexed lotId, bytes32 certificateHash, address slaughterhouse);

    modifier onlySlaughterhouse() {
        require(
            _ac.getRole(msg.sender) == AccessControl.Role.SLAUGHTERHOUSE,
            "SlaughterGate: caller is not a registered slaughterhouse"
        );
        _;
    }

    constructor(address acAddr, address prAddr) {
        require(acAddr != address(0) && prAddr != address(0), "zero address");
        _ac = AccessControl(acAddr);
        _pr = PrescriptionRegistry(prAddr);
    }

    /// @notice Check if a lot is eligible for slaughter
    /// @return eligible Whether block.timestamp >= withdrawalEnd
    /// @return daysRemaining Days left until eligible (0 if already eligible)
    function checkEligibility(string calldata lotId, uint256 rxId)
        external
        view
        returns (bool eligible, uint256 daysRemaining)
    {
        PrescriptionRegistry.Prescription memory rx = _pr.getPrescription(rxId);
        require(
            keccak256(bytes(rx.animalLotId)) == keccak256(bytes(lotId)),
            "SlaughterGate: lot ID mismatch with prescription"
        );

        if (block.timestamp >= rx.withdrawalEnd) {
            eligible = true;
            daysRemaining = 0;
        } else {
            eligible = false;
            // Ceiling division: show minimum 1 day when any time remains
            uint256 secondsLeft = rx.withdrawalEnd - block.timestamp;
            daysRemaining = (secondsLeft + 1 days - 1) / 1 days;
        }
    }

    /// @notice Certify a lot as eligible — generates immutable certificate hash
    function certifyLot(string calldata lotId, uint256 rxId)
        external
        onlySlaughterhouse
        returns (bytes32)
    {
        (bool eligible, ) = this.checkEligibility(lotId, rxId);
        require(eligible, "SlaughterGate: lot is not yet eligible");
        require(
            verifications[lotId].certificateHash == bytes32(0),
            "SlaughterGate: lot already certified"
        );

        bytes32 certHash = keccak256(
            abi.encodePacked(lotId, msg.sender, block.timestamp, rxId)
        );

        verifications[lotId] = LotVerification({
            animalLotId: lotId,
            slaughterhouse: msg.sender,
            eligible: true,
            timestamp: block.timestamp,
            certificateHash: certHash
        });
        validCertificates[certHash] = true;
        lotRxId[lotId] = rxId;

        emit LotCertified(lotId, certHash, msg.sender);
        return certHash;
    }

    function verifyCertificate(bytes32 certHash) external view returns (bool) {
        return validCertificates[certHash];
    }

    function getLotVerification(string calldata lotId)
        external
        view
        returns (LotVerification memory)
    {
        return verifications[lotId];
    }
}
