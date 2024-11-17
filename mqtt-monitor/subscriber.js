import mqtt from "mqtt";
import { PinataSDK } from "pinata";
import { uploadSnapshot } from "./lib/pinata-helper.js";
import axios from "axios"; // Using axios for API requests
import 'dotenv/config';

const TOPICS = {
  RIPPLE_WATER: "ripple-water",
  RIPPLE_TEMPERATURE: "ripple-temperature",
  RIPPLE_SOLAR: "ripple-solar",
};

const topicBuffer = {
  [TOPICS.RIPPLE_WATER]: [],
  [TOPICS.RIPPLE_TEMPERATURE]: [],
  [TOPICS.RIPPLE_SOLAR]: [],
};

// Track the highest water flow and timestamp
let highestWaterFlow = 0;
let highestWaterFlowTimestamp = null;
const waterFlowThreshold = 1000; // Updated threshold to 1000 for high water flow
const highWaterDuration = 10 * 1000; // 10 seconds in milliseconds

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

const client = mqtt.connect(
  process.env.MQTT_CLIENT,
  {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    port: 8883,
  }
);

// Track the time of the last warning sent
let lastWarningTimestamp = 0;
const warningCooldown = 10 * 60 * 1000; // 10 minutes cooldown

// Function to send warning to the API
const sendWarningToAPI = async () => {
  const currentTime = new Date().getTime();

  // Log the current time and last warning timestamp for debugging
  console.log('Current time:', currentTime);
  console.log('Last warning timestamp:', lastWarningTimestamp);

  console.log(currentTime - lastWarningTimestamp)

  // Only send a warning if 10 minutes have passed since the last one
  if (currentTime - lastWarningTimestamp >= warningCooldown) {
    try {
      console.log('Sending warning to API...');
      const response = await axios.post('http://localhost:3000/api/warn-user', {
        message: 'Water flow has been the highest for the last 10 seconds!',
      });
      console.log('API response:', response.data);

      // Update the last warning timestamp after sending the warning
      lastWarningTimestamp = currentTime;
    } catch (error) {
      console.error('Error sending warning to API:', error);
    }
  } else {
    console.log('Warning cooldown active, skipping API call.');
  }
};


client.on("connect", () => {
  console.log("Connected to MQTT Broker Server.");
  for (let topic in TOPICS) {
    client.subscribe(TOPICS[topic], (err) => {
      console.log(`Connected to ${TOPICS[topic]}.`);
    });
  }
});

client.on("message", (topic, message) => {
  console.log(`Message received at ${topic} with message: ${message}`);

  // Parse the incoming message as JSON
  try {
    const parsedMessage = JSON.parse(message.toString());

    // Ensure that the message contains a sensorId and data
    if (parsedMessage.sensorId && parsedMessage.data) {
      // For water flow, track the highest flow
      if (topic === TOPICS.RIPPLE_WATER) {
        const currentWaterFlow = parsedMessage.data;

        if (currentWaterFlow > highestWaterFlow) {
          highestWaterFlow = currentWaterFlow;
          highestWaterFlowTimestamp = new Date().getTime();
        } else if (
          new Date().getTime() - highestWaterFlowTimestamp >= highWaterDuration &&
          currentWaterFlow >= waterFlowThreshold
        ) {
          // If water flow has been the highest for 10 seconds, call the API
          sendWarningToAPI();
        }
      }

      // Push the parsed data to the corresponding topic buffer
      topicBuffer[topic].push({
        sensorId: parsedMessage.sensorId,
        timestamp: new Date().toISOString(),
        data: parsedMessage.data,
      });
    } else {
      console.log("Invalid message format, missing sensorId or data.");
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
});

client.on("error", (error) => {
  console.log("MQTT Connection Error: ", error);
});

setInterval(() => {
  // Prepare snapshot data with structured data from all topics
  const snapshotData = {
    water: topicBuffer[TOPICS.RIPPLE_WATER],
    temperature: topicBuffer[TOPICS.RIPPLE_TEMPERATURE],
    solar: topicBuffer[TOPICS.RIPPLE_SOLAR],
  };

  // Clear topic data after snapshot to free up memory
  for (let topic in topicBuffer) {
    topicBuffer[topic] = [];
  }

  uploadSnapshot(pinata, snapshotData);
}, 10 * 1000); // 10 seconds = 10000 ms
