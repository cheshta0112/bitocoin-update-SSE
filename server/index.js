const express = require("express");
const axios = require("axios");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 3001;

// Set up rate limiting middleware.
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours window
  max: 3000, // Limit each IP to 3000 requests per windowMs
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// Enable CORS for the SSE route
app.use("/sse", cors());

// Serve the React app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// SSE route to send live data
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendLiveData = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );

      const liveData = response.data; // Extract relevant data from the API response.
      res.write(`data: ${JSON.stringify(liveData)}\n\n`);
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  const intervalId = setInterval(sendLiveData, 10000); // Fetch data every 10 seconds.

  req.on("close", () => {
    clearInterval(intervalId); // Stop sending data when the client connection closes.
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
