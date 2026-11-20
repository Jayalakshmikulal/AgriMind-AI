
import random
from datetime import datetime


def get_sensor_data():
    """
    Generate simulated environmental sensor readings.
    These values are for prototype testing only.
    """

    sensor_data = {
        "temperature": round(random.uniform(22, 38), 1),
        "humidity": round(random.uniform(40, 90), 1),
        "soil_moisture": round(random.uniform(20, 80), 1),
        "light_intensity": round(random.uniform(1000, 10000), 1),
        "source": "SIMULATED DATA",
        "timestamp": datetime.now().isoformat(timespec="seconds")
    }

    return sensor_data


def analyze_sensor_data(data):
    """
    Analyze environmental readings and return basic observations.
    """

    observations = []

    temperature = data["temperature"]
    humidity = data["humidity"]
    soil_moisture = data["soil_moisture"]
    light_intensity = data["light_intensity"]

    if temperature > 35:
        observations.append("High temperature detected.")
    elif temperature < 20:
        observations.append("Low temperature detected.")
    else:
        observations.append("Temperature is within the prototype's reference range.")

    if humidity > 85:
        observations.append("High humidity detected. Monitor for possible fungal disease conditions.")
    elif humidity < 40:
        observations.append("Low humidity detected.")
    else:
        observations.append("Humidity is within the prototype's reference range.")

    if soil_moisture < 30:
        observations.append("Low soil moisture. Check whether the crop needs irrigation.")
    elif soil_moisture > 70:
        observations.append("High soil moisture. Check for possible waterlogging.")
    else:
        observations.append("Soil moisture is within the prototype's reference range.")

    if light_intensity < 2000:
        observations.append("Low light intensity detected.")
    else:
        observations.append("Light intensity is adequate according to the prototype threshold.")

    return observations
