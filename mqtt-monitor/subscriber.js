import mqtt from "mqtt";
import { PinataSDK } from "pinata";
import { uploadSnapshot } from "./lib/pinata-helper.js";
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
      // Push the parsed data along with the sensorId to the corresponding topic buffer
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
}, 2 * 60 * 1000); // 2 minutes = 120000 ms