## Inspiration
After conducting research on the primary expenses faced by property managers, we identified faulty water gauges as a significant issue. Property managers often depend on tenants to report problems or must coordinate inconvenient check-ins to identify issues. To address this, we developed an intuitive web application designed to streamline the process, allowing property managers to proactively manage water usage without awkward tenant interactions. At the same time, tenants gain an engaging, community-focused experience that promotes sustainability. Drawing inspiration from the popularity of visually appealing and personalized data presentations, we aimed to create a solution that’s both practical and fun—combining functionality with a touch of a "Spotify Wrapped" vibe to make data meaningful and enjoyable.

## What It Does
Our tool uses smart gauge sensors to monitor water temperature and flow, providing real-time insights into usage. It aggregates data over time, compares it to global benchmarks, and uses AI to offer personalized water-saving recommendations. Property managers can proactively address inefficiencies, while tenants receive automated email alerts if their usage exceeds the average. With an optional community-sharing feature and engaging, user-friendly visuals, the platform promotes accountability, sustainability, and collaboration.

## How We Built It
- **Hardware**: We used the IoT Grove Kit (specifically the temperature sensor, potentiometer, and an LCD) as our smart gauge sensor to gather data, which is sent to a webpage via serial communication.
- **Software**: 
  - Python, Node.js, and Gemini were used for data aggregation and processing.
  - Pinata and Next.js were used to deliver personalized recommendations based on the tenant’s sensor data and to create engaging, visually appealing data plots.

## Challenges We Ran Into
- Initially planning to use a Wi-Fi module, we faced difficulties establishing a stable connection.
- Spent 3 hours troubleshooting the LCD, only to discover it was incompatible with the Arduino board and the Grove Kit.
- The 3D printed enclosure didn’t fit all components, requiring improvisation.

## Accomplishments That We're Proud Of
- Overcoming hardware and connectivity issues to integrate sensors and present data effectively.
- Creating a solution that incorporates community-building features, combining software, hardware, and data visualization to promote sustainability.

## What We Learned
- Gained hands-on experience working with Wi-Fi modules and troubleshooting connectivity issues.
- Learned the importance of planning for component clearance when designing hardware enclosures.
- Developed skills in debugging IoT devices and integrating them into a functioning system.

## What's Next for Eco Fast Track
- We plan to incorporate renewable solutions such as solar power to reduce electricity consumption by maximizing natural lighting.
- We also aim to implement features to detect pressure drops in water systems, which could indicate leaks, and monitor pressure spikes caused by freezing expansion.

## How to Run the Project

### Prerequisites
1. **Arduino Board**: Connect your Arduino board to your PC. 
2. **IoT Grove Kit**: Make sure your sensors (temperature, potentiometer, and LCD) are properly connected to the Arduino.
3. **Software**: You will need to run the following components:
   - **Arduino Code**: The Arduino sketch must be loaded onto the board. This code will read data from the IoT sensors and send it over serial to the PC.
   - **Publisher & Subscriber**: These should be set up in Python or Node.js to handle data transmission between the Arduino and the web app.
   - **Web App**: The web app, built with Next.js, will visualize the data and offer personalized recommendations. It needs to run locally.
   - **HiveMQ Account**: To manage the MQTT protocol used for communication between the publisher, subscriber, and the web app, you'll need a **HiveMQ** account.

### Steps to Run the Project
1. **Set Up HiveMQ Account**:
   - Go to [HiveMQ](https://www.hivemq.com/) and create a free account.
   - After signing up, create an MQTT broker and obtain the connection credentials (host, port, username, password) for the MQTT connection. These will be used in the publisher and subscriber code.

2. **Load the Arduino Code**:
   - Connect the Arduino to your PC and load the provided Arduino code to read data from the IoT sensors.
   - Ensure the Arduino is properly communicating via serial to your PC.

3. **Run the Publisher & Subscriber**:
   - In the publisher code (Python or Node.js), use the MQTT credentials you obtained from HiveMQ to send sensor data to the cloud.
   - In the subscriber code, use the same credentials to subscribe to the MQTT topics and listen for incoming data from the publisher.
   
4. **Run the Web App**:
   - Navigate to the project directory in your terminal.
   - Install dependencies using `npm install` (for Next.js).
   - Start the web app using `npm run dev`.
   - Open a browser and go to `http://localhost:3000` to view the web app.

5. **Make sure the Arduino is connected**:
   - The Arduino should remain connected to your PC for the entire process to ensure data is transmitted to the web app in real-time.

### Conclusion
With the system up and running, property managers can monitor water usage in real-time, while tenants can receive personalized recommendations and participate in a community-driven approach to sustainability.
