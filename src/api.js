const express = require('express');
const jwt = require('jsonwebtoken');
const { CallServer } = require('./starlims-proxy.js');
const sessionStore = {};
const path = require('path');
const router = express.Router();

// Middleware to verify the token
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.debug(`Session check failed ===> Code 3`);
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {

        // Retrieve session data from Redis
        const sessionData = await req.cache.get(token);

        if (!sessionData) {
            console.debug(`Session check failed ===>  Code 2`);
            return res.status(401).json({ error: 'Session corruption' });
        }

        const { username, STARLIMSsessionId } = sessionData;

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            req.user = decoded.username;

            if (decoded.STARLIMSsessionId === STARLIMSsessionId &&
                decoded.username === username) {

                // attach session Id to request for future usage
                req.STARLIMSsessionId = STARLIMSsessionId;

                console.debug(`Session check ===> success`);
                next();
            } else {
                console.debug(`Session check ===> failed. Code 1`);
                return res.status(401).json({ error: 'Session corruption' });
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Session corruption' });
    }
};

// Proxy endpoint
router.post('/proxy', verifyToken, async (req, res) => {
    const { action, parameters, email } = req.body;
    try {

        // Make a request to the external API using the Axios instance
        const response = await CallServer(action, parameters, email, req.STARLIMSsessionId);
        // Forward the response back to the client with the same status code and data
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(error);
        if (error.status) { // HTTP error
            res.status(error.status).json(error.data);
        } else {
            // If there's another type of error, handle it and send an appropriate response
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Proxy endpoint// Proxy endpoint
router.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;

    const action = 'ReactProxy.Authenticate';
    const subparams = { username, password };
    const params = [action, Object.values(subparams), 'script'];

    const clientCookies = req.headers.cookie
    try {
        // Make a request to the external API using the Axios instance
        const response = await CallServer(`_MichelTestScripts.React_Proxy`, Object.values(params), process.env.STARLIMS_DEFAULT_EMAIL, clientCookies);
        if (response.data?.data?.success === true) {
            const content = { username, STARLIMSsessionId: response.data.data.sessionId };

            // create session token
            const token = jwt.sign(content, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Store session token in session store
            await req.cache.set(token, content);
            res.status(200).json({ token });

        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }

        // Forward the response back to the client with the same status code and data
    } catch (error) {
        console.error(error);
        if (error.status) { // HTTP error
            res.status(error.status).json(error.data);
        } else {
            // If there's another type of error, handle it and send an appropriate response
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

router.get('/sdp', (req, res) => {
    const filePath = path.join(__dirname, './public/ReactProxy_v1.sdp');
    res.download(filePath, 'ReactProxy_v1.sdp', (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});


router.get('/', async (req, res) => {
    const json = { message: 'STARLIMS Proxy Server', status: "ok", isAuthenticated: false, username: 'anonymous' }
    // Get the authorization header
    const authHeader = req.headers['authorization'];
    // Check if the authorization header is present and has the correct format
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Extract the token from the authorization header
        const token = authHeader.split(' ')[1];

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                json.isAuthenticated = true;
                json.username = decoded.username;
            }
        });
    }
    res.status(200).json(json);
});

module.exports = router;
