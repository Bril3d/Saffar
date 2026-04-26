const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. AccessControl
  console.log("Deploying AccessControl...");
  const AC = await ethers.getContractFactory("AccessControl");
  const accessControl = await AC.deploy();
  await accessControl.waitForDeployment();
  const acAddr = await accessControl.getAddress();
  console.log("  ✅ AccessControl:", acAddr);

  // 2. DrugWithdrawalRegistry
  console.log("Deploying DrugWithdrawalRegistry...");
  const DWR = await ethers.getContractFactory("DrugWithdrawalRegistry");
  const drugWithdrawalRegistry = await DWR.deploy();
  await drugWithdrawalRegistry.waitForDeployment();
  const dwrAddr = await drugWithdrawalRegistry.getAddress();
  console.log("  ✅ DrugWithdrawalRegistry:", dwrAddr);

  // 3. DrugRegistry
  console.log("Deploying DrugRegistry...");
  const DR = await ethers.getContractFactory("DrugRegistry");
  const drugRegistry = await DR.deploy(acAddr);
  await drugRegistry.waitForDeployment();
  const drAddr = await drugRegistry.getAddress();
  console.log("  ✅ DrugRegistry:", drAddr);

  // 4. PrescriptionRegistry
  console.log("Deploying PrescriptionRegistry...");
  const PR = await ethers.getContractFactory("PrescriptionRegistry");
  const prescriptionRegistry = await PR.deploy(acAddr, drAddr, dwrAddr);
  await prescriptionRegistry.waitForDeployment();
  const prAddr = await prescriptionRegistry.getAddress();
  console.log("  ✅ PrescriptionRegistry:", prAddr);

  // 5. SlaughterGate
  console.log("Deploying SlaughterGate...");
  const SG = await ethers.getContractFactory("SlaughterGate");
  const slaughterGate = await SG.deploy(acAddr, prAddr);
  await slaughterGate.waitForDeployment();
  const sgAddr = await slaughterGate.getAddress();
  console.log("  ✅ SlaughterGate:", sgAddr);

  // Write shared contracts.json to /shared (create dir if needed)
  const sharedDir = path.join(__dirname, "../../shared");
  if (!fs.existsSync(sharedDir)) fs.mkdirSync(sharedDir, { recursive: true });

  const contracts = {
    network: "localhost",
    chainId: 1337,
    addresses: {
      accessControl: acAddr,
      drugWithdrawalRegistry: dwrAddr,
      drugRegistry: drAddr,
      prescriptionRegistry: prAddr,
      slaughterGate: sgAddr,
    },
    abis: {
      accessControl: JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/src/contracts/AccessControl.sol/AccessControl.json"))
      ).abi,
      drugWithdrawalRegistry: JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/src/contracts/DrugWithdrawalRegistry.sol/DrugWithdrawalRegistry.json"))
      ).abi,
      drugRegistry: JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/src/contracts/DrugRegistry.sol/DrugRegistry.json"))
      ).abi,
      prescriptionRegistry: JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/src/contracts/PrescriptionRegistry.sol/PrescriptionRegistry.json"))
      ).abi,
      slaughterGate: JSON.parse(
        fs.readFileSync(path.join(__dirname, "../artifacts/src/contracts/SlaughterGate.sol/SlaughterGate.json"))
      ).abi,
    },
  };

  fs.writeFileSync(
    path.join(sharedDir, "contracts.json"),
    JSON.stringify(contracts, null, 2)
  );

  console.log("\n📦 contracts.json written to /shared/contracts.json");
  console.log("🚀 All contracts deployed successfully!\n");
  console.log("Addresses summary:");
  Object.entries(contracts.addresses).forEach(([name, addr]) => {
    console.log(`  ${name}: ${addr}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
