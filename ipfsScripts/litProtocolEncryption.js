const fs = require('fs');
const LitJsSdk = require("@lit-protocol/lit-node-client");

const fileToUpload = "LIR.jpg"; // Placeholder content, replace with actual file content

let file = "";
let cid = "";
let uploading = false;
let decryptionCid = "";

const uploadFile = async (fileToUpload) => {
    try {
        setUploading(true);

        console.log('Starting the client...');
        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: 'cayenne',
        });
        await litNodeClient.connect();

        console.log('Signature...');
        const authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: 'mumbai'
        });

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

        console.log('Encryption starts...');

        const fileContent = await readFileAsBlob(fileToUpload); // Read file content as Blob

        const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
            accessControlConditions: accs,
            authSig,
            chain: 'mumbai',
            file: fileContent, // Pass the Blob object here
            litNodeClient: litNodeClient,
            readme: "Use IPFS CID of this file to decrypt it"
        });

        const encryptedBlob = new Blob([encryptedZip], { type: 'text/plain' });
        const encryptedFile = new File([encryptedBlob], fileToUpload.name);

        const formData = new FormData();
        formData.append("file", encryptedFile, encryptedFile.name);

        console.log('Uploading...');

        const res = await fetch("/api/files", {
            method: "POST",
            body: formData,
        });

        const ipfsHash = await res.text();
        setCid(ipfsHash);
        setUploading(false);
        console.log(ipfsHash);
        
        // Call decryptFile function after uploading
        await decryptFile(ipfsHash);
    } catch (e) {
        console.log(e);
        setUploading(false);
        alert("Trouble uploading file");
    }
};

const decryptFile = async (fileToDecrypt) => {
    try {
        const fileRes = await fetch(`/ipfs/${fileToDecrypt}?filename=encrypted.zip`);
        const file = await fileRes.blob();

        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: 'cayenne',
        });

        await litNodeClient.connect();
        const authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: 'mumbai'
        });

        const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
            file: file,
            litNodeClient: litNodeClient,
            authSig: authSig,
        });

        const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = metadata.name;
        downloadLink.click();
    } catch (error) {
        alert("Trouble decrypting file");
        console.log(error);
    }
};

const readFileAsBlob = async (filename) => {
    const response = await fetch(filename);
    const blob = await response.blob();
    return blob;
}

// Call uploadFile with the fileToUpload constant to initiate the upload process
uploadFile(fileToUpload);
