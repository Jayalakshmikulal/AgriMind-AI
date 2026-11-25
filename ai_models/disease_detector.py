"""
AgriMind AI - Plant Disease Detection
41 crop-specific ConvNeXt models + MobileNetV2 fallback.

Supported crops: 45
ConvNeXt models: 41
MobileNet-only crops: 4
"""

from functools import lru_cache
import re

import torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageClassification


# =========================================================
# CONFIGURATION
# =========================================================

MOBILENET_MODEL_ID = (
    "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
)

DEVICE = torch.device("cpu")

MOBILENET_CONFIDENCE_THRESHOLD = 55
CONVNEXT_CONFIDENCE_THRESHOLD = 45

SUPPORTED_CROPS = (
    "Apple",
    "Apricot",
    "Banana",
    "Bell Pepper",
    "Betel",
    "Bitter Gourd",
    "Black Pepper",
    "Blueberry",
    "Bottle Gourd",
    "Brinjal",
    "Cashew",
    "Cassava",
    "Cherry",
    "Chrysanthemum",
    "Coconut",
    "Coffee",
    "Corn",
    "Cucumber",
    "Cucurbit",
    "Custard Apple",
    "Fig",
    "Grape",
    "Guava",
    "Loquat",
    "Mango",
    "Okra",
    "Orange",
    "Papaya",
    "Peach",
    "Pear",
    "Pomegranate",
    "Potato",
    "Raspberry",
    "Rice",
    "Ridge Gourd",
    "Rose",
    "Snake Gourd",
    "Soybean",
    "Squash",
    "Strawberry",
    "Sugarcane",
    "Tea",
    "Tomato",
    "Walnut",
    "Watermelon",
)


# =========================================================
# CONVNEXT MODEL REGISTRY
# =========================================================

CONVNEXT_MODELS = {
    "Apple": "ixrbhii/apple-disease-convnext",
    "Apricot": "ixrbhii/apricot-disease-convnext",
    "Banana": "ixrbhii/banana-disease-convnext",
    "Betel": "ixrbhii/betel-disease-convnext",
    "Bitter Gourd": "ixrbhii/bitter-gourd-disease-convnext",
    "Black Pepper": "ixrbhii/black-pepper-disease-convnext",
    "Bottle Gourd": "ixrbhii/bottle-gourd-disease-convnext",
    "Brinjal": "ixrbhii/brinjal-disease-convnext",
    "Cashew": "ixrbhii/cashew-disease-convnext",
    "Cassava": "ixrbhii/cassava-disease-convnext",
    "Cherry": "ixrbhii/cherry-disease-convnext",
    "Chrysanthemum": "ixrbhii/chrysanthemum-disease-convnext",
    "Orange": "ixrbhii/citrus-disease-convnext",
    "Coconut": "ixrbhii/coconut-disease-convnext",
    "Coffee": "ixrbhii/coffee-disease-convnext",
    "Cucumber": "ixrbhii/cucumber-disease-convnext",
    "Cucurbit": "ixrbhii/cucurbit-disease-convnext",
    "Custard Apple": "ixrbhii/custard-apple-disease-convnext",
    "Fig": "ixrbhii/fig-disease-convnext",
    "Grape": "ixrbhii/grape-disease-convnext",
    "Guava": "ixrbhii/guava-disease-convnext",
    "Loquat": "ixrbhii/loquat-disease-convnext",
    "Corn": "ixrbhii/maize-disease-convnext",
    "Mango": "ixrbhii/mango-disease-convnext",
    "Okra": "ixrbhii/okra-disease-convnext",
    "Papaya": "ixrbhii/papaya-disease-convnext",
    "Peach": "ixrbhii/peach-disease-convnext",
    "Pear": "ixrbhii/pear-disease-convnext",
    "Pomegranate": "ixrbhii/pomegranate-disease-convnext",
    "Potato": "ixrbhii/potato-disease-convnext",
    "Rice": "ixrbhii/rice-disease-convnext",
    "Ridge Gourd": "ixrbhii/ridge-gourd-disease-convnext",
    "Rose": "ixrbhii/rose-disease-convnext",
    "Snake Gourd": "ixrbhii/snake-gourd-disease-convnext",
    "Soybean": "ixrbhii/soybean-disease-convnext",
    "Strawberry": "ixrbhii/strawberry-disease-convnext",
    "Sugarcane": "ixrbhii/sugarcane-disease-convnext",
    "Tea": "ixrbhii/tea-disease-convnext",
    "Tomato": "ixrbhii/tomato-disease-convnext",
    "Walnut": "ixrbhii/walnut-disease-convnext",
    "Watermelon": "ixrbhii/watermelon-disease-convnext",
}

MOBILENET_ONLY_CROPS = {
    "Bell Pepper",
    "Blueberry",
    "Raspberry",
    "Squash",
}


# Validate registry configuration when the module is imported.
if len(SUPPORTED_CROPS) != 45:
    raise RuntimeError("AgriMind crop registry should contain 45 crops.")

if len(CONVNEXT_MODELS) != 41:
    raise RuntimeError("AgriMind ConvNeXt registry should contain 41 models.")

if set(CONVNEXT_MODELS) | MOBILENET_ONLY_CROPS != set(SUPPORTED_CROPS):
    raise RuntimeError(
        "Crop configuration error: every supported crop must have "
        "either a ConvNeXt model or a MobileNet-only configuration."
    )

if set(CONVNEXT_MODELS) & MOBILENET_ONLY_CROPS:
    raise RuntimeError("A crop cannot be in both model groups.")


# =========================================================
# MOBILENET IMAGE TRANSFORM
# =========================================================

mobilenet_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.5, 0.5, 0.5],
        std=[0.5, 0.5, 0.5],
    ),
])


# =========================================================
# LABEL NORMALIZATION
# =========================================================

def normalize_disease_label(label: str):
    """
    Normalize model labels into comparable text.

    Example:
    Tomato___Early_blight -> tomato early blight
    Pepper,_bell___Bacterial_spot -> pepper bell bacterial spot
    """

    label = str(label).replace("___", " ")
    label = re.sub(r"[^a-zA-Z0-9]+", " ", label)
    label = re.sub(r"\s+", " ", label)

    return label.strip().casefold()


# =========================================================
# MOBILENET MODEL LOADING
# =========================================================

@lru_cache(maxsize=1)
def load_model():
    print("Loading AgriMind MobileNetV2 model...")

    model = AutoModelForImageClassification.from_pretrained(
        MOBILENET_MODEL_ID
    )

    model.to(DEVICE)
    model.eval()

    print("MobileNetV2 loaded successfully.")

    return model


# =========================================================
# CONVNEXT MODEL LOADING
# =========================================================

@lru_cache(maxsize=2)
def load_convnext_model(crop: str):
    """
    Load a crop-specific ConvNeXt model.

    Models are cached to avoid repeatedly downloading weights.
    Only two models are kept in the cache at a time to reduce
    CPU memory usage.
    """

    import timm

    if crop not in CONVNEXT_MODELS:
        raise ValueError(
            f"No ConvNeXt model is registered for {crop}."
        )

    model_id = CONVNEXT_MODELS[crop]

    print(f"Loading ConvNeXt model for {crop}...")
    print(f"Model ID: {model_id}")

    try:
        model = timm.create_model(
            f"hf-hub:{model_id}",
            pretrained=True,
        )

        model.to(DEVICE)
        model.eval()

        config = timm.data.resolve_data_config(
            {},
            model=model,
        )

        image_transform = timm.data.create_transform(
            **config,
            is_training=False,
        )

        labels = model.pretrained_cfg.get("label_names")

        if not labels:
            raise RuntimeError(
                f"Class labels are missing for {model_id}."
            )

        labels = list(labels)

        if len(labels) != model.num_classes:
            raise RuntimeError(
                f"Label count mismatch for {model_id}: "
                f"{len(labels)} labels, "
                f"{model.num_classes} model outputs."
            )

        print(
            f"ConvNeXt loaded successfully: {crop} "
            f"({len(labels)} classes)"
        )

        return model, image_transform, labels

    except Exception as exc:
        raise RuntimeError(
            f"Could not load ConvNeXt model for {crop} "
            f"({model_id}): {exc}"
        ) from exc


# =========================================================
# CONVNEXT PREDICTION
# =========================================================

def predict_with_convnext(image: Image.Image, crop: str):
    model, image_transform, labels = load_convnext_model(crop)

    input_tensor = (
        image_transform(image)
        .unsqueeze(0)
        .to(DEVICE)
    )

    with torch.inference_mode():
        outputs = model(input_tensor)

        if not isinstance(outputs, torch.Tensor):
            raise RuntimeError(
                f"Unexpected output format from {crop} model."
            )

        probabilities = torch.softmax(outputs, dim=-1)[0]

    top_values, top_indices = torch.topk(
        probabilities,
        k=min(3, probabilities.shape[0]),
    )

    predictions = []

    for score, index in zip(top_values, top_indices):
        label = labels[index.item()]

        predictions.append({
            "disease": str(label),
            "confidence": round(score.item() * 100, 2),
        })

    if not predictions:
        raise RuntimeError(
            f"No predictions were returned for {crop}."
        )

    return {
        "available": True,
        "model": CONVNEXT_MODELS[crop],
        "prediction": predictions[0]["disease"],
        "confidence": predictions[0]["confidence"],
        "top_predictions": predictions,
    }


# =========================================================
# MOBILENET PREDICTION
# =========================================================

def predict_with_mobilenet(image: Image.Image):
    model = load_model()

    input_tensor = (
        mobilenet_transform(image)
        .unsqueeze(0)
        .to(DEVICE)
    )

    # Run inference
    with torch.inference_mode():
        outputs = model(pixel_values=input_tensor)

        probabilities = torch.softmax(
            outputs.logits,
            dim=-1,
        )[0]

    # Get top 3 predictions
    top_values, top_indices = torch.topk(
        probabilities,
        k=min(3, probabilities.shape[0]),
    )

    id2label = model.config.id2label

    predictions = []

    for score, index in zip(top_values, top_indices):
        class_index = index.item()

        label = id2label.get(
            str(class_index),
            id2label.get(class_index, "Unknown"),
        )

        predictions.append({
            "disease": str(label),
            "confidence": round(score.item() * 100, 2),
        })

    return predictions


# =========================================================
# MODEL PREDICTION COMPARISON
# =========================================================

def compare_model_predictions(mobilenet_label, convnext_label):
    mobile_normalized = normalize_disease_label(
        mobilenet_label
    )

    convnext_normalized = normalize_disease_label(
        convnext_label
    )

    agreement = mobile_normalized == convnext_normalized

    return {
        "agreement": agreement,
        "status": (
            "same_disease"
            if agreement
            else "different_predictions"
        ),
    }


# =========================================================
# DISEASE INFORMATION
# =========================================================

def get_disease_information(label):
    """Return cautious, general guidance for a model class label."""

    normalized = normalize_disease_label(label)

    if "healthy" in normalized:
        return {
            "type": "healthy",
            "title": "No disease pattern detected",
            "explanation": (
                "The uploaded leaf appears similar to the healthy class "
                "recognised by the model. This does not guarantee that "
                "the entire plant is disease-free."
            ),
            "symptoms": [
                "No specific disease pattern was identified by this screening result."
            ],
            "possible_causes": [],
            "next_steps": [
                "Continue checking leaves and stems regularly.",
                "Inspect both sides of leaves for spots, insects or unusual colour changes.",
                "Maintain suitable watering and field hygiene.",
            ],
        }

    disease_guidance = {
        "apple scab": (
            "Apple Scab",
            "Olive-green to dark spots may develop on leaves and fruit.",
            "Associated with Venturia inaequalis. Wet foliage can favour infection.",
        ),
        "black rot": (
            "Black Rot",
            "Dark or brown affected areas may appear on plant tissue.",
            "The exact cause depends on the crop and symptoms.",
        ),
        "early blight": (
            "Early Blight",
            "Brown spots may show concentric rings, often with yellowing around them.",
            "Often associated with Alternaria solani and prolonged leaf wetness.",
        ),
        "late blight": (
            "Late Blight",
            "Water-soaked-looking patches and expanding dark lesions may appear.",
            "Associated with Phytophthora infestans. Cool, wet conditions favour spread.",
        ),
        "leaf mold": (
            "Leaf Mold",
            "Pale yellow patches may appear above leaves, with olive-grey growth underneath.",
            "Often associated with Passalora fulva and high humidity.",
        ),
        "powdery mildew": (
            "Powdery Mildew",
            "White or grey powder-like patches may appear on leaves.",
            "Different powdery mildew fungi affect different crops.",
        ),
        "rust": (
            "Rust Disease",
            "Orange, yellow, brown or reddish raised spots may appear on leaves.",
            "Rust fungi infect specific host plants. Moist conditions may favour infection.",
        ),
        "bacterial spot": (
            "Bacterial Spot",
            "Small dark or water-soaked-looking leaf spots may develop yellow edges.",
            "Bacterial pathogens can spread through water splash and wet foliage.",
        ),
        "leaf scorch": (
            "Leaf Scorch",
            "Brown or dry leaf edges, yellowing and brittle tissue may occur.",
            "Possible causes include water stress, heat, salts or disease.",
        ),
        "fusarium": (
            "Fusarium Disease",
            "Yellowing, wilting or discolouration may occur, depending on the crop.",
            "Some Fusarium species cause vascular or root diseases.",
        ),
        "mosaic virus": (
            "Mosaic Virus",
            "Leaves may show mottled light and dark green patterns or distortion.",
            "Several plant viruses can cause mosaic symptoms.",
        ),
        "leaf curl": (
            "Leaf Curl",
            "Leaves may curl, twist, become distorted or show yellowing.",
            "Possible causes include viruses, pests and environmental stress.",
        ),
        "anthracnose": (
            "Anthracnose",
            "Dark lesions may appear on leaves, stems or fruit.",
            "Anthracnose diseases are commonly associated with Colletotrichum fungi.",
        ),
        "septoria": (
            "Septoria Leaf Spot",
            "Small circular spots may develop, sometimes with dark margins.",
            "Some Septoria species cause leaf-spot diseases.",
        ),
        "target spot": (
            "Target Spot",
            "Brown lesions may develop concentric rings resembling a target.",
            "The cause is crop-dependent and should be confirmed.",
        ),
        "spider mite": (
            "Spider Mite Damage",
            "Fine stippling, yellowing or webbing may appear on leaves.",
            "Spider mites are tiny plant-feeding pests.",
        ),
        "leaf miner": (
            "Leaf Miner Damage",
            "Winding trails or blotchy tunnels may appear inside leaves.",
            "Leaf-mining insect larvae feed within leaf tissue.",
        ),
        "nutrient deficiency": (
            "Possible Nutrient Deficiency",
            "Yellowing, discolouration or abnormal leaf growth may occur.",
            "The cause may involve nutrient availability, soil conditions or root health.",
        ),
    }

    for keyword, details in disease_guidance.items():
        if keyword in normalized:
            title, symptoms, cause = details

            return {
                "type": "disease",
                "title": title,
                "explanation": (
                    f"The model identified a pattern associated with {title}. "
                    "Image screening alone cannot confirm the exact cause."
                ),
                "symptoms": [symptoms],
                "possible_causes": [cause],
                "next_steps": [
                    "Inspect other leaves and nearby plants for similar symptoms.",
                    "Check both sides of affected leaves.",
                    "Remove badly affected plant material where appropriate.",
                    "Consult a local agricultural expert before treatment.",
                ],
            }

    return {
        "type": "unknown",
        "title": "Possible plant health issue",
        "explanation": (
            "The model selected this class, but AgriMind does not yet have "
            "verified crop-specific guidance for this label."
        ),
        "symptoms": [
            "Compare the visible leaf pattern with the predicted class.",
            "Check other leaves and nearby plants for similar symptoms.",
        ],
        "possible_causes": [
            "The exact cause cannot be established from this prediction alone."
        ],
        "next_steps": [
            "Take clear photographs of affected leaves and the whole plant.",
            "Inspect both sides of the leaves.",
            "Consult a local agricultural expert before treatment.",
        ],
    }


# =========================================================
# CROP VALIDATION
# =========================================================

def get_selected_crop(crop: str):
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
            "This crop is not supported by AgriMind AI."
        )

    return selected_crop


# =========================================================
# MOBILENET CROP DETECTION
# =========================================================

def detect_mobilenet_crop(label: str):
    normalized = normalize_disease_label(label)

    aliases = {
        "corn": ("corn", "maize"),
        "orange": ("orange", "citrus"),
        "bell pepper": ("bell pepper", "pepper bell"),
    }

    for crop in SUPPORTED_CROPS:
        possible_names = aliases.get(
            crop.casefold(),
            (crop.casefold(),),
        )

        for name in possible_names:
            if (
                normalized == name
                or normalized.startswith(name + " ")
            ):
                return crop

    return None


# =========================================================
# STANDARD RESPONSE HELPERS
# =========================================================

def _build_model_comparison(status):
    return {
        "available": False,
        "status": status,
        "agreement": None,
    }


def _build_warning(uncertain, model_name):
    if uncertain:
        return (
            "Low-confidence result. Please upload a clearer leaf image "
            "or consult an agricultural expert."
        )

    return (
        f"AI screening only, not a confirmed diagnosis. "
        f"{model_name} predictions should be verified before "
        "making treatment decisions."
    )


# =========================================================
# MAIN DISEASE PREDICTION FUNCTION
# =========================================================

def predict_disease(image: Image.Image, crop: str):
    """
    Main disease detection function used by the FastAPI backend.

    Parameters:
        image: PIL image uploaded by the user.
        crop: Selected crop name.

    Returns:
        Dictionary containing prediction, confidence,
        top predictions, disease information and model details.
    """

    if image is None:
        raise ValueError("No image was provided.")

    if not isinstance(image, Image.Image):
        raise TypeError("Input must be a PIL image.")

    selected_crop = get_selected_crop(crop)

    image = image.convert("RGB")

    width, height = image.size

    if width < 64 or height < 64:
        raise ValueError(
            "Please upload a clearer leaf image."
        )

    # -----------------------------------------------------
    # CONVNEXT PRIMARY MODEL
    # -----------------------------------------------------

    if selected_crop in CONVNEXT_MODELS:

        try:
            convnext_result = predict_with_convnext(
                image,
                selected_crop,
            )

        except Exception as exc:
            raise RuntimeError(
                f"ConvNeXt prediction failed for {selected_crop}. "
                f"Model: {CONVNEXT_MODELS[selected_crop]}. "
                f"Reason: {str(exc)}"
            ) from exc

        best_prediction = convnext_result["prediction"]
        confidence = convnext_result["confidence"]
        predictions = convnext_result["top_predictions"]

        uncertain = (
            confidence < CONVNEXT_CONFIDENCE_THRESHOLD
        )

        disease_info = get_disease_information(
            best_prediction
        )

        return {
            "success": True,
            "prediction": best_prediction,
            "selected_crop": selected_crop,
            "crop_match": True,
            "confidence": confidence,
            "uncertain": uncertain,
            "top_predictions": predictions,
            "disease_info": disease_info,

            "model_used": "ConvNeXt",
            "model_id": CONVNEXT_MODELS[selected_crop],

            "convnext_result": convnext_result,

            "model_comparison": _build_model_comparison(
                "convnext_primary_model"
            ),

            "warning": _build_warning(
                uncertain,
                "ConvNeXt",
            ),
        }

    # -----------------------------------------------------
    # MOBILENET FALLBACK
    # -----------------------------------------------------

    if selected_crop not in MOBILENET_ONLY_CROPS:
        raise RuntimeError(
            f"No compatible disease model is configured for "
            f"{selected_crop}."
        )

    predictions = predict_with_mobilenet(image)

    if not predictions:
        raise RuntimeError(
            "MobileNetV2 did not return any predictions."
        )

    best_prediction = predictions[0]
    confidence = best_prediction["confidence"]

    prediction_crop = detect_mobilenet_crop(
        best_prediction["disease"]
    )

    crop_matches = prediction_crop == selected_crop

    # Crop mismatch handling
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

            "model_used": "MobileNetV2",
            "model_id": MOBILENET_MODEL_ID,

            "convnext_result": {
                "available": False,
                "reason": (
                    "No dedicated ConvNeXt model for this crop."
                ),
            },

            "model_comparison": _build_model_comparison(
                "crop_mismatch"
            ),

            "warning": (
                f"The strongest model class was for "
                f"{prediction_crop or 'another crop'}, not "
                f"{selected_crop}. No disease label is shown. "
                "Check the crop selection."
            ),
        }

    uncertain = (
        confidence < MOBILENET_CONFIDENCE_THRESHOLD
    )

    disease_info = get_disease_information(
        best_prediction["disease"]
    )

    # Final response
    return {
        "success": True,
        "prediction": best_prediction["disease"],
        "selected_crop": selected_crop,
        "crop_match": True,
        "confidence": confidence,
        "uncertain": uncertain,
        "top_predictions": predictions,
        "disease_info": disease_info,

        "model_used": "MobileNetV2",
        "model_id": MOBILENET_MODEL_ID,

        "convnext_result": {
            "available": False,
            "reason": (
                "No dedicated ConvNeXt model for this crop."
            ),
        },

        "model_comparison": _build_model_comparison(
            "mobilenet_fallback"
        ),

        "warning": _build_warning(
            uncertain,
            "MobileNetV2 fallback model",
        ),
    }


# =========================================================
# MODEL REGISTRY INFORMATION
# =========================================================

def get_model_registry_info():
    """
    Return model configuration information.

    Useful for debugging and backend status checks.
    This does not download or load model weights.
    """

    return {
        "supported_crop_count": len(SUPPORTED_CROPS),
        "convnext_model_count": len(CONVNEXT_MODELS),
        "mobilenet_only_crop_count": len(MOBILENET_ONLY_CROPS),
        "supported_crops": list(SUPPORTED_CROPS),
        "convnext_crops": list(CONVNEXT_MODELS.keys()),
        "mobilenet_only_crops": sorted(
            MOBILENET_ONLY_CROPS
        ),
    }