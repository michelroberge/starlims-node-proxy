# Node Proxy App for STARLIMS API

## Description
This Node.js application serves as a proxy server for interacting with the STARLIMS API. It provides a simple interface for making requests to the STARLIMS API from a client-side application while handling authentication and proxying requests to the STARLIMS server.

Because it is using REST API, it allows handling CORS between this proxy and the client app, without having to change anything on STARLIMS side.

This project works hand in hand with https://github.com/michelroberge/starlims-react

### Missing information
- Whitelisting instructions in STARLIMS
- Enabling the REST API in STARLIMS
- Importing the support package in  STARLIMS

## Setup Instructions
1. **Clone the repository:**
   ```sh
   git clone <repository_url>
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Create a `.env` file** in the root directory of the project with the following configuration:
   ```env
   STARLIMS_PRIVATE_KEY=<your_STARLIMS_private_key>
   STARLIMS_ACCESS_KEY=<your_STARLIMS_access_key>
   STARLIMS_URL=<your_STARLIMS_API_URL>/rest.web.api/v1/generic/action
   STARLIMS_DEFAULT_EMAIL=<default_email_for_STARLIMS>
   STARLIMS_HTTP_PROXY=http|https (try http if https returns 401 - this is just how the key is calculated)
   PROXY_PORT=3000
   ```
   Make sure to replace placeholders with your actual STARLIMS credentials and API URL.

## Usage
1. **Start the server:**
   ```sh
   npm start
   ```
   This will start the server at `http://localhost:3000` by default, unless overridden by the `PROXY_PORT` variable in the `.env` file.

2. **Make requests to the proxy endpoint:**
   Send POST requests to `http://localhost:3000/proxy` with the following JSON payload:
   ```json
   {
       "action": "your_STARLIMS_action",
       "parameters": {
           "param1": "value1",
           "param2": "value2"
       },
       "email": "user@example.com"
   }
   ```
   - `action`: The specific action you want to perform in STARLIMS.
   - `parameters`: Any parameters required for the action.
   - `email`: Email associated with the request.

## Additional Notes
- CORS is enabled for requests originating from `http://localhost:3033` to allow communication from client-side applications running on that domain.
- Ensure that your STARLIMS credentials and API URL are kept secure and not exposed publicly.
- For more information on the STARLIMS API and available actions, refer to the STARLIMS documentation.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author
Michel Roberge

## Contact
For any inquiries or support, please contact michel_roberge@msn.com.

## Acknowledgements
- ChatGPT and many other online resources for the learning curve on node!
