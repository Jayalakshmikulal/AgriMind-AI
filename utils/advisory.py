
def generate_advisory(sensor_data=None, disease_result=None):
    """
    Generate farmer-friendly advisory suggestions
    using environmental readings and AI disease screening.

    This is a prototype rule-based advisory system.
    """

    recommendations = []
    alerts = []

    # 1. Analyze environmental sensor readings
    if sensor_data:

        temperature = sensor_data.get("temperature")
        humidity = sensor_data.get("humidity")
        soil_moisture = sensor_data.get("soil_moisture")
        light_intensity = sensor_data.get("light_intensity")

        if temperature is not None:
            if temperature > 35:
                alerts.append("High temperature detected.")
                recommendations.append(
                    "Monitor the crop for heat stress and check irrigation needs."
                )
            elif temperature < 20:
                alerts.append("Low temperature detected.")
                recommendations.append(
                    "Monitor the crop for possible cold-related stress."
                )

        if humidity is not None:
            if humidity > 85:
                alerts.append("High humidity detected.")
                recommendations.append(
                    "Monitor leaves for fungal symptoms and maintain suitable airflow where possible."
                )
            elif humidity < 40:
                alerts.append("Low humidity detected.")
                recommendations.append(
                    "Check whether the crop is experiencing moisture stress."
                )

        if soil_moisture is not None:
            if soil_moisture < 30:
                alerts.append("Low soil moisture detected.")
                recommendations.append(
                    "Check soil conditions and irrigation requirements before watering."
                )
            elif soil_moisture > 70:
                alerts.append("High soil moisture detected.")
                recommendations.append(
                    "Check for waterlogging and ensure proper field drainage."
                )

        if light_intensity is not None:
            if light_intensity < 2000:
                alerts.append("Low light intensity detected.")
                recommendations.append(
                    "Check whether nearby objects or structures are blocking sunlight."
                )

    # 2. Analyze AI disease screening result
    if disease_result:

        if disease_result.get("success"):

            disease = disease_result.get("prediction", "Unknown")
            confidence = disease_result.get("confidence", 0)
            uncertain = disease_result.get("uncertain", True)

            if uncertain:
                alerts.append(
                    "Disease screening result has low confidence."
                )
                recommendations.append(
                    "Upload a clearer leaf image and consult an agricultural expert."
                )

            elif "healthy" in disease.lower():
                recommendations.append(
                    "The uploaded image was classified as healthy. "
                    "Continue regular crop monitoring."
                )

            else:
                alerts.append(
                    f"Possible disease identified: {disease}."
                )
                recommendations.append(
                    "Inspect nearby plants for similar symptoms and seek expert confirmation before treatment."
                )

        else:
            recommendations.append(
                "Disease screening was unsuccessful. Try uploading another clear leaf image."
            )

    # 3. General advisory
    if not recommendations:
        recommendations.append(
            "No major issues were identified by the available prototype checks. "
            "Continue regular crop monitoring."
        )

    return {
        "success": True,
        "advisory_type": "RULE-BASED AI PROTOTYPE",
        "alerts": alerts,
        "recommendations": recommendations,
        "notice": (
            "These are preliminary suggestions based on available inputs, "
            "not confirmed diagnoses or pesticide instructions."
        )
    }
