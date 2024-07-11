import { useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Files from "@/components/Files";
const siwe = require("siwe");
// import lit protocol sdk
import * as LitJsSdk from "@lit-protocol/lit-node-client";

const [file, setFile] = useState("");
const [cid, setCid] = useState("");
const [uploading, setUploading] = useState(false);
// add a new state for the cid to decrypt
const [decryptionCid, setDecryptionCid] = useState("");

const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);
      // Create our litNodeClient
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      // Then get the authSig
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

      /* const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'mumbai'
      }); */
      // Define our access controls, this is set to be anyone
      const accs = [
        {
            contractAddress: '0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41',
            standardContractType: 'ERC1155',
            chain: 'mumbai',
            method: 'balanceOf',
            parameters: [':userAddress', '1'], //tokenId
            returnValueTest: {
                comparator: '>=',
                value: '0',
            },
        },
      ];
      // Then we use our access controls and authSig to encrypt the file and zip it up with the metadata
      const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
        accessControlConditions: accs,
        authSig,
        chain: 'mumbai',
        file: fileToUpload,
        litNodeClient: litNodeClient,
        readme: "Use IPFS CID of this file to decrypt it"
      });

      // Then we turn it into a file that will be accepted by the Pinata API
      const encryptedBlob = new Blob([encryptedZip], { type: 'text/plain' })
	  const encryptedFile = new File([encryptedBlob], fileToUpload.name)

      // Finally we upload the file by passing it to our /api/files endpoint
      // Keep in mind this works for smaller files and you may need to do a presigned JWT and upload from the client if you're dealing with larger files
      // Read more about that here: https://www.pinata.cloud/blog/how-to-upload-to-ipfs-from-the-frontend-with-signed-jwts
      const formData = new FormData();
      formData.append("file", encryptedFile, encryptedFile.name)
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const ipfsHash = await res.text();
      setCid(ipfsHash);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };


const decryptFile = async (fileToDecrypt) => {
    try {
      // First we fetch the file from IPFS using the CID and our Gateway URL, then turn it into a blob
      const fileRes = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${fileToDecrypt}?filename=encrypted.zip`)
      const file = await fileRes.blob()
      // We recreated the litNodeClient and the authSig
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      await litNodeClient.connect();
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
      // Then we simpyl extract the file and metadata from the zip
      // We could do more with this, like try to display it in the app UI if we wanted to
      const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
        file: file,
        litNodeClient: litNodeClient,
        authSig: authSig,
      })
      // After we have our dcypted file we can download it
      const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = metadata.name;  // Use the metadata to get the file name and type

    } catch (error) {
      alert("Trouble decrypting file")
      console.log(error)
    }
};

/*     <input
  type="text"
  onChange={(e) => setDecryptionCid(e.target.value)}
  className="px-4 py-2 border-2 border-secondary rounded-3xl text-lg"
  placeholder="Enter CID to decrypt"
/>
<button
  onClick={() => decryptFile(decryptionCid)}
  className="mr-10 w-[150px] bg-light text-secondary border-2 border-secondary rounded-3xl py-2 px-4 hover:bg-secondary hover:text-light transition-all duration-300 ease-in-out"
>Decrypt</button> */