const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("DrugRegistry", function () {
  let ac, dr;
  let admin, pharmacyAcc, vetAcc, farmerAcc, unknown;

  beforeEach(async function () {
    [admin, pharmacyAcc, vetAcc, farmerAcc, unknown] = await ethers.getSigners();

    const AC = await ethers.getContractFactory("AccessControl");
    ac = await AC.deploy();

    // Register actors
    await ac.registerActor(pharmacyAcc.address, 1); // PHARMACY
    await ac.registerActor(vetAcc.address, 2);      // VETERINARIAN
    await ac.registerActor(farmerAcc.address, 3);   // FARMER

    const DR = await ethers.getContractFactory("DrugRegistry");
    dr = await DR.deploy(await ac.getAddress());
  });

  describe("registerSale", function () {
    it("registered pharmacy can register a sale — returns saleId > 0", async function () {
      const tx = await dr
        .connect(pharmacyAcc)
        .registerSale(vetAcc.address, "J01CA04", "BATCH-001", 50, "Access");
      const receipt = await tx.wait();
      // saleCount should be 1
      expect(await dr.saleCount()).to.equal(1);
    });

    it("emits SaleRegistered event with correct args", async function () {
      await expect(
        dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01CA04", "BATCH-001", 50, "Access")
      )
        .to.emit(dr, "SaleRegistered")
        .withArgs(1, pharmacyAcc.address, vetAcc.address, "J01CA04", "Access");
    });

    it("FARMER cannot call registerSale — reverts", async function () {
      await expect(
        dr.connect(farmerAcc).registerSale(vetAcc.address, "J01CA04", "BATCH-001", 50, "Access")
      ).to.be.revertedWith("DrugRegistry: caller is not a registered pharmacy");
    });

    it("unregistered caller cannot registerSale", async function () {
      await expect(
        dr.connect(unknown).registerSale(vetAcc.address, "J01CA04", "BATCH-001", 50, "Access")
      ).to.be.revertedWith("DrugRegistry: caller is not a registered pharmacy");
    });

    it("sale with unregistered vet reverts", async function () {
      await expect(
        dr.connect(pharmacyAcc).registerSale(unknown.address, "J01CA04", "BATCH-001", 50, "Access")
      ).to.be.revertedWith("DrugRegistry: veterinarian not registered");
    });

    it("sale with FARMER address as vet reverts", async function () {
      await expect(
        dr.connect(pharmacyAcc).registerSale(farmerAcc.address, "J01CA04", "BATCH-001", 50, "Access")
      ).to.be.revertedWith("DrugRegistry: veterinarian not registered");
    });

    it("quantity 0 reverts", async function () {
      await expect(
        dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01CA04", "BATCH-001", 0, "Access")
      ).to.be.revertedWith("DrugRegistry: quantity must be > 0");
    });
  });

  describe("getSale", function () {
    let saleId;

    beforeEach(async function () {
      await dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01XB01", "BATCH-COL", 10, "Reserve");
      saleId = 1;
    });

    it("returns correct sale struct", async function () {
      const sale = await dr.getSale(saleId);
      expect(sale.pharmacy).to.equal(pharmacyAcc.address);
      expect(sale.veterinarian).to.equal(vetAcc.address);
      expect(sale.atcCode).to.equal("J01XB01");
      expect(sale.batchNumber).to.equal("BATCH-COL");
      expect(sale.quantity).to.equal(10);
      expect(sale.awareClass).to.equal("Reserve");
      expect(sale.active).to.be.true;
    });

    it("getSale with invalid ID reverts", async function () {
      await expect(dr.getSale(0)).to.be.revertedWith("DrugRegistry: sale not found");
      await expect(dr.getSale(999)).to.be.revertedWith("DrugRegistry: sale not found");
    });
  });

  describe("getVetPurchases", function () {
    it("includes saleId after registration", async function () {
      await dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01CA04", "BATCH-001", 50, "Access");
      const purchases = await dr.getVetPurchases(vetAcc.address);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(1);
    });

    it("accumulates multiple sales", async function () {
      await dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01CA04", "B1", 10, "Access");
      await dr.connect(pharmacyAcc).registerSale(vetAcc.address, "J01XB01", "B2", 5, "Reserve");
      const purchases = await dr.getVetPurchases(vetAcc.address);
      expect(purchases.length).to.equal(2);
    });

    it("returns empty array for vet with no purchases", async function () {
      const purchases = await dr.getVetPurchases(vetAcc.address);
      expect(purchases.length).to.equal(0);
    });
  });
});
