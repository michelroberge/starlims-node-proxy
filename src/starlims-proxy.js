const axios = require('axios');
const CryptoJS = require('crypto-js');

async function generateHeaders(url, method, body, apiEmail = null) {
    const dateNow = new Date().toISOString();
    const privateKey = process.env.STARLIMS_PRIVATE_KEY;
    const accessKey = process.env.STARLIMS_ACCESS_KEY;

    // Create base security signature
    const signatureBase = `${url}\n${method}\n${accessKey}\n\n${dateNow}\n${JSON.stringify(body)}`;
    // Get encoding hash of signature
    const data = CryptoJS.enc.Utf8.parse(signatureBase);

    const hash = CryptoJS.HmacSHA256(data, privateKey);
    const encodedHash = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));

    // Create headers
    const headers = {
        "SL-API-Timestamp": dateNow,
        "SL-API-Signature": encodedHash,
        "SL-API-Auth": accessKey,
        "SL-API-Email": apiEmail ?? process.env.STARLIMS_DEFAULT_EMAIL,
        "Content-Type": "application/json"
    };

    return headers;
}


// Function to make a call to the Starlims server
async function CallServer(action, parameters, email, STARLIMSsessionId) {
    const url = process.env.STARLIMS_URL;
    const body = { action, parameters, email };
    const method = "POST";
    
    const headers = await generateHeaders(url.replace('https://', `${process.env.STARLIMS_HTTP_PROXY}://`), method, body);
    headers["STARLIMSsessionId"] = STARLIMSsessionId;

    try {
        const response = await axios.request({
            url: url,
            method: method,
            headers: headers,
            data: body
        });
        
        // If the response status is not in the 2xx range, treat it as an error
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        return response;
    } catch (error) {
        // If it's an HTTP error, throw it to be caught by the caller
        if (error.response) {
            throw error.response;
        }
        // If it's another type of error, re-throw it
        throw error;
    }
}

// Export the CallServer function for external use
module.exports = {
    CallServer
};
