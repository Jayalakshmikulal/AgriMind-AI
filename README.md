# AgriMind AI

AgriMind AI is a local demonstration prototype for crop image screening and environmental readings. The React/Vite app is the primary interface. A Streamlit interface is also kept in `frontend/app.py`.

## Run locally

For a fresh Python setup, run these commands once from the project root:

```powershell
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
```

Open a PowerShell terminal at the project root and start the API:

```powershell
venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

Open a second terminal in `frontend-react` and start the web app:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. The API listens at `http://127.0.0.1:8000` by default. Set `VITE_API_URL` when the API runs at another address. Set `AGRIMIND_ALLOWED_ORIGINS` to a comma-separated list of permitted browser origins when deploying the React app.

To run the secondary Streamlit interface instead, start the API as above and run `venv\Scripts\python.exe -m streamlit run frontend/app.py` in another terminal.

For a fresh Python environment, install the packages listed in `requirements.txt`. The disease model downloads from Hugging Face the first time it is used; that first prediction needs an internet connection. The model then uses the local Hugging Face cache when available.

## Current prototype limits

- Sensor values are generated randomly. They are **simulated**, not hardware readings.
- Sensor history is stored in `database/agrimind.db` on this machine. It is a local single-user demo store, not a hosted or multi-user database.
- Disease screening uses a fixed 38-class PlantVillage model and accepts only the 14 crops listed in the crop selector. It is not validated for all Indian crop varieties or field conditions; confirm results with an agricultural expert.
- The spraying page creates inspection-priority information from the image result. It does not locate a real field zone or control a drone/sprayer.
- GPS field mapping, ESP32/Arduino ingestion, MQTT, and drone image/GPS integration are not implemented.

## API routes

- `GET /health` — API status.
- `POST /predict-disease` — image screening; multipart fields `file` and supported `crop`.
- `GET /sensor-data` — new simulated reading.
- `GET /sensor-records?limit=100` — stored readings, newest first.
- `POST /sensor-readings` — validated telemetry payload shape for future devices, including optional GPS coordinates. It is an integration scaffold only; no sensor or drone is connected. Add device authentication before exposing this route beyond a trusted local demo.
- `GET /crop-intelligence` — simulated reading and threshold observations.
- `GET /ai-advisory` — simulated reading and rule-based suggestions.
- `POST /precision-spraying` — inspection-zone demonstration based on a screening result.
