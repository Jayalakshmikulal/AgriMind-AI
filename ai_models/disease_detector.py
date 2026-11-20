
from functools import lru_cache

import torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageClassification

MODEL_ID = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

DEVICE = torch.device("cpu")
CONFIDENCE_THRESHOLD = 55

SUPPORTED_CROPS = (
    "Apple", "Bell Pepper", "Blueberry", "Cherry", "Corn", "Grape",
    "Orange", "Peach", "Potato", "Raspberry", "Soybean", "Squash",
    "Strawberry", "Tomato",
)

image_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.5, 0.5, 0.5],
        std=[0.5, 0.5, 0.5],
    ),
])


@lru_cache(maxsize=1)
def load_model():
    print("Loading AgriMind AI disease model...")
    model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
    model.to(DEVICE)
    model.eval()
    print("Disease detection model loaded successfully.")
    return model


def get_disease_information(label):
    """Return cautious, general guidance for a model class label."""

    normalized = label.replace("___", " ").replace("_", " ").casefold()

    if "healthy" in normalized:
        return {
            "type": "healthy",
            "title": "No disease pattern detected",
            "explanation": (
                "The uploaded leaf appears similar to the healthy-leaf "
                "class recognised by the model. This does not guarantee "
                "that the entire plant is disease-free."
            ),
            "symptoms": [
                "No specific disease pattern was identified by this screening result."
            ],
            "possible_causes": [],
            "next_steps": [
                "Continue checking leaves and stems regularly.",
                "Look at both sides of the leaves for spots, insects or unusual colour changes.",
                "Maintain suitable watering and field hygiene.",
            ],
        }

    disease_guidance = {
        "apple scab": {
            "title": "Apple Scab",
            "explanation": (
                "Apple scab is a fungal disease that can affect apple leaves "
                "and fruit. It may reduce leaf health and fruit quality."
            ),
            "symptoms": [
                "Olive-green to dark spots on leaves.",
                "Spots may become darker or velvety.",
                "Affected leaves may yellow or fall early.",
            ],
            "possible_causes": [
                "The disease is associated with the fungus Venturia inaequalis.",
                "Wet leaves and humid conditions can favour infection.",
            ],
            "next_steps": [
                "Remove fallen infected leaves where practical.",
                "Improve airflow by maintaining suitable spacing and pruning.",
                "Avoid keeping foliage wet for long periods.",
                "Ask a local agricultural expert to confirm the disease before treatment.",
            ],
        },
        "black rot": {
            "title": "Black Rot",
            "explanation": (
                "Black rot is a plant disease name used for several crop-specific "
                "problems. The exact cause depends on the crop and the symptoms."
            ),
            "symptoms": [
                "Dark or brown affected areas may appear on plant tissue.",
                "Some infections can cause leaf spots or tissue damage.",
            ],
            "possible_causes": [
                "The cause is crop-dependent and cannot be confirmed from this label alone."
            ],
            "next_steps": [
                "Inspect the whole plant, including stems and fruit.",
                "Remove badly affected plant material where appropriate.",
                "Avoid overhead watering when possible.",
                "Seek crop-specific confirmation from an agricultural expert.",
            ],
        },
        "early blight": {
            "title": "Early Blight",
            "explanation": (
                "Early blight commonly affects tomato and potato plants. "
                "It can cause leaf spots and reduce healthy leaf area."
            ),
            "symptoms": [
                "Brown spots that may show concentric ring patterns.",
                "Yellowing around affected areas.",
                "Older leaves may be affected first.",
            ],
            "possible_causes": [
                "Often associated with the fungus Alternaria solani.",
                "Warm, humid conditions and prolonged leaf wetness can favour disease development.",
            ],
            "next_steps": [
                "Remove badly affected leaves where practical.",
                "Avoid splashing soil onto leaves during watering.",
                "Keep suitable spacing for airflow.",
                "Confirm the disease locally before choosing a treatment.",
            ],
        },
        "late blight": {
            "title": "Late Blight",
            "explanation": (
                "Late blight is a potentially serious disease of potato and tomato. "
                "It can spread quickly under favourable cool and wet conditions."
            ),
            "symptoms": [
                "Water-soaked-looking patches on leaves.",
                "Brown or dark lesions that may expand quickly.",
                "In humid conditions, pale growth may appear near affected areas.",
            ],
            "possible_causes": [
                "Associated with the pathogen Phytophthora infestans.",
                "Cool, wet weather can favour its spread.",
            ],
            "next_steps": [
                "Inspect nearby plants for similar symptoms.",
                "Avoid handling wet plants and spreading plant material between areas.",
                "Remove severely affected material safely where recommended locally.",
                "Contact an agricultural expert promptly for confirmation and advice.",
            ],
        },
        "leaf mold": {
            "title": "Leaf Mold",
            "explanation": (
                "Leaf mold is a disease that commonly affects tomato leaves, "
                "especially in humid growing conditions."
            ),
            "symptoms": [
                "Pale yellow patches on the upper leaf surface.",
                "Olive-green or greyish growth may appear underneath leaves.",
                "Affected leaves may curl or dry.",
            ],
            "possible_causes": [
                "Often associated with the fungus Passalora fulva.",
                "High humidity and poor airflow can favour development.",
            ],
            "next_steps": [
                "Improve airflow around plants.",
                "Avoid excessive moisture on foliage.",
                "Remove badly affected leaves where practical.",
                "Confirm the cause before treatment.",
            ],
        },
        "powdery mildew": {
            "title": "Powdery Mildew",
            "explanation": (
                "Powdery mildew is a fungal disease that can affect leaves "
                "and other green plant parts."
            ),
            "symptoms": [
                "White or grey powder-like patches on leaves.",
                "Leaf curling or yellowing may occur.",
                "Severely affected leaves may dry.",
            ],
            "possible_causes": [
                "Different powdery mildew fungi affect different crops.",
                "The disease can develop under favourable humidity and airflow conditions.",
            ],
            "next_steps": [
                "Check both sides of the leaves.",
                "Remove severely affected leaves where practical.",
                "Maintain suitable plant spacing and airflow.",
                "Get crop-specific advice before treatment.",
            ],
        },
        "rust": {
            "title": "Rust Disease",
            "explanation": (
                "Rust diseases are fungal infections that can produce "
                "rust-coloured spots or pustules on leaves."
            ),
            "symptoms": [
                "Orange, yellow, brown or reddish raised spots.",
                "Pustules may appear on the underside of leaves.",
                "Leaves may yellow or dry in severe cases.",
            ],
            "possible_causes": [
                "Rust fungi infect specific host plants.",
                "Moist conditions can favour infection for some rust diseases.",
            ],
            "next_steps": [
                "Inspect the underside of leaves carefully.",
                "Remove severely affected leaves where practical.",
                "Avoid moving infected plant material between fields.",
                "Ask an agricultural expert to identify the specific rust disease.",
            ],
        },
        "bacterial spot": {
            "title": "Bacterial Spot",
            "explanation": (
                "Bacterial spot can affect leaves and fruit of some crops, "
                "including pepper and tomato."
            ),
            "symptoms": [
                "Small dark or water-soaked-looking leaf spots.",
                "Spots may develop yellow edges.",
                "Affected tissue may dry or fall out.",
            ],
            "possible_causes": [
                "Associated with bacterial pathogens.",
                "Water splash and wet foliage can help spread some bacterial infections.",
            ],
            "next_steps": [
                "Avoid working with plants while foliage is wet.",
                "Use clean tools and avoid moving infected plant material.",
                "Remove badly affected material where appropriate.",
                "Seek local confirmation before treatment.",
            ],
        },
        "leaf scorch": {
            "title": "Leaf Scorch",
            "explanation": (
                "Leaf scorch describes damage that causes leaf edges or "
                "surfaces to look dry or burnt. It can have several causes."
            ),
            "symptoms": [
                "Brown or dry leaf edges.",
                "Yellowing or browning of leaf tissue.",
                "Affected leaves may curl or become brittle.",
            ],
            "possible_causes": [
                "Possible factors include water stress, heat, salts or disease.",
                "An image alone cannot establish the exact cause.",
            ],
            "next_steps": [
                "Check soil moisture and recent watering.",
                "Look for damage on other leaves and nearby plants.",
                "Review recent heat or fertiliser exposure.",
                "Get local advice if symptoms continue to spread.",
            ],
        },
    }

    for keyword, information in disease_guidance.items():
        if keyword in normalized:
            return {
                "type": "disease",
                **information,
            }

    return {
        "type": "unknown",
        "title": "Possible plant health issue",
        "explanation": (
            "The model selected this disease class, but AgriMind does not "
            "have a verified crop-specific explanation for this label yet."
        ),
        "symptoms": [
            "Compare the visible leaf pattern with the model's predicted class.",
            "Check other leaves and nearby plants for similar symptoms.",
        ],
        "possible_causes": [
            "The exact cause cannot be established from this prediction alone."
        ],
        "next_steps": [
            "Take clear photographs of the whole plant and affected leaves.",
            "Check both sides of the leaves.",
            "Consult a local agricultural expert before treatment.",
        ],
    }


def predict_disease(image: Image.Image, crop: str):
    if image is None:
        raise ValueError("No image was provided.")

    if not isinstance(image, Image.Image):
        raise TypeError("Input must be a PIL image.")

    if not isinstance(crop, str) or not crop.strip():
        raise ValueError("Please select a crop.")

    selected_crop = next(
        (
            supported
            for supported in SUPPORTED_CROPS
            if supported.casefold() == crop.strip().casefold()
        ),
        None,
    )

    if selected_crop is None:
        raise ValueError(
            "This crop is not supported by the current screening model."
        )

    image = image.convert("RGB")
    width, height = image.size

    if width < 64 or height < 64:
        raise ValueError("Please upload a clearer leaf image.")

    model = load_model()
    input_tensor = image_transform(image).unsqueeze(0).to(DEVICE)

    with torch.inference_mode():
        outputs = model(pixel_values=input_tensor)
        probabilities = torch.softmax(outputs.logits, dim=-1)[0]

    top_values, top_indices = torch.topk(
        probabilities,
        k=min(3, probabilities.shape[0]),
    )

    id2label = model.config.id2label
    predictions = []

    for score, index in zip(top_values, top_indices):
        label = id2label.get(
            str(index.item()),
            id2label.get(index.item(), "Unknown"),
        )
        predictions.append({
            "disease": label,
            "confidence": round(score.item() * 100, 2),
        })

    best_prediction = predictions[0]
    confidence = best_prediction["confidence"]
    predicted_label = best_prediction["disease"].casefold()

    prediction_crop = next(
        (
            supported
            for supported in SUPPORTED_CROPS
            if predicted_label.startswith(supported.casefold())
            or (
                predicted_label.startswith("healthy ")
                and supported.casefold() in predicted_label
            )
        ),
        None,
    )

    crop_matches = prediction_crop == selected_crop

    if not crop_matches:
        return {
            "success": True,
            "prediction": "Unable to confirm the selected crop",
            "selected_crop": selected_crop,
            "crop_match": False,
            "confidence": confidence,
            "uncertain": True,
            "top_predictions": [],
            "disease_info": None,
            "warning": (
                f"The strongest model class was for "
                f"{prediction_crop or 'another crop'}, not {selected_crop}. "
                "No disease label is shown. Check the crop selection and "
                "consult an agricultural expert."
            ),
        }

    disease_info = get_disease_information(best_prediction["disease"])
    uncertain = confidence < CONFIDENCE_THRESHOLD

    return {
        "success": True,
        "prediction": best_prediction["disease"],
        "selected_crop": selected_crop,
        "crop_match": True,
        "confidence": confidence,
        "uncertain": uncertain,
        "top_predictions": predictions,
        "disease_info": disease_info,
        "warning": (
            "Low-confidence result. This prediction is uncertain. "
            "Upload a clearer leaf image or consult an agricultural expert."
            if uncertain
            else (
                "AI screening only, not a confirmed diagnosis. "
                "The model covers 38 PlantVillage classes; field images "
                "and unsupported crops may be misclassified."
            )
        ),
    }
