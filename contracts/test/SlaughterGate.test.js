const { expect } = require("chai");
const { ethers, network } = require("hardhat");


describe("SlaughterGate", function () {
  let ac, dwr, dr, pr, sg;
  let admin, pharmacyAcc, vetAcc, farmerAcc, slaughterhouseAcc, unknown;
  let eligibleRxId, nonEligibleRxId;

  const DAY = 24 * 60 * 60;
  const ELIGIBLE_LOT = "LOT-ELIGIBLE";
  const NON_ELIGIBLE_LOT = "LOT-NOT-ELIGIBLE";

  async function increaseTime(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
  }

  beforeEach(async function () {
    [admin, pharmacyAcc, vetAcc, farmerAcc, slaughterhouseAcc, unknown] =
      await ethers.getSigners();

    // Deploy stack
    const AC = await ethers.getContractFactory("AccessControl");
    ac = await AC.deploy();
    await ac.registerActor(pharmacyAcc.address, 1);
    await ac.registerActor(vetAcc.address, 2);
    await ac.registerActor(farmerAcc.address, 3);
    await ac.registerActor(slaughterhouseAcc.address, 4);

    const DWR = await ethers.getContractFactory("DrugWithdrawalRegistry");
    dwr = await DWR.deploy();

    const DR = await ethers.getContractFactory("DrugRegistry");
    dr = await DR.deploy(await ac.getAddress());

    const PR = await ethers.getContractFactory("PrescriptionRegistry");
    pr = await PR.deploy(await ac.getAddress(), await dr.getAddress(), await dwr.getAddress());

    const SG = await ethers.getContractFactory("SlaughterGate");
    sg = await SG.deploy(await ac.getAddress(), await pr.getAddress());

    // Sale: Amoxicilline J01CA04 (5 days legal min)
    await dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01CA04", "BATCH-AMX", 50, "Access");
    const saleId = 1;

    // Eligible prescription: withdrawal = 5 days, we'll advance time 6 days
    await pr.connect(vetAcc).createPrescription(saleId, farmerAcc.address, ELIGIBLE_LOT, "Resp", 100, 5);
    eligibleRxId = 1;
    await pr.connect(farmerAcc).confirmAdministration(eligibleRxId);

    // Non-eligible prescription: withdrawal = 7 days (Colistine), advance only 3 days
    await dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01XB01", "BATCH-COL", 10, "Reserve");
    const saleId2 = 2;
    await pr.connect(vetAcc).createPrescription(saleId2, farmerAcc.address, NON_ELIGIBLE_LOT, "RDNB", 50, 0);
    nonEligibleRxId = 2;
    await pr.connect(farmerAcc).confirmAdministration(nonEligibleRxId);
  });

  describe("checkEligibility", function () {
    it("eligible lot: block.timestamp past withdrawalEnd → (true, 0)", async function () {
      await increaseTime(6 * DAY); // Advance 6 days, Amoxicilline needs 5
      const [eligible, daysRemaining] = await sg.checkEligibility(ELIGIBLE_LOT, eligibleRxId);
      expect(eligible).to.be.true;
      expect(daysRemaining).to.equal(0);
    });

    it("non-eligible lot → (false, daysRemaining > 0)", async function () {
      await increaseTime(3 * DAY); // Only 3 days, Colistine needs 7
      const [eligible, daysRemaining] = await sg.checkEligibility(NON_ELIGIBLE_LOT, nonEligibleRxId);
      expect(eligible).to.be.false;
      expect(daysRemaining).to.be.gt(0);
    });

    it("lot ID mismatch with rxId → reverts", async function () {
      await increaseTime(6 * DAY);
      await expect(
        sg.checkEligibility("WRONG-LOT-ID", eligibleRxId)
      ).to.be.revertedWith("SlaughterGate: lot ID mismatch with prescription");
    });
  });

  describe("certifyLot", function () {
    it("certify eligible lot → returns bytes32 certHash", async function () {
      await increaseTime(6 * DAY);
      const certHash = await sg.connect(slaughterhouseAcc).certifyLot.staticCall(ELIGIBLE_LOT, eligibleRxId);
      await sg.connect(slaughterhouseAcc).certifyLot(ELIGIBLE_LOT, eligibleRxId);
      expect(certHash).to.not.equal(ethers.ZeroHash);
    });

    it("certify non-eligible lot → reverts 'not yet eligible'", async function () {
      await increaseTime(3 * DAY);
      await expect(
        sg.connect(slaughterhouseAcc).certifyLot(NON_ELIGIBLE_LOT, nonEligibleRxId)
      ).to.be.revertedWith("SlaughterGate: lot is not yet eligible");
    });

    it("non-slaughterhouse calling certifyLot → reverts", async function () {
      await increaseTime(6 * DAY);
      await expect(
        sg.connect(farmerAcc).certifyLot(ELIGIBLE_LOT, eligibleRxId)
      ).to.be.revertedWith("SlaughterGate: caller is not a registered slaughterhouse");
    });

    it("certify same lot twice → reverts 'already certified'", async function () {
      await increaseTime(6 * DAY);
      await sg.connect(slaughterhouseAcc).certifyLot(ELIGIBLE_LOT, eligibleRxId);
      await expect(
        sg.connect(slaughterhouseAcc).certifyLot(ELIGIBLE_LOT, eligibleRxId)
      ).to.be.revertedWith("SlaughterGate: lot already certified");
    });

    it("emits LotCertified event", async function () {
      await increaseTime(6 * DAY);
      await expect(sg.connect(slaughterhouseAcc).certifyLot(ELIGIBLE_LOT, eligibleRxId))
        .to.emit(sg, "LotCertified");
    });
  });

  describe("verifyCertificate", function () {
    it("verifyCertificate with valid hash → returns true", async function () {
      await increaseTime(6 * DAY);
      await sg.connect(slaughterhouseAcc).certifyLot(ELIGIBLE_LOT, eligibleRxId);
      // Get the hash from the on-chain verification record (not from staticCall — timestamps differ)
      const verification = await sg.getLotVerification(ELIGIBLE_LOT);
      const certHash = verification.certificateHash;
      expect(await sg.verifyCertificate(certHash)).to.be.true;
    });

    it("verifyCertificate with fake hash → returns false", async function () {
      const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      expect(await sg.verifyCertificate(fakeHash)).to.be.false;
    });

    it("verifyCertificate with ZeroHash → returns false", async function () {
      expect(await sg.verifyCertificate(ethers.ZeroHash)).to.be.false;
    });
  });
});
