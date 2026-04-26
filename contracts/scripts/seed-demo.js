const { ethers, network } = require("hardhat");
const path = require("path");
const fs = require("fs");

/**
 * Seed demo data for SAFAR Chain hackathon demo
 *
 * Creates:
 *  - 4 registered actors (pharmacy, vet, farmer, abattoir)
 *  - 2 drug sales
 *  - 2 prescriptions (both created now, then time-travel +6 days):
 *    → L-882: Amoxicilline, 5-day min, 6 days elapsed → ELIGIBLE ✅
 *    → L-901: Colistine, 7-day min, 6 days elapsed → NOT ELIGIBLE ❌ (1 day remaining)
 */
async function main() {
  const signers = await ethers.getSigners();
  const admin = signers[0];
  const pharmacySigner = signers[1];
  const vetSigner = signers[2];
  const farmerSigner = signers[3];
  const abattoirSigner = signers[4];

  console.log("🌱 Seeding SAFAR Chain demo data...\n");

  // Load deployed addresses
  const contractsPath = path.join(__dirname, "../../shared/contracts.json");
  if (!fs.existsSync(contractsPath)) {
    throw new Error("contracts.json not found. Run deploy first: npm run deploy:local");
  }
  const contracts = JSON.parse(fs.readFileSync(contractsPath));
  const { addresses, abis } = contracts;

  // Get contract instances
  const accessControl = new ethers.Contract(addresses.accessControl, abis.accessControl, admin);
  const drugRegistry = new ethers.Contract(addresses.drugRegistry, abis.drugRegistry, pharmacySigner);
  const prescriptionRegistry = new ethers.Contract(addresses.prescriptionRegistry, abis.prescriptionRegistry, vetSigner);
  const slaughterGate = new ethers.Contract(addresses.slaughterGate, abis.slaughterGate, abattoirSigner);

  // Step 1: Register all actors
  console.log("1️⃣  Registering actors...");
  await (await accessControl.registerActor(pharmacySigner.address, 1)).wait(); // PHARMACY
  console.log("  ✅ Pharmacy registered:", pharmacySigner.address);
  await (await accessControl.registerActor(vetSigner.address, 2)).wait();     // VET
  console.log("  ✅ Vet #V-221 registered:", vetSigner.address);
  await (await accessControl.registerActor(farmerSigner.address, 3)).wait();  // FARMER
  console.log("  ✅ Farmer Ahmed registered:", farmerSigner.address);
  await (await accessControl.registerActor(abattoirSigner.address, 4)).wait(); // SLAUGHTERHOUSE
  console.log("  ✅ Abattoir #A-15 registered:", abattoirSigner.address);

  // Step 2: Drug sales
  console.log("\n2️⃣  Creating drug sales...");
  // Sale 1: Amoxicilline (Access class) → for L-882
  const sale1Tx = await drugRegistry.registerSale(vetSigner.address, "J01CA04", "BATCH-AMX-2024", 50, "Access");
  const sale1Receipt = await sale1Tx.wait();
  const sale1Event = sale1Receipt.logs
    .map(log => { try { return drugRegistry.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "SaleRegistered");
  const saleId1 = sale1Event.args[0];
  console.log(`  ✅ Sale 1: Amoxicilline J01CA04 (50 doses) → Vet #V-221 [saleId=${saleId1}]`);

  // Sale 2: Colistine (Reserve class) → for L-901
  const sale2Tx = await drugRegistry.registerSale(vetSigner.address, "J01XB01", "BATCH-COL-2024", 10, "Reserve");
  const sale2Receipt = await sale2Tx.wait();
  const sale2Event = sale2Receipt.logs
    .map(log => { try { return drugRegistry.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "SaleRegistered");
  const saleId2 = sale2Event.args[0];
  console.log(`  ✅ Sale 2: Colistine J01XB01 (10 doses) → Vet #V-221 [saleId=${saleId2}]`);

  // Step 3: Prescriptions — both created at current time, then we advance time forward
  console.log("\n3️⃣  Creating prescriptions...");

  const DAY = 24 * 60 * 60;

  // L-882: Amoxicilline J01CA04 — legal min 5 days, vet specifies 5 → uses 5
  const rx1Tx = await prescriptionRegistry.connect(vetSigner).createPrescription(
    saleId1, farmerSigner.address, "L-882", "Maladie respiratoire bovine", 100, 5
  );
  const rx1Receipt = await rx1Tx.wait();
  // rxId is the return value — read it from the PrescriptionCreated event
  const rx1Event = rx1Receipt.logs
    .map(log => { try { return prescriptionRegistry.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "PrescriptionCreated");
  const rx1Id = rx1Event.args[0]; // uint256 rxId
  console.log(`  ✅ Prescription L-882: Amoxicilline, 5 days withdrawal [rxId=${rx1Id}]`);

  await (await prescriptionRegistry.connect(farmerSigner).confirmAdministration(rx1Id)).wait();
  console.log("  ✅ L-882 administration confirmed by farmer");

  // L-901: Colistine J01XB01 — legal min 7 days, vet inputs 0 → contract enforces 7
  const rx2Tx = await prescriptionRegistry.connect(vetSigner).createPrescription(
    saleId2, farmerSigner.address, "L-901", "Diarrhée néonatale bovine", 50, 0
  );
  const rx2Receipt = await rx2Tx.wait();
  const rx2Event = rx2Receipt.logs
    .map(log => { try { return prescriptionRegistry.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "PrescriptionCreated");
  const rx2Id = rx2Event.args[0];
  console.log(`  ✅ Prescription L-901: Colistine (Reserve), 7 days withdrawal [rxId=${rx2Id}]`);

  await (await prescriptionRegistry.connect(farmerSigner).confirmAdministration(rx2Id)).wait();
  console.log("  ✅ L-901 administration confirmed by farmer");

  // Advance time by 6 days:
  //   L-882 (5-day min): 6 days elapsed → ELIGIBLE ✅
  //   L-901 (7-day min): 6 days elapsed → NOT ELIGIBLE ❌ (1 day remaining)
  console.log("\n⏩  Fast-forwarding 6 days...");
  await network.provider.send("evm_increaseTime", [6 * DAY]);
  await network.provider.send("evm_mine");
  console.log("  ✅ 6 days elapsed");

  // Step 4: Verify eligibility
  console.log("\n4️⃣  Verifying eligibility...");
  const [l882Eligible, l882Days] = await slaughterGate.checkEligibility("L-882", rx1Id);
  console.log(`  L-882: eligible=${l882Eligible}, daysRemaining=${l882Days}`);
  if (!l882Eligible) throw new Error("❌ SEED ERROR: L-882 should be eligible!");
  console.log("  ✅ L-882 is ELIGIBLE for slaughter");

  const [l901Eligible, l901Days] = await slaughterGate.checkEligibility("L-901", rx2Id);
  console.log(`  L-901: eligible=${l901Eligible}, daysRemaining=${l901Days}`);
  if (l901Eligible) throw new Error("❌ SEED ERROR: L-901 should NOT be eligible yet!");
  console.log(`  ✅ L-901 is NOT ELIGIBLE (${l901Days} days remaining)`);

  // Step 5: Certify L-882
  console.log("\n5️⃣  Certifying L-882...");
  const certTx = await slaughterGate.certifyLot("L-882", rx1Id);
  await certTx.wait();
  const verification = await slaughterGate.getLotVerification("L-882");
  console.log("  ✅ L-882 CERTIFIED");
  console.log("  Certificate hash:", verification.certificateHash);

  console.log("\n✨ Seed complete! Demo data ready:\n");
  console.log("  LOT    | STATUS         | DAYS REMAINING");
  console.log("  -------|----------------|---------------");
  console.log(`  L-882  | ✅ ELIGIBLE    | 0 (certified)`);
  console.log(`  L-901  | ❌ NOT ELIGIBLE| ${l901Days}`);
  console.log("\nRun the mobile app and scan QR codes to demo the gate!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
