const { ethers } = require('ethers');
const mnemonic = 'test test test test test test test test test test test junk';
for (let i = 0; i < 6; i++) {
  const wallet = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase(mnemonic),
    `m/44'/60'/0'/0/${i}`
  );
  console.log(`[${i}] ${wallet.address}  ${wallet.privateKey}`);
}
