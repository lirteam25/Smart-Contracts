const axios = require("axios")

const file = "LIR.png";

async function pinFileToIPFS (file, artist) {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

    //making axios POST request to Pinata
    let data = new FormData();
    data.append(file, file);

    const metadata = JSON.stringify({
        name: `${file.path}`,
        keyvalues: {
            ArtistID: `${artist}`
        },
    });
    data.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({
        cidversion: 0,
    });
    data.append('pinataOptions', pinataOptions);

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            }
        })
        .then(function (response) {
            console.log("file uploaded", response.data.IpfsHash);
            const pinataURL = "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash;
            return (
                pinataURL
            );
        })
        .catch(function (error) {
            console.log(error);
            return {
                message: error.message,
            }
        })
};