import json
import random
import time
import serial
from paho.mqtt import client as mqtt_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MQTT broker settings from .env
broker = os.getenv("BROKER")
port = int(os.getenv("PORT"))
username = os.getenv("USERNAME")
password = os.getenv("PASSWORD")

# Define the topics
TOPICS = {
    "RIPPLE_WATER": "ripple-water",
    "RIPPLE_TEMPERATURE": "ripple-temperature",
    "RIPPLE_SOLAR": "ripple-solar",
}

# Set up serial communication
ser = serial.Serial("/dev/cu.usbmodem1201", 9600, timeout=1)

# MQTT client settings
client_id = f'publish-{random.randint(0, 1000)}'

def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect, return code {rc}")
    
    client = mqtt_client.Client(client_id)
    client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.tls_set()  # Enable TLS/SSL
    client.tls_insecure_set(True)  # Allow insecure certificates if needed
    client.connect(broker, port)
    return client

def publish(client, water_data, temperature_data):
    client.publish(TOPICS['RIPPLE_WATER'], payload=water_data, qos=0)
    print(f"Published to {TOPICS['RIPPLE_WATER']}: {water_data}")
    
    client.publish(TOPICS["RIPPLE_TEMPERATURE"], payload=temperature_data, qos=0)
    print(f"Published to {TOPICS['RIPPLE_TEMPERATURE']}: {temperature_data}")

def run():
    # Connect to the MQTT broker
    client = connect_mqtt()
    client.loop_start()
    
    # Wait for connection confirmation
    time.sleep(2)
    
    while True:
        if ser.isOpen():
            input_data = ser.readline().strip().decode("utf-8")
            
            # Skip empty data
            if input_data == "":
                continue
            
            # Print the input data (for debugging or logging)
            print(f"Serial input: {input_data}")
            
            # Split the input data into parts assuming the format is 'data:data:data'
            parts = input_data.split(":")
            
            if len(parts) == 2:
                water_data = parts[0]
                temperature_data = parts[1]
                
                water_data = {
                    "sensorId": 1,
                    "data": water_data,
                }
                
                temperature_data = {
                    "sensorId": 1,
                    "data": temperature_data,
                }
                
                # Publish serial data to MQTT
                publish(client, json.dumps(water_data), json.dumps(temperature_data))
            else:
                print(f"Invalid data format: {input_data}. Expected format: data:data")
        

    client.loop_stop()

if __name__ == '__main__':
    run()
