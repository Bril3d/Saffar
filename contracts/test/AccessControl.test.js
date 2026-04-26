const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("AccessControl", function () {
  let accessControl;
  let admin, pharmacy, vet, farmer, slaughterhouse, unknown;

  beforeEach(async function () {
    [admin, pharmacy, vet, farmer, slaughterhouse, unknown] = await ethers.getSigners();
    const AC = await ethers.getContractFactory("AccessControl");
    accessControl = await AC.deploy();
  });

  describe("Deployment", function () {
    it("should set the deployer as ADMIN", async function () {
      const role = await accessControl.getRole(admin.address);
      expect(role).to.equal(5); // Role.ADMIN = 5
    });

    it("should mark deployer as registered", async function () {
      expect(await accessControl.isRegistered(admin.address)).to.be.true;
    });
  });

  describe("registerActor", function () {
    it("admin can register a PHARMACY actor", async function () {
      await accessControl.registerActor(pharmacy.address, 1); // Role.PHARMACY = 1
      expect(await accessControl.getRole(pharmacy.address)).to.equal(1);
    });

    it("admin can register a VETERINARIAN", async function () {
      await accessControl.registerActor(vet.address, 2); // Role.VETERINARIAN = 2
      expect(await accessControl.getRole(vet.address)).to.equal(2);
    });

    it("admin can register a FARMER", async function () {
      await accessControl.registerActor(farmer.address, 3); // Role.FARMER = 3
      expect(await accessControl.getRole(farmer.address)).to.equal(3);
    });

    it("admin can register a SLAUGHTERHOUSE", async function () {
      await accessControl.registerActor(slaughterhouse.address, 4); // Role.SLAUGHTERHOUSE = 4
      expect(await accessControl.getRole(slaughterhouse.address)).to.equal(4);
    });

    it("emits ActorRegistered event", async function () {
      await expect(accessControl.registerActor(pharmacy.address, 1))
        .to.emit(accessControl, "ActorRegistered")
        .withArgs(pharmacy.address, 1);
    });

    it("non-admin CANNOT call registerActor — reverts", async function () {
      await expect(
        accessControl.connect(unknown).registerActor(pharmacy.address, 1)
      ).to.be.revertedWith("AccessControl: not admin");
    });

    it("reverts on zero address", async function () {
      await expect(
        accessControl.registerActor(ethers.ZeroAddress, 1)
      ).to.be.revertedWith("AccessControl: zero address");
    });

    it("reverts when assigning Role.NONE", async function () {
      await expect(
        accessControl.registerActor(unknown.address, 0)
      ).to.be.revertedWith("AccessControl: cannot assign NONE");
    });
  });

  describe("isRegistered", function () {
    it("returns false for unknown address", async function () {
      expect(await accessControl.isRegistered(unknown.address)).to.be.false;
    });

    it("returns true after registration", async function () {
      await accessControl.registerActor(pharmacy.address, 1);
      expect(await accessControl.isRegistered(pharmacy.address)).to.be.true;
    });
  });

  describe("revokeAccess", function () {
    it("admin can revoke registered actor", async function () {
      await accessControl.registerActor(pharmacy.address, 1);
      await accessControl.revokeAccess(pharmacy.address);
      expect(await accessControl.isRegistered(pharmacy.address)).to.be.false;
      expect(await accessControl.getRole(pharmacy.address)).to.equal(0); // Role.NONE
    });

    it("emits AccessRevoked event", async function () {
      await accessControl.registerActor(pharmacy.address, 1);
      await expect(accessControl.revokeAccess(pharmacy.address))
        .to.emit(accessControl, "AccessRevoked")
        .withArgs(pharmacy.address);
    });

    it("non-admin cannot revoke — reverts", async function () {
      await accessControl.registerActor(pharmacy.address, 1);
      await expect(
        accessControl.connect(unknown).revokeAccess(pharmacy.address)
      ).to.be.revertedWith("AccessControl: not admin");
    });

    it("cannot revoke already-unregistered actor", async function () {
      await expect(
        accessControl.revokeAccess(unknown.address)
      ).to.be.revertedWith("AccessControl: actor not registered");
    });
  });
});
