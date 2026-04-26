const { expect } = require("chai");
const { ethers, network } = require("hardhat");


describe("PrescriptionRegistry", function () {
  let ac, dwr, dr, pr;
  let admin, pharmacyAcc, vetAcc, vetAcc2, farmerAcc, farmerAcc2, unknown;
  let saleId;

  const DAY = 24 * 60 * 60; // seconds

  beforeEach(async function () {
    [admin, pharmacyAcc, vetAcc, vetAcc2, farmerAcc, farmerAcc2, unknown] =
      await ethers.getSigners();

    // Deploy AccessControl
    const AC = await ethers.getContractFactory("AccessControl");
    ac = await AC.deploy();

    // Register all actors
    await ac.registerActor(pharmacyAcc.address, 1); // PHARMACY
    await ac.registerActor(vetAcc.address, 2);      // VETERINARIAN
    await ac.registerActor(vetAcc2.address, 2);     // VETERINARIAN #2
    await ac.registerActor(farmerAcc.address, 3);   // FARMER
    await ac.registerActor(farmerAcc2.address, 3);  // FARMER #2

    // Deploy DrugWithdrawalRegistry
    const DWR = await ethers.getContractFactory("DrugWithdrawalRegistry");
    dwr = await DWR.deploy();

    // Deploy DrugRegistry
    const DR = await ethers.getContractFactory("DrugRegistry");
    dr = await DR.deploy(await ac.getAddress());

    // Deploy PrescriptionRegistry
    const PR = await ethers.getContractFactory("PrescriptionRegistry");
    pr = await PR.deploy(
      await ac.getAddress(),
      await dr.getAddress(),
      await dwr.getAddress()
    );

    // Create a drug sale: pharmacy → vet (Colistine J01XB01, legal min = 7 days)
    const tx = await dr
      .connect(pharmacyAcc)
      .registerSale(vetAcc.address, "J01XB01", "BATCH-COL", 10, "Reserve");
    saleId = 1;
  });

  describe("CRITICAL: Withdrawal period enforcement", function () {
    it("vet inputs 0 days for Colistine → contract uses 7 days (legal minimum)", async function () {
      const tx = await pr
        .connect(vetAcc)
        .createPrescription(saleId, farmerAcc.address, "LOT-001", "Respiratory", 100, 0);
      const receipt = await tx.wait();
      const rxId = 1;
      const rx = await pr.getPrescription(rxId);

      const expectedEnd = rx.startDate + BigInt(7 * DAY);
      expect(rx.withdrawalEnd).to.equal(expectedEnd);
    });

    it("vet inputs 3 days for Colistine → still uses 7 days (legal > input)", async function () {
      await pr
        .connect(vetAcc)
        .createPrescription(saleId, farmerAcc.address, "LOT-002", "Respiratory", 100, 3);
      const rx = await pr.getPrescription(1);
      const expectedEnd = rx.startDate + BigInt(7 * DAY);
      expect(rx.withdrawalEnd).to.equal(expectedEnd);
    });

    it("vet inputs 10 days for Colistine → uses 10 days (input > legal min)", async function () {
      await pr
        .connect(vetAcc)
        .createPrescription(saleId, farmerAcc.address, "LOT-003", "Respiratory", 100, 10);
      const rx = await pr.getPrescription(1);
      const expectedEnd = rx.startDate + BigInt(10 * DAY);
      expect(rx.withdrawalEnd).to.equal(expectedEnd);
    });

    it("Amoxicilline (J01CA04) legal min = 5 days, input 0 → uses 5", async function () {
      // Create a sale with Amoxicilline
      await dr
        .connect(pharmacyAcc)
        .registerSale(vetAcc.address, "J01CA04", "BATCH-AMX", 50, "Access");
      const amxSaleId = 2;

      await pr
        .connect(vetAcc)
        .createPrescription(amxSaleId, farmerAcc.address, "LOT-004", "Sinusitis", 200, 0);
      const rx = await pr.getPrescription(1);
      expect(rx.withdrawalEnd).to.equal(rx.startDate + BigInt(5 * DAY));
    });
  });

  describe("createPrescription access control", function () {
    it("FARMER cannot create prescription — reverts", async function () {
      await expect(
        pr.connect(farmerAcc).createPrescription(saleId, farmerAcc.address, "LOT-X", "D", 10, 7)
      ).to.be.revertedWith("PrescriptionRegistry: caller is not a registered vet");
    });

    it("vet cannot use another vet's drug sale — reverts 'not your purchase'", async function () {
      await expect(
        pr.connect(vetAcc2).createPrescription(saleId, farmerAcc.address, "LOT-X", "D", 10, 7)
      ).to.be.revertedWith("PrescriptionRegistry: not your drug purchase");
    });

    it("unregistered farmer address — reverts", async function () {
      await expect(
        pr.connect(vetAcc).createPrescription(saleId, unknown.address, "LOT-X", "D", 10, 7)
      ).to.be.revertedWith("PrescriptionRegistry: farmer not registered");
    });

    it("emits PrescriptionCreated event", async function () {
      await expect(
        pr.connect(vetAcc).createPrescription(saleId, farmerAcc.address, "LOT-EVT", "Diag", 50, 7)
      ).to.emit(pr, "PrescriptionCreated");
    });
  });

  describe("confirmAdministration", function () {
    let rxId;

    beforeEach(async function () {
      await pr
        .connect(vetAcc)
        .createPrescription(saleId, farmerAcc.address, "LOT-CONFIRM", "Diag", 50, 7);
      rxId = 1;
    });

    it("farmer can confirm their own prescription", async function () {
      await pr.connect(farmerAcc).confirmAdministration(rxId);
      const rx = await pr.getPrescription(rxId);
      expect(rx.administered).to.be.true;
      expect(rx.adminTimestamp).to.be.gt(0);
    });

    it("Farmer B CANNOT confirm Farmer A's prescription — reverts", async function () {
      await expect(
        pr.connect(farmerAcc2).confirmAdministration(rxId)
      ).to.be.revertedWith("PrescriptionRegistry: not your prescription");
    });

    it("vet cannot confirm administration — reverts", async function () {
      await expect(
        pr.connect(vetAcc).confirmAdministration(rxId)
      ).to.be.revertedWith("PrescriptionRegistry: not your prescription");
    });

    it("double confirmation reverts 'already confirmed'", async function () {
      await pr.connect(farmerAcc).confirmAdministration(rxId);
      await expect(
        pr.connect(farmerAcc).confirmAdministration(rxId)
      ).to.be.revertedWith("PrescriptionRegistry: already confirmed");
    });

    it("emits AdministrationConfirmed event", async function () {
      await expect(pr.connect(farmerAcc).confirmAdministration(rxId))
        .to.emit(pr, "AdministrationConfirmed")
        .withArgs(rxId, farmerAcc.address, await ethers.provider.getBlock("latest").then((b) => b.timestamp + 1));
    });
  });

  describe("getFarmPrescriptions", function () {
    it("returns rxIds for a farmer", async function () {
      await pr.connect(vetAcc).createPrescription(saleId, farmerAcc.address, "L1", "D", 50, 7);
      const rxIds = await pr.getFarmPrescriptions(farmerAcc.address);
      expect(rxIds.length).to.equal(1);
      expect(rxIds[0]).to.equal(1);
    });

    it("returns empty for farmer with no prescriptions", async function () {
      const rxIds = await pr.getFarmPrescriptions(farmerAcc2.address);
      expect(rxIds.length).to.equal(0);
    });
  });
});
