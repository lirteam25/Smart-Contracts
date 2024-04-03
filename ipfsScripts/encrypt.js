const LitJsSdk = require("@lit-protocol/lit-node-client-nodejs");
const { ethers } = require("hardhat");
const siwe = require("siwe");
const fs = require('fs').promises; 

const accs = [
  {
      contractAddress: '0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41',
      standardContractType: 'ERC1155',
      chain: 'mumbai',
      method: 'balanceOf',
      parameters: [':userAddress', '1'],
      returnValueTest: {
          comparator: '>=',
          value: '0',
      },
  },
];

async function main() {
  try {
    // Initialize LitNodeClient
    const litNodeClient = new LitJsSdk.LitNodeClientNodeJs();
    await litNodeClient.connect();

    // Initialize the signer
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_LIR_TESTNET);
    const address = ethers.utils.getAddress(await wallet.getAddress());

    // Craft the SIWE message
    const domain = "localhost";
    const origin = "https://localhost/login";
    const statement =
      "This is a test statement.  You can put anything you want here.";
    const siweMessage = new siwe.SiweMessage({
      domain,
      address: address,
      statement,
      uri: origin,
      version: "1",
      chainId: "80001", // mumbai chainId 80001
    });
    const messageToSign = siweMessage.prepareMessage();

    // Sign the message and format the authSig
    const signature = await wallet.signMessage(messageToSign);

    const authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: messageToSign,
      address: address,
    };

    console.log(authSig);

    // Read the file content
    const filePath = "/Users/gianmariacarnazzi/LIR/LIR_Smart_Contract_repo/Smart-Contracts/LIR.jpg";
    const fileContent = await fs.readFile(filePath);

    const ipfsCid = await LitJsSdk.encryptToIpfs({
      authSig: authSig,
      accessControlConditions: accs,
      chain: 'mumbai',
      string: "Encrypt & store on IPFS seamlessly with Lit 😎",
      file: fileContent, // If you want to encrypt a file instead of a string
      litNodeClient: litNodeClient,
      infuraId: "lirmusic",
      infuraSecretKey: 'HlVUgZcbfpF2iA8ilAJoux4MyTAwmcKlvjnTom49MIOi2k9QvpeL0w',
    });

    console.log(ipfsCid);
  } catch (error) {
    console.error('An error occurred in main():', error);
  }
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error('Unhandled promise rejection outside main():', error);
  }
})();

