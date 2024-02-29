const { upgrades } = require('hardhat');

async function main() {

    console.log("Transferring ownership of ProxyAdmin...");
    // The owner of the ProxyAdmin can upgrade our contracts
    await upgrades.admin.transferProxyAdminOwnership("0x1d3b67c7e2C8520eBb2c7F0032B9B4CB3dd23038"); //0x6e5158ad8F720BF4e356C16C2c9450a27Cc21122 (mainnet)
    console.log("Transferred ownership of ProxyAdmin to: 0x1d3b67c7e2C8520eBb2c7F0032B9B4CB3dd23038");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });