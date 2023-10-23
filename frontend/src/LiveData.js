import React, { useEffect, useState } from "react";

const LiveData = () => {
  const [bitcoinPrices, setBitcoinPrices] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [activeUser, setActiveUser] = useState(true); // Assume user is initially active.

  // Function to beautify the price value to a specified number of decimal places.
  const beautifyPrice = (price, decimalPlaces) => {
    return parseFloat(price).toFixed(decimalPlaces);
  };

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/sse");

    eventSource.onopen = () => {
      setConnectionStatus("Connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.bitcoin && data.bitcoin.usd) {
          // Beautify the Bitcoin price to 2 decimal places.
          const beautifiedPrice = beautifyPrice(data.bitcoin.usd, 2);

          // Update the state with the beautified Bitcoin price.
          setBitcoinPrices((prevPrices) => [
            {
              price: beautifiedPrice,
            },
            ...prevPrices,
          ]);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        // Handle the error as needed.
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus("Connection error");
    };

    return () => {
      eventSource.close(); // Close the EventSource when the component unmounts.
    };
  }, []);

  //Add logic to detect user activity (e.g., mousemove or other events).
  useEffect(() => {
    const handleUserActivity = () => {
      setActiveUser(true);
    };

    //Attach event listeners to detect user activity.
    window.addEventListener("mousemove", handleUserActivity);

    return () => {
      //Clean up event listeners when the component unmounts.
      window.removeEventListener("mousemove", handleUserActivity);
    };
  }, []);

  //CSS styles to center content both horizontally and vertically.
  const centerContentStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh", // 100% of viewport height
  };

  return (
    <div style={centerContentStyle}>
      <h2>Latest Price From CoinMarketCap</h2>
      <p>Connection status: {connectionStatus}</p>
      {activeUser ? (
        <div>
          <p>
            Latest Price BTC:{" "}
            {bitcoinPrices.length > 0 ? `$${bitcoinPrices[0].price}` : "N/A"}
          </p>
          {/* Previous Prices:  */}
          <ul style={{ listStyleType: "none" }}>
            {bitcoinPrices.slice(1).map((priceData, index) => (
              <li key={index}>Price: ${priceData.price}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>User is not active.</p>
      )}
    </div>
  );
};

export default LiveData;
