
def generate_spraying_zones(disease_result=None, field_id="FIELD-001"):
    """
    Generate precision spraying priority zones.

    This is a software simulation for field-zone planning.
    It does not control a real drone or recommend pesticide dosage.
    """

    zones = []

    # No disease result available
    if not disease_result:
        return {
            "success": False,
            "field_id": field_id,
            "message": "Disease screening result is required.",
            "zones": []
        }

    if not disease_result.get("success"):
        return {
            "success": False,
            "field_id": field_id,
            "message": "Disease screening was unsuccessful.",
            "zones": []
        }

    disease = disease_result.get("prediction", "Unknown")
    confidence = disease_result.get("confidence", 0)
    uncertain = disease_result.get("uncertain", True)

    # Do not create a spraying priority from uncertain results
    if uncertain or confidence < 55:
        return {
            "success": True,
            "field_id": field_id,
            "disease_detected": disease,
            "confidence": confidence,
            "status": "MANUAL INSPECTION REQUIRED",
            "zones": [],
            "message": (
                "The AI result is uncertain. "
                "Inspect the crop and obtain expert confirmation "
                "before planning any treatment."
            ),
            "human_approval_required": True
        }

    # Healthy classification
    if "healthy" in disease.lower():
        return {
            "success": True,
            "field_id": field_id,
            "disease_detected": disease,
            "confidence": confidence,
            "status": "NO DISEASE FLAG FROM IMAGE",
            "zones": [],
            "message": (
                "No disease was flagged in the uploaded image. "
                "Continue field monitoring."
            ),
            "human_approval_required": True
        }

    # Create a demonstration zone for a possible disease finding
    zones.append({
        "zone_id": "ZONE-001",
        "priority": "INSPECTION PRIORITY: HIGH",
        "detected_issue": disease,
        "ai_confidence": confidence,
        "recommended_action": (
            "Inspect this field area and collect additional leaf samples."
        ),
        "status": "PENDING HUMAN REVIEW"
    })

    return {
        "success": True,
        "field_id": field_id,
        "disease_detected": disease,
        "confidence": confidence,
        "status": "POTENTIAL AFFECTED ZONE IDENTIFIED",
        "zones": zones,
        "message": (
            "A potential affected zone has been identified from the "
            "uploaded image. Its actual field location must be verified."
        ),
        "human_approval_required": True,
        "automatic_spraying": False
    }
