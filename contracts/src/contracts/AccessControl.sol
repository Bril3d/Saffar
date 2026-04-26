// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AccessControl - Role-Based Access Control for SAFAR Chain
/// @notice Manages actor registration and role verification for all SAFAR contracts
contract AccessControl {
    enum Role {
        NONE,
        PHARMACY,
        VETERINARIAN,
        FARMER,
        SLAUGHTERHOUSE,
        ADMIN
    }

    mapping(address => Role) private _roles;

    event ActorRegistered(address indexed actor, Role role);
    event AccessRevoked(address indexed actor);

    modifier onlyAdmin() {
        require(_roles[msg.sender] == Role.ADMIN, "AccessControl: not admin");
        _;
    }

    constructor() {
        _roles[msg.sender] = Role.ADMIN;
        emit ActorRegistered(msg.sender, Role.ADMIN);
    }

    function registerActor(address actor, Role role) external onlyAdmin {
        require(actor != address(0), "AccessControl: zero address");
        require(role != Role.NONE, "AccessControl: cannot assign NONE");
        _roles[actor] = role;
        emit ActorRegistered(actor, role);
    }

    function getRole(address actor) external view returns (Role) {
        return _roles[actor];
    }

    function isRegistered(address actor) external view returns (bool) {
        return _roles[actor] != Role.NONE;
    }

    function revokeAccess(address actor) external onlyAdmin {
        require(_roles[actor] != Role.NONE, "AccessControl: actor not registered");
        _roles[actor] = Role.NONE;
        emit AccessRevoked(actor);
    }
}
