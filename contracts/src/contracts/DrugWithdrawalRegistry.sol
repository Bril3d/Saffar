// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DrugWithdrawalRegistry - Immutable legal withdrawal periods
/// @notice Pre-loaded at deployment. No setter exists — periods are law.
contract DrugWithdrawalRegistry {
    mapping(string => uint256) private _legalMinDays;

    constructor() {
        // Tunisian veterinary regulations - pre-loaded at deploy, NEVER modifiable
        _legalMinDays["J01XB01"] = 7;  // Colistine (Reserve - last resort)
        _legalMinDays["J01CA04"] = 5;  // Amoxicilline (Access)
        _legalMinDays["J01AA07"] = 10; // Tetracycline (Watch)
        _legalMinDays["J01FA01"] = 7;  // Erythromycine (Watch)
        _legalMinDays["J01DC02"] = 5;  // Cefuroxime (Watch)
        _legalMinDays["J01EE01"] = 10; // Sulfamethoxazole/Trimethoprim (Watch)
    }

    /// @notice Returns the legal minimum withdrawal days for a given ATC code
    /// @param atcCode The WHO ATC classification code
    /// @return Minimum days (0 if unknown code)
    function getLegalMinDays(string calldata atcCode) external view returns (uint256) {
        return _legalMinDays[atcCode];
    }

    // NOTE: There is intentionally NO setLegalMinDays function.
    // This contract is immutable by design — legal minimums cannot be overridden.
}
