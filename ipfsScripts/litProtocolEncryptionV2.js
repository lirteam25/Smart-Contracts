const LitJsSdk = require("@lit-protocol/lit-node-client");

const runTest = async () => {
  const litNodeClient = new LitJsSdk.LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork: "cayenne",
    debug: true,
  });
  await litNodeClient.connect();

  // Then get the authSig
  const authSig = await LitJsSdk.checkAndSignAuthMessage({
    chain: 'mumbai'
  });

  // Define our access controls, this is set to be anyone
  const accs = [
    {
      contractAddress: '0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41',
      standardContractType: 'ERC1155',
      chain: 'mumbai',
      method: 'balanceOf',
      parameters: [':userAddress', '1'],
      returnValueTest: {
        comparator: '>',
        value: '0',
      },
    },
  ];

  // let's encrypt something
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accs,
      authSig,
      chain: "mumbai",
      dataToEncrypt: "This is a secret message" // nothing actually lives on ethereum here, but we need to pass a chain
    },
    litNodeClient
  );
  console.log(
    "ciphertext ",
    LitJsSdk.uint8arrayToString(ciphertext, "base16")
  );

  console.log("Data encrypted.  Now to decrypt it.");

  const decryptedString = await LitJsSdk.decryptToString({
    accs,
    ciphertext,
    dataToEncryptHash,
    authSig,
    chain: "mumbai", // nothing actually lives on ethereum here, but we need to pass a chain
  }, litNodeClient);

  console.log("decryptedString: ", decryptedString);
};

runTest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });