const express = require('express');
const app = express();
const port = 5005;

// Basic logging (can be replaced with a more robust logger like Winston or Pino)
const logger = {
    info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
    error: (message) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
};

// Middleware to parse JSON bodies (if you were sending JSON from client)
// Not strictly needed for this example's POST as it sends no body, but good practice.
app.use(express.json());


const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latency Demo (Node.js)</title>
    <style>
        body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
        .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        button {
            background-color: #007bff; color: white; padding: 10px 15px;
            border: none; border-radius: 5px; cursor: pointer; font-size: 16px;
        }
        button:hover { background-color: #0056b3; }
        #result { margin-top: 20px; padding: 10px; border: 1px solid #ddd; background-color: #e9e9e9; border-radius: 5px;}
        .loader {
            border: 5px solid #f3f3f3; /* Light grey */
            border-top: 5px solid #3498db; /* Blue */
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            display: none; /* Hidden by default */
            margin-top: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Simulate Backend Latency (Node.js/Express)</h1>
        <p>Click the button below. The server will intentionally delay its response.</p>
        <button id="latencyButton">Trigger Latency</button>
        <div class="loader" id="loader"></div>
        <div id="result">Click the button to see the response.</div>
    </div>

    <script>
        const button = document.getElementById('latencyButton');
        const resultDiv = document.getElementById('result');
        const loader = document.getElementById('loader');

        button.addEventListener('click', async () => {
            resultDiv.textContent = 'Request sent, waiting for server response...';
            loader.style.display = 'block'; // Show loader
            button.disabled = true; // Disable button during request

            const startTime = Date.now();

            try {
                // Make a POST request
                const response = await fetch('/simulate_latency', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Still good practice even if body is empty
                    },
                    // body: JSON.stringify({ data: "some_payload" }) // Optional payload
                });

                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }

                const data = await response.json();
                const endTime = Date.now();
                const duration = ((endTime - startTime) / 1000).toFixed(2); // in seconds

                resultDiv.innerHTML = \`<strong>Server responded</strong> \`;

            } catch (error) {
                resultDiv.textContent = \`Error: \${error.message}\`;
                console.error(\`Frontend error: \${error.message}\`); // Log to browser console
            } finally {
                loader.style.display = 'none'; // Hide loader
                button.disabled = false; // Re-enable button
            }
        });
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(HTML_TEMPLATE);
});

// Function to create an asynchronous delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/simulate_latency', async (req, res) => {
    const delaySeconds = 15;
    const delayMilliseconds = delaySeconds * 1000;

    logger.info(`Received request for /simulate_latency. Intentionally delaying for ${delaySeconds.toFixed(2)} seconds.`);

    await sleep(delayMilliseconds); // Asynchronous delay

    logger.info(`Finished delay. Sending response.`);
    res.json({
        message: `Processed successfully after a ${delaySeconds.toFixed(2)} second delay!`,
        simulated_delay_seconds: parseFloat(delaySeconds.toFixed(2))
    });
});

app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});