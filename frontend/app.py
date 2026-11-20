 
import streamlit as st
import requests
import pandas as pd
from datetime import datetime

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

st.set_page_config(
    page_title="AgriMind AI",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="expanded"
)

API_URL = "http://127.0.0.1:8000"
SUPPORTED_CROPS = [
    "Apple", "Bell Pepper", "Blueberry", "Cherry", "Corn", "Grape", "Orange",
    "Peach", "Potato", "Raspberry", "Soybean", "Squash", "Strawberry", "Tomato",
]

# --------------------------------------------------
# SESSION STATE
# --------------------------------------------------

if "language" not in st.session_state:
    st.session_state.language = "English"

if "disease_result" not in st.session_state:
    st.session_state.disease_result = None

if "sensor_history" not in st.session_state:
    st.session_state.sensor_history = []

if "last_sensor_data" not in st.session_state:
    st.session_state.last_sensor_data = None

if "dashboard_data" not in st.session_state:
    st.session_state.dashboard_data = None

if "navigation_page" not in st.session_state:
    st.session_state.navigation_page = "dashboard"


# --------------------------------------------------
# LANGUAGE SUPPORT
# --------------------------------------------------

LANGUAGES = [
    "English",
    "ಕನ್ನಡ (Kannada)",
    "हिन्दी (Hindi)",
    "മലയാളം (Malayalam)",
    "தமிழ் (Tamil)",
    "తెలుగు (Telugu)"
]

TRANSLATIONS = {
    "English": {
        "Dashboard": "Dashboard",
        "Disease Detection": "Disease Detection",
        "Crop Intelligence": "Crop Intelligence",
        "AI Advisory": "AI Advisory",
        "Precision Spraying": "Precision Spraying",
        "Sensor Records": "Sensor Records",
        "Settings": "Settings",
        "Navigation": "NAVIGATION",
        "Language": "Language",
        "Welcome": "Welcome to AgriMind AI",
        "Dashboard subtitle": "Your crop intelligence and monitoring workspace.",
        "Refresh": "Refresh data",
        "Temperature": "Temperature",
        "Humidity": "Humidity",
        "Soil moisture": "Soil Moisture",
        "Light": "Light Intensity",
        "Simulated": "SIMULATED DATA",
        "Upload": "Upload a leaf image",
        "Analyze": "Analyze image",
        "Get readings": "Get sensor readings",
        "Get advisory": "Generate advisory",
        "Run planning": "Generate zone report",
        "No result": "No result available yet.",
        "API status": "Backend connection",
        "Connected": "Connected",
        "Disconnected": "Disconnected"
    },
    "ಕನ್ನಡ (Kannada)": {
        "Dashboard": "ಮುಖ್ಯ ಫಲಕ",
        "Disease Detection": "ರೋಗ ಪತ್ತೆ",
        "Crop Intelligence": "ಬೆಳೆ ಮಾಹಿತಿ",
        "AI Advisory": "AI ಸಲಹೆ",
        "Precision Spraying": "ನಿಖರ ಸಿಂಪಡಣೆ",
        "Sensor Records": "ಸೆನ್ಸರ್ ದಾಖಲೆಗಳು",
        "Settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        "Navigation": "ನ್ಯಾವಿಗೇಶನ್",
        "Language": "ಭಾಷೆ",
        "Welcome": "AgriMind AI ಗೆ ಸ್ವಾಗತ",
        "Dashboard subtitle": "ನಿಮ್ಮ ಬೆಳೆ ಮಾಹಿತಿ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣಾ ಕೇಂದ್ರ.",
        "Refresh": "ಮಾಹಿತಿ ನವೀಕರಿಸಿ",
        "Temperature": "ತಾಪಮಾನ",
        "Humidity": "ಆರ್ದ್ರತೆ",
        "Soil moisture": "ಮಣ್ಣಿನ ತೇವಾಂಶ",
        "Light": "ಬೆಳಕಿನ ತೀವ್ರತೆ",
        "Simulated": "ಕೃತಕ ಪರೀಕ್ಷಾ ಮಾಹಿತಿ",
        "Upload": "ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
        "Analyze": "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
        "Get readings": "ಸೆನ್ಸರ್ ಮಾಹಿತಿ ಪಡೆಯಿರಿ",
        "Get advisory": "ಸಲಹೆ ಪಡೆಯಿರಿ",
        "Run planning": "ವಲಯ ವರದಿ ರಚಿಸಿ",
        "No result": "ಇನ್ನೂ ಯಾವುದೇ ಫಲಿತಾಂಶ ಲಭ್ಯವಿಲ್ಲ.",
        "API status": "ಬ್ಯಾಕೆಂಡ್ ಸಂಪರ್ಕ",
        "Connected": "ಸಂಪರ್ಕಗೊಂಡಿದೆ",
        "Disconnected": "ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ"
    },
    "हिन्दी (Hindi)": {
        "Dashboard": "डैशबोर्ड",
        "Disease Detection": "रोग पहचान",
        "Crop Intelligence": "फसल जानकारी",
        "AI Advisory": "AI सलाह",
        "Precision Spraying": "सटीक छिड़काव",
        "Sensor Records": "सेंसर रिकॉर्ड",
        "Settings": "सेटिंग्स",
        "Navigation": "नेविगेशन",
        "Language": "भाषा",
        "Welcome": "AgriMind AI में आपका स्वागत है",
        "Dashboard subtitle": "आपका फसल निगरानी और जानकारी केंद्र।",
        "Refresh": "डेटा रीफ्रेश करें",
        "Temperature": "तापमान",
        "Humidity": "आर्द्रता",
        "Soil moisture": "मिट्टी की नमी",
        "Light": "प्रकाश की तीव्रता",
        "Simulated": "सिम्युलेटेड डेटा",
        "Upload": "पत्ती की तस्वीर अपलोड करें",
        "Analyze": "तस्वीर का विश्लेषण करें",
        "Get readings": "सेंसर डेटा प्राप्त करें",
        "Get advisory": "सलाह प्राप्त करें",
        "Run planning": "ज़ोन रिपोर्ट बनाएं",
        "No result": "अभी कोई परिणाम उपलब्ध नहीं है।",
        "API status": "बैकएंड कनेक्शन",
        "Connected": "कनेक्टेड",
        "Disconnected": "डिस्कनेक्टेड"
    },
    "മലയാളം (Malayalam)": {
        "Dashboard": "ഡാഷ്ബോർഡ്",
        "Disease Detection": "രോഗം കണ്ടെത്തൽ",
        "Crop Intelligence": "വിള വിവരങ്ങൾ",
        "AI Advisory": "AI ഉപദേശം",
        "Precision Spraying": "കൃത്യമായ സ്പ്രേയിംഗ്",
        "Sensor Records": "സെൻസർ രേഖകൾ",
        "Settings": "ക്രമീകരണങ്ങൾ",
        "Navigation": "നാവിഗേഷൻ",
        "Language": "ഭാഷ",
        "Welcome": "AgriMind AI-യിലേക്ക് സ്വാഗതം",
        "Dashboard subtitle": "നിങ്ങളുടെ വിള നിരീക്ഷണ കേന്ദ്രം.",
        "Refresh": "ഡാറ്റ പുതുക്കുക",
        "Temperature": "താപനില",
        "Humidity": "ഈർപ്പം",
        "Soil moisture": "മണ്ണിലെ ഈർപ്പം",
        "Light": "പ്രകാശ തീവ്രത",
        "Simulated": "സിമുലേറ്റഡ് ഡാറ്റ",
        "Upload": "ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
        "Analyze": "ചിത്രം പരിശോധിക്കുക",
        "Get readings": "സെൻസർ വിവരങ്ങൾ നേടുക",
        "Get advisory": "ഉപദേശം നേടുക",
        "Run planning": "സോൺ റിപ്പോർട്ട് തയ്യാറാക്കുക",
        "No result": "ഫലം ലഭ്യമല്ല.",
        "API status": "ബാക്കെൻഡ് കണക്ഷൻ",
        "Connected": "കണക്റ്റ് ചെയ്തു",
        "Disconnected": "കണക്ഷൻ ലഭ്യമല്ല"
    },
    "தமிழ் (Tamil)": {
        "Dashboard": "முகப்பு",
        "Disease Detection": "நோய் கண்டறிதல்",
        "Crop Intelligence": "பயிர் தகவல்",
        "AI Advisory": "AI ஆலோசனை",
        "Precision Spraying": "துல்லிய தெளிப்பு",
        "Sensor Records": "சென்சார் பதிவுகள்",
        "Settings": "அமைப்புகள்",
        "Navigation": "வழிசெலுத்தல்",
        "Language": "மொழி",
        "Welcome": "AgriMind AI-க்கு வரவேற்கிறோம்",
        "Dashboard subtitle": "உங்கள் பயிர் கண்காணிப்பு மையம்.",
        "Refresh": "தரவைப் புதுப்பிக்கவும்",
        "Temperature": "வெப்பநிலை",
        "Humidity": "ஈரப்பதம்",
        "Soil moisture": "மண் ஈரப்பதம்",
        "Light": "ஒளியின் தீவிரம்",
        "Simulated": "மாதிரி தரவு",
        "Upload": "இலைப் படத்தைப் பதிவேற்றவும்",
        "Analyze": "படத்தை ஆய்வு செய்யவும்",
        "Get readings": "சென்சார் தரவைப் பெறவும்",
        "Get advisory": "ஆலோசனை பெறவும்",
        "Run planning": "மண்டல அறிக்கையை உருவாக்கவும்",
        "No result": "முடிவு இன்னும் கிடைக்கவில்லை.",
        "API status": "பின்தள இணைப்பு",
        "Connected": "இணைக்கப்பட்டது",
        "Disconnected": "இணைப்பு இல்லை"
    },
    "తెలుగు (Telugu)": {
        "Dashboard": "డాష్‌బోర్డ్",
        "Disease Detection": "వ్యాధి గుర్తింపు",
        "Crop Intelligence": "పంట సమాచారం",
        "AI Advisory": "AI సలహా",
        "Precision Spraying": "ఖచ్చితమైన స్ప్రేయింగ్",
        "Sensor Records": "సెన్సార్ రికార్డులు",
        "Settings": "సెట్టింగ్‌లు",
        "Navigation": "నావిగేషన్",
        "Language": "భాష",
        "Welcome": "AgriMind AI కి స్వాగతం",
        "Dashboard subtitle": "మీ పంట పర్యవేక్షణ కేంద్రం.",
        "Refresh": "డేటాను రిఫ్రెష్ చేయండి",
        "Temperature": "ఉష్ణోగ్రత",
        "Humidity": "తేమ",
        "Soil moisture": "నేల తేమ",
        "Light": "కాంతి తీవ్రత",
        "Simulated": "సిమ్యులేటెడ్ డేటా",
        "Upload": "ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి",
        "Analyze": "చిత్రాన్ని విశ్లేషించండి",
        "Get readings": "సెన్సార్ డేటా పొందండి",
        "Get advisory": "సలహా పొందండి",
        "Run planning": "జోన్ నివేదిక రూపొందించండి",
        "No result": "ఇంకా ఫలితం అందుబాటులో లేదు.",
        "API status": "బ్యాకెండ్ కనెక్షన్",
        "Connected": "కనెక్ట్ అయింది",
        "Disconnected": "కనెక్షన్ లేదు"
    }
}


def tr(key):
    language = st.session_state.language
    return TRANSLATIONS.get(language, TRANSLATIONS["English"]).get(
        key, TRANSLATIONS["English"].get(key, key)
    )


PAGE_TRANSLATION_KEYS = {
    "dashboard": "Dashboard",
    "disease": "Disease Detection",
    "intelligence": "Crop Intelligence",
    "advisory": "AI Advisory",
    "spraying": "Precision Spraying",
    "records": "Sensor Records",
    "settings": "Settings",
}


def navigate_to(page):
    st.session_state.navigation_page = page


# --------------------------------------------------
# API HELPERS
# --------------------------------------------------

def api_get(endpoint):
    try:
        response = requests.get(
            f"{API_URL}{endpoint}",
            timeout=60
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as error:
        st.error(f"Could not connect to AgriMind backend: {error}")
        return None


def api_post(endpoint, **kwargs):
    try:
        response = requests.post(
            f"{API_URL}{endpoint}",
            timeout=120,
            **kwargs
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as error:
        st.error(f"Request failed: {error}")
        try:
            st.error(response.json().get("detail", ""))
        except Exception:
            pass
        return None


def save_sensor_record(data):
    if not data:
        return

    st.session_state.last_sensor_data = data

    record = data.copy()
    record["recorded_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    st.session_state.sensor_history.append(record)


def show_simulated_notice():
    st.info(
        "Demo mode: These readings are simulated. "
        "Connect physical sensors to display live field data."
    )


def show_sensor_metrics(data):
    columns = st.columns(4)

    metrics = [
        (tr("Temperature"), data.get("temperature"), "°C"),
        (tr("Humidity"), data.get("humidity"), "%"),
        (tr("Soil moisture"), data.get("soil_moisture"), "%"),
        (tr("Light"), data.get("light_intensity"), "lux")
    ]

    for column, (label, value, unit) in zip(columns, metrics):
        with column:
            if value is not None:
                st.metric(label, f"{value} {unit}")
            else:
                st.metric(label, "N/A")


# --------------------------------------------------
# CUSTOM DESIGN
# --------------------------------------------------

st.markdown("""
<style>
    .stApp {
        background-color: #f6f8f5;
    }

    [data-testid="stSidebar"] {
        background-color: #edf3eb;
        border-right: 1px solid #dce7d9;
    }

    [data-testid="stSidebar"] h1 {
        color: #245b36;
    }

    .brand-title {
        color: #245b36;
        font-size: 27px;
        font-weight: 750;
        margin-bottom: 2px;
    }

    .brand-caption {
        color: #718174;
        font-size: 13px;
        margin-bottom: 25px;
    }

    .page-caption {
        color: #718174;
        font-size: 15px;
        margin-top: -12px;
        margin-bottom: 25px;
    }

    .section-title {
        color: #285d39;
        font-size: 19px;
        font-weight: 650;
        margin-top: 12px;
    }

    div[data-testid="stMetric"] {
        background: white;
        border: 1px solid #e1e9df;
        padding: 17px;
        border-radius: 12px;
    }

    div.stButton > button {
        border-radius: 8px;
        border: 1px solid #34764a;
        min-height: 40px;
    }

    div.stButton > button[kind="primary"] {
        background-color: #34764a;
        color: white;
    }

    .small-note {
        color: #718174;
        font-size: 13px;
    }

    #MainMenu {
        visibility: hidden;
    }

    footer {
        visibility: hidden;
    }
</style>
""", unsafe_allow_html=True)


# --------------------------------------------------
# SIDEBAR NAVIGATION
# --------------------------------------------------

with st.sidebar:

    st.markdown(
        '<div class="brand-title">🌱 AgriMind AI</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="brand-caption">Crop Intelligence Platform</div>',
        unsafe_allow_html=True
    )

    st.selectbox(
        tr("Language"),
        LANGUAGES,
        key="language"
    )

    st.divider()

    st.caption(tr("Navigation"))

    selected_page = st.radio(
        "Navigate",
        list(PAGE_TRANSLATION_KEYS),
        format_func=lambda page: tr(PAGE_TRANSLATION_KEYS[page]),
        key="navigation_page",
        label_visibility="collapsed",
    )

    st.divider()

    health = api_get("/health")

    if health and health.get("status") == "healthy":
        st.success(f"● {tr('Connected')}")
    else:
        st.error(f"● {tr('Disconnected')}")

    st.caption("AgriMind AI • Prototype v1.0")


# --------------------------------------------------
# PAGE 1: DASHBOARD
# --------------------------------------------------

if selected_page == "dashboard":

    st.title(tr("Welcome"))
    st.markdown(
        f'<div class="page-caption">{tr("Dashboard subtitle")}</div>',
        unsafe_allow_html=True
    )

    st.markdown("### Field Overview")

    show_simulated_notice()

    if st.button(tr("Refresh"), type="primary"):
        data = api_get("/sensor-data")

        if data and data.get("success"):
            st.session_state.dashboard_data = data
            save_sensor_record(data["data"])

    dashboard_data = st.session_state.dashboard_data
    if dashboard_data is None:
        dashboard_data = api_get("/sensor-data")
        if dashboard_data and dashboard_data.get("success"):
            st.session_state.dashboard_data = dashboard_data
            save_sensor_record(dashboard_data["data"])

    if dashboard_data and dashboard_data.get("success"):
        data = dashboard_data["data"]
        show_sensor_metrics(data)

        st.caption(
            f"Last updated: {data.get('timestamp', 'Not available')}"
        )

    st.divider()

    left, right = st.columns(2)

    with left:
        st.markdown(f"### {tr('Crop Intelligence')}")
        st.write(
            "Review environmental readings and understand "
            "conditions around your crop."
        )
        st.button(
            f"Open {tr('Crop Intelligence')}",
            use_container_width=True,
            on_click=navigate_to,
            args=("intelligence",),
        )

    with right:
        st.markdown(f"### {tr('Disease Detection')}")
        st.write(
            "Upload a leaf image to screen for possible plant diseases."
        )
        st.button(
            f"Open {tr('Disease Detection')}",
            use_container_width=True,
            on_click=navigate_to,
            args=("disease",),
        )

    st.divider()

    st.markdown("### Available Modules")

    module_columns = st.columns(3)

    modules = [
        ("🔬", "Disease Detection", "AI leaf image screening", "disease"),
        ("🌿", "Crop Intelligence", "Environmental monitoring", "intelligence"),
        ("🧠", "AI Advisory", "Farmer-friendly suggestions", "advisory"),
        ("🚁", "Precision Spraying", "Field inspection priorities", "spraying"),
        ("📊", "Sensor Records", "Reading history", "records"),
        ("⚙️", "Settings", "Language and application settings", "settings")
    ]

    for index, (emoji, title, description, page) in enumerate(modules):
        with module_columns[index % 3]:
            st.markdown(f"#### {emoji} {tr(title)}")
            st.caption(description)
            st.button(
                f"Open {tr(title)}",
                key=f"open_module_{page}",
                use_container_width=True,
                on_click=navigate_to,
                args=(page,),
            )


# --------------------------------------------------
# PAGE 2: DISEASE DETECTION
# --------------------------------------------------

elif selected_page == "disease":

    st.title("Plant Disease Detection")
    st.markdown(
        '<div class="page-caption">'
        'Upload a clear leaf photograph for AI-based disease screening.'
        '</div>',
        unsafe_allow_html=True
    )

    st.info(
        "The current model supports 38 PlantVillage classes. "
        "It is not validated for every crop or real-world field condition."
    )

    uploaded_file = st.file_uploader(
        tr("Upload"),
        type=["jpg", "jpeg", "png", "webp"]
    )

    selected_crop = st.selectbox(
        "Select supported crop",
        SUPPORTED_CROPS,
        help="The current screening model covers only these 14 crops.",
    )

    if uploaded_file:
        st.image(
            uploaded_file,
            caption="Uploaded leaf image",
            width=350
        )

        if st.button(tr("Analyze"), type="primary"):

            with st.spinner("AI is analyzing the leaf image..."):

                result = api_post(
                    "/predict-disease",
                    files={
                        "file": (
                            uploaded_file.name,
                            uploaded_file.getvalue(),
                            uploaded_file.type
                        )
                    },
                    data={"crop": selected_crop}
                )

            if result and result.get("success"):
                st.session_state.disease_result = result
                st.success("Image screening completed.")

    result = st.session_state.disease_result

    if result:
        st.divider()
        st.subheader("Screening Result")

        st.metric(
            "Top prediction",
            result.get("prediction", "Unknown")
        )

        st.metric(
            "Model confidence score",
            f"{result.get('confidence', 0)}%"
        )

        if result.get("uncertain"):
            st.warning(result.get("warning", "Low-confidence result."))
        else:
            st.info(result.get("warning", "AI screening only."))

        st.markdown("### Top Predictions")

        predictions = result.get("top_predictions", [])

        if predictions:
            prediction_df = pd.DataFrame(predictions)
            prediction_df.columns = ["Disease class", "Confidence (%)"]
            st.dataframe(prediction_df, use_container_width=True)

        st.caption(
            "The model score is not a guarantee of diagnosis. "
            "Consult an agricultural expert before treatment."
        )

    else:
        st.info(tr("No result"))


# --------------------------------------------------
# PAGE 3: CROP INTELLIGENCE
# --------------------------------------------------

elif selected_page == "intelligence":

    st.title("Crop Intelligence")
    st.markdown(
        '<div class="page-caption">'
        'Monitor environmental conditions and review crop observations.'
        '</div>',
        unsafe_allow_html=True
    )

    show_simulated_notice()

    if st.button(tr("Get readings"), type="primary"):

        response = api_get("/crop-intelligence")

        if response and response.get("success"):
            data = response["sensor_readings"]
            save_sensor_record(data)
            st.session_state.crop_result = response

    crop_result = st.session_state.get("crop_result")

    if crop_result:
        data = crop_result["sensor_readings"]

        st.subheader("Current Environmental Readings")
        show_sensor_metrics(data)

        st.caption(f"Timestamp: {data.get('timestamp', 'N/A')}")

        st.divider()

        st.subheader("Crop Observations")

        for observation in crop_result.get("observations", []):
            st.write(f"• {observation}")

        st.caption(crop_result.get("notice", ""))

    else:
        st.info("Select Get sensor readings to view crop intelligence.")


# --------------------------------------------------
# PAGE 4: AI ADVISORY
# --------------------------------------------------

elif selected_page == "advisory":

    st.title("AI Crop Advisory")
    st.markdown(
        '<div class="page-caption">'
        'Review environmental alerts and preliminary recommendations.'
        '</div>',
        unsafe_allow_html=True
    )

    show_simulated_notice()

    if st.button(tr("Get advisory"), type="primary"):

        with st.spinner("Preparing advisory..."):
            response = api_get("/ai-advisory")

        if response and response.get("success"):
            st.session_state.advisory_result = response
            save_sensor_record(response["sensor_readings"])

    advisory_result = st.session_state.get("advisory_result")

    if advisory_result:

        st.subheader("Environmental Readings")
        show_sensor_metrics(advisory_result["sensor_readings"])

        advisory = advisory_result["advisory"]

        st.divider()
        st.subheader("Alerts")

        alerts = advisory.get("alerts", [])

        if alerts:
            for alert in alerts:
                st.warning(alert)
        else:
            st.success("No major alerts from the current prototype checks.")

        st.subheader("Recommendations")

        for recommendation in advisory.get("recommendations", []):
            st.write(f"• {recommendation}")

        st.caption(advisory.get("notice", ""))

        st.info(
            "This version generates recommendations from sensor readings. "
            "Disease-image results are not yet integrated into this advisory endpoint."
        )

    else:
        st.info("Select Generate advisory to receive recommendations.")


# --------------------------------------------------
# PAGE 5: PRECISION SPRAYING
# --------------------------------------------------

elif selected_page == "spraying":

    st.title("Precision Spraying Intelligence")
    st.markdown(
        '<div class="page-caption">'
        'Identify potential inspection zones using disease-screening results.'
        '</div>',
        unsafe_allow_html=True
    )

    st.warning(
        "This is a field-zone planning prototype. "
        "It does not control a drone or activate spraying equipment."
    )

    disease_result = st.session_state.disease_result

    if disease_result:

        st.subheader("Available Disease Screening Result")

        st.write(
            f"**Detected class:** {disease_result.get('prediction', 'Unknown')}"
        )

        st.write(
            f"**Confidence score:** {disease_result.get('confidence', 0)}%"
        )

        if st.button(tr("Run planning"), type="primary"):

            with st.spinner("Preparing field-zone report..."):

                response = api_post(
                    "/precision-spraying",
                    json=disease_result
                )

            if response:
                st.session_state.spraying_result = response

        spraying_result = st.session_state.get("spraying_result")

        if spraying_result:

            st.divider()
            st.subheader("Field-Zone Report")

            st.write(
                f"**Field ID:** {spraying_result.get('field_id', 'N/A')}"
            )

            st.write(
                f"**Status:** {spraying_result.get('status', 'N/A')}"
            )

            zones = spraying_result.get("zones", [])

            if zones:

                for zone in zones:
                    with st.container(border=True):
                        st.markdown(f"### {zone.get('zone_id')}")
                        st.write(
                            f"**Priority:** {zone.get('priority')}"
                        )
                        st.write(
                            f"**Possible issue:** {zone.get('detected_issue')}"
                        )
                        st.write(
                            f"**Recommended action:** "
                            f"{zone.get('recommended_action')}"
                        )
                        st.warning(zone.get("status"))

            else:
                st.info(spraying_result.get("message", "No zones generated."))

            st.write(spraying_result.get("message", ""))

            st.error(
                "Human inspection and approval are required. "
                "Automatic spraying is disabled."
            )

            st.caption(
                "A real field location requires GPS, camera mapping "
                "or field-grid information from the hardware system."
            )

    else:
        st.info(
            "First visit Disease Detection and upload a leaf image. "
            "The screening result will appear here for zone planning."
        )


# --------------------------------------------------
# PAGE 6: SENSOR RECORDS
# --------------------------------------------------

elif selected_page == "records":

    st.title("Sensor Records")
    st.markdown(
        '<div class="page-caption">'
        'Review sensor readings collected during this application session.'
        '</div>',
        unsafe_allow_html=True
    )

    show_simulated_notice()

    if st.button(tr("Get readings"), type="primary"):

        response = api_get("/sensor-data")

        if response and response.get("success"):
            save_sensor_record(response["data"])

    records_response = api_get("/sensor-records")
    history = records_response.get("data", []) if records_response else []

    if history:

        history_df = pd.DataFrame(history).sort_values("id")

        st.subheader("Reading History")

        display_columns = [
            "timestamp",
            "temperature",
            "humidity",
            "soil_moisture",
            "light_intensity",
            "source"
        ]

        st.dataframe(
            history_df[display_columns],
            use_container_width=True
        )

        st.divider()

        st.subheader("Sensor Trends")

        chart_df = history_df[
            ["temperature", "humidity", "soil_moisture"]
        ].copy()

        chart_df.index = range(1, len(chart_df) + 1)

        st.line_chart(chart_df)

        st.caption(
            "Readings are stored in the local SQLite demo database on this computer."
        )

    else:
        st.info(
            "No sensor records collected yet. "
            "Select Get sensor readings to start."
        )


# --------------------------------------------------
# PAGE 7: SETTINGS
# --------------------------------------------------

elif selected_page == "settings":

    st.title("Settings")
    st.markdown(
        '<div class="page-caption">'
        'Manage application preferences and view system information.'
        '</div>',
        unsafe_allow_html=True
    )

    st.subheader("Language Preferences")

    selected_language = st.selectbox(
        "Choose application language",
        LANGUAGES,
        index=LANGUAGES.index(st.session_state.language)
    )

    st.session_state.language = selected_language

    st.caption(
        "Some technical model labels and detailed explanations "
        "are currently available in English."
    )

    st.divider()

    st.subheader("Backend Information")

    health = api_get("/health")

    if health:
        st.success("AgriMind AI backend is running.")
        st.json(health)
    else:
        st.error("Backend is not reachable.")

    st.divider()

    st.subheader("Application Information")

    st.write("**Application:** AgriMind AI")
    st.write("**Version:** 1.0.0")
    st.write("**Frontend:** Streamlit")
    st.write("**Backend:** FastAPI")
    st.write("**Disease model:** MobileNetV2 Plant Disease Classifier")
    st.write("**Current sensor mode:** Simulated data")

    st.divider()

    st.subheader("Important Information")

    st.write(
        "AgriMind AI is a prototype crop intelligence platform. "
        "AI screening and environmental observations are preliminary. "
        "They should not replace professional agricultural advice."
    )

