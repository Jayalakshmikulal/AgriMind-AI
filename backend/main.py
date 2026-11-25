 
import os
import logging
from datetime import datetime
from io import BytesIO

from fastapi import (
    FastAPI,
    File,
    Form,
    UploadFile,
    HTTPException,
    Body,
    Query,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

from ai_models.disease_detector import predict_disease, SUPPORTED_CROPS
from utils.sensor_manager import get_sensor_data, analyze_sensor_data
from utils.advisory import generate_advisory
from utils.spraying_manager import generate_spraying_zones
from database.db_manager import (
    initialize_database,
    save_sensor_reading,
    get_sensor_readings,
)


logger = logging.getLogger(__name__)

app = FastAPI(
    title="AgriMind AI API",
    description=(
        "AI-powered crop disease screening, crop intelligence, "
        "advisory and precision spraying intelligence"
    ),
    version="1.0.0",
)

# Initialize database
initialize_database()


# CORS configuration
allowed_origins = os.getenv(
    "AGRIMIND_ALLOWED_ORIGINS",
    (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:4173,"
        "http://127.0.0.1:4173"
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in allowed_origins.split(",")
        if origin.strip()
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Device sensor payload
class DeviceReading(BaseModel):
    """Validated payload shape for a future ESP32/Arduino telemetry client."""

    sensor_id: str = Field(min_length=1, max_length=100)
    temperature: float = Field(ge=-40, le=85)
    humidity: float = Field(ge=0, le=100)
    soil_moisture: float = Field(ge=0, le=100)
    light_intensity: float = Field(ge=0, le=200000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    timestamp: datetime | None = None


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to AgriMind AI API",
        "status": "Running",
        "project": "AgriMind AI",
        "version": "1.0.0",
    }


# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": "AgriMind AI",
    }


# Existing single-image crop disease detection
@app.post("/predict-disease")
async def detect_disease(
    file: UploadFile = File(...),
    crop: str = Form(...),
):
    if crop.strip().casefold() not in {
        supported.casefold() for supported in SUPPORTED_CROPS
    }:
        raise HTTPException(
            status_code=422,
            detail=(
                "Unsupported crop. Choose one of: "
                f"{', '.join(SUPPORTED_CROPS)}."
            ),
        )

    if file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, PNG or WEBP image.",
        )

    try:
        image_bytes = await file.read(10 * 1024 * 1024 + 1)

        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Image must be smaller than 10 MB.",
            )

        try:
            image = Image.open(BytesIO(image_bytes))

            if image.format not in ["JPEG", "PNG", "WEBP"]:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported image format.",
                )

            if image.width > 4096 or image.height > 4096:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Image dimensions must be 4096 pixels or smaller."
                    ),
                )

            image.verify()
            image = Image.open(BytesIO(image_bytes)).convert("RGB")

        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
        ) as error:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid image.",
            ) from error

        result = await run_in_threadpool(
            predict_disease,
            image,
            crop,
        )

        return result

    except HTTPException:
        raise

    except Exception:
        logger.exception("Disease detection failed")

        raise HTTPException(
            status_code=500,
            detail=(
                "Disease detection failed. "
                "Check the server log and try again."
            ),
        )

    finally:
        await file.close()


# Sensor data endpoint
@app.get("/sensor-data")
def sensor_readings():
    data = get_sensor_data()
    save_sensor_reading(data)

    return {
        "success": True,
        "message": "Sensor readings retrieved successfully",
        "data": data,
    }


# Sensor history endpoint
@app.get("/sensor-records")
def sensor_records(
    limit: int = Query(default=100, ge=1, le=500),
):
    return {
        "success": True,
        "data": get_sensor_readings(limit),
    }


# Receive ESP32 / Arduino sensor readings
@app.post("/sensor-readings")
def receive_device_reading(reading: DeviceReading):
    if (reading.latitude is None) != (reading.longitude is None):
        raise HTTPException(
            status_code=422,
            detail="Send both latitude and longitude, or neither.",
        )

    data = reading.model_dump(mode="json")
    data["source"] = "DEVICE_INGESTION"

    save_sensor_reading(data)

    return {
        "success": True,
        "data_source": "DEVICE_INGESTION",
        "message": (
            "Payload accepted. This does not confirm that "
            "physical hardware is connected."
        ),
        "data": data,
    }


# Crop intelligence endpoint
@app.get("/crop-intelligence")
def crop_intelligence():
    data = get_sensor_data()
    save_sensor_reading(data)

    observations = analyze_sensor_data(data)

    return {
        "success": True,
        "data_source": "SIMULATED DATA",
        "sensor_readings": data,
        "observations": observations,
        "notice": (
            "Prototype observations only. Actual crop requirements "
            "depend on crop type and local environmental conditions."
        ),
    }


# AI advisory endpoint
@app.get("/ai-advisory")
def ai_advisory():
    data = get_sensor_data()
    save_sensor_reading(data)

    observations = analyze_sensor_data(data)
    advisory = generate_advisory(sensor_data=data)

    return {
        "success": True,
        "data_source": "SIMULATED DATA",
        "sensor_readings": data,
        "crop_observations": observations,
        "advisory": advisory,
    }


# Precision spraying endpoint
@app.post("/precision-spraying")
def precision_spraying(
    disease_result: dict = Body(...),
):
    try:
        result = generate_spraying_zones(
            disease_result=disease_result,
        )

        return result

    except Exception:
        logger.exception("Precision spraying analysis failed")

        raise HTTPException(
            status_code=500,
            detail=(
                "Precision spraying analysis failed. "
                "Check the server log."
            ),
        )
