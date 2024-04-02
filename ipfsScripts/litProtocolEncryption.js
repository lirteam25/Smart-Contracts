import { useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Files from "@/components/Files";
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
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'amoy'
      });
      // Define our access controls, this is set to be anyone
      const accs = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'amoy',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
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
        chain: 'amoy',
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
        // We recreate the litNodeClient and the authSig
        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: 'cayenne',
        });
        await litNodeClient.connect();
        const authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: 'amoy'
        });
        // Then we simply extract the file and metadata from the zip
        // We could do more with this, like try to display it in the app UI if we wanted to
        const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
            file: file,
            litNodeClient: litNodeClient,
            authSig: authSig,
        })
        // After we have our decrypted file we can download it
        const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = metadata.name;  // Use the metadata to get the file name and type
        // Automatically trigger the download
        downloadLink.click();
    } catch (error) {
        alert("Trouble decrypting file")
        console.log(error)
    }
};
