const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("DrugWithdrawalRegistry", function () {
  let registry;

  beforeEach(async function () {
    const DWR = await ethers.getContractFactory("DrugWithdrawalRegistry");
    registry = await DWR.deploy();
  });

  describe("Legal minimum days", function () {
    it("J01XB01 (Colistine - Reserve) = 7 days", async function () {
      expect(await registry.getLegalMinDays("J01XB01")).to.equal(7);
    });

    it("J01CA04 (Amoxicilline - Access) = 5 days", async function () {
      expect(await registry.getLegalMinDays("J01CA04")).to.equal(5);
    });

    it("J01AA07 (Tetracycline - Watch) = 10 days", async function () {
      expect(await registry.getLegalMinDays("J01AA07")).to.equal(10);
    });

    it("J01FA01 (Erythromycine - Watch) = 7 days", async function () {
      expect(await registry.getLegalMinDays("J01FA01")).to.equal(7);
    });

    it("J01DC02 (Cefuroxime - Watch) = 5 days", async function () {
      expect(await registry.getLegalMinDays("J01DC02")).to.equal(5);
    });

    it("J01EE01 (Sulfamethoxazole) = 10 days", async function () {
      expect(await registry.getLegalMinDays("J01EE01")).to.equal(10);
    });

    it("unknown ATC code returns 0 (safe default, not a crash)", async function () {
      expect(await registry.getLegalMinDays("UNKNOWN")).to.equal(0);
    });

    it("empty string ATC returns 0", async function () {
      expect(await registry.getLegalMinDays("")).to.equal(0);
    });
  });

  describe("Immutability check", function () {
    it("contract has NO setLegalMinDays function in ABI", async function () {
      // If setLegalMinDays existed it would be callable — this test verifies it is not
      expect(registry.setLegalMinDays).to.be.undefined;
    });

    it("contract has NO write functions other than constructor", async function () {
      const writeFunctions = registry.interface.fragments
        .filter((f) => f.type === "function" && f.stateMutability !== "view" && f.stateMutability !== "pure");
      expect(writeFunctions.length).to.equal(0);
    });
  });
});
