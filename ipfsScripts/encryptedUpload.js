const siwe = require("siwe");
const LitJsSdk = require("@lit-protocol/lit-node-client");
const fs = require('fs');
const axios = require("axios");

const pinFileToIPFS = async () => {
    try {
        const src = "/Users/gianmariacarnazzi/LIR/LIR_Smart_Contract_repo/Smart-Contracts/LIR.jpg";
        const file = await fs.promises.readFile(src);
        const fileBlob = new Blob([file], { type: 'image' })
        // Add this line after reading the file content
        //const file = new Uint8Array(fileB);

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

        console.log('Sign the message')

        // Sign the message and format the authSig
        const signature = await wallet.signMessage(messageToSign);

        const authSig = {
            sig: signature,
            derivedVia: "web3.eth.personal.sign",
            signedMessage: messageToSign,
            address: address,
        };

        console.log(authSig);

        const accs = [
            {
                contractAddress: '0x779ea3cDc91eaE5a51AB900EBF08f633997b4a41',
                standardContractType: 'ERC1155',
                chain: 'mumbai',
                method: 'balanceOf',
                parameters: [':userAddress', '5'], //tokenId
                returnValueTest: {
                    comparator: '>',
                    value: '0',
                },
            },
        ];

        console.log("Encryption...")
        // Then we use our access controls and authSig to encrypt the file and zip it up with the metadata
        const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
            accessControlConditions: accs,  
            authSig,
            chain: 'mumbai',
            file: fileBlob,
            litNodeClient: litNodeClient,
            readme: "Use IPFS CID of this file to decrypt it"
        });

        console.log("File Formatting...")

        // Then we turn it into a file that will be accepted by the Pinata API
        const encryptedBlob = new Blob([encryptedZip], { type: 'text/plain' })
        const encryptedFile = new File([encryptedBlob], "audioFile")

        // Finally we upload the file by passing it to our /api/files endpoint
        // Keep in mind this works for smaller files and you may need to do a presigned JWT and upload from the client if you're dealing with larger files
        // Read more about that here: https://www.pinata.cloud/blog/how-to-upload-to-ipfs-from-the-frontend-with-signed-jwts
        const formData = new FormData();
        formData.append("file", encryptedFile, encryptedFile.name)

        const pinataOptions = JSON.stringify({
            cidVersion: 0,
        })
        formData.append('pinataOptions', pinataOptions);

        try {
            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: "Infinity",
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${process.env.PINATA_SECRET_API_KEY}`
                }
            });
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log("An error occurred:", error);
    }
}

pinFileToIPFS()