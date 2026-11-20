"""Small SQLite storage layer for AgriMind demo sensor readings."""

import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DATABASE_PATH = Path(__file__).resolve().with_name("agrimind.db")


def _connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    """Create the readings table if it does not already exist."""
    with closing(_connect()) as connection:
        with connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS sensor_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    temperature REAL,
                    humidity REAL,
                    soil_moisture REAL,
                    light_intensity REAL,
                    latitude REAL,
                    longitude REAL,
                    sensor_id TEXT,
                    source TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
                """
            )
            columns = {
                row["name"] for row in connection.execute("PRAGMA table_info(sensor_readings)")
            }
            if "sensor_id" not in columns:
                connection.execute("ALTER TABLE sensor_readings ADD COLUMN sensor_id TEXT")


def save_sensor_reading(reading: dict[str, Any]) -> int:
    """Save one reading and return its database ID."""
    timestamp = reading.get("timestamp") or datetime.now(timezone.utc).isoformat(timespec="seconds")
    with closing(_connect()) as connection:
        with connection:
            cursor = connection.execute(
                """
                INSERT INTO sensor_readings
                    (temperature, humidity, soil_moisture, light_intensity,
                     latitude, longitude, sensor_id, source, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    reading.get("temperature"),
                    reading.get("humidity"),
                    reading.get("soil_moisture"),
                    reading.get("light_intensity"),
                    reading.get("latitude"),
                    reading.get("longitude"),
                    reading.get("sensor_id"),
                    str(reading.get("source", "UNKNOWN")),
                    timestamp,
                ),
            )
            return int(cursor.lastrowid)


def get_sensor_readings(limit: int = 100) -> list[dict[str, Any]]:
    """Return newest readings first, with a safe maximum page size."""
    safe_limit = max(1, min(int(limit), 500))
    with closing(_connect()) as connection:
        rows = connection.execute(
            "SELECT * FROM sensor_readings ORDER BY id DESC LIMIT ?",
            (safe_limit,),
        ).fetchall()
    return [dict(row) for row in rows]
