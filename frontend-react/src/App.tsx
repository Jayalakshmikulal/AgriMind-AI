 
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import "./App.css";

type Language = "en" | "kn" | "hi" | "ml" | "ta" | "te";
type Page =
  | "dashboard"
  | "disease"
  | "intelligence"
  | "advisory"
  | "spraying"
  | "records";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const supportedCrops = [
  "Apple", "Bell Pepper", "Blueberry", "Cherry", "Corn", "Grape",
  "Orange", "Peach", "Potato", "Raspberry", "Soybean", "Squash",
  "Strawberry", "Tomato",
];

const languageNames: Record<Language, string> = {
  en: "English",
  kn: "ಕನ್ನಡ",
  hi: "हिन्दी",
  ml: "മലയാളം",
  ta: "தமிழ்",
  te: "తెలుగు",
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    app: "AgriMind AI", tagline: "Intelligent Crop Protection",
    welcome: "Grow smarter. Protect better.",
    welcomeText: "AI-powered crop intelligence for a healthier tomorrow.",
    choose: "Choose your language", start: "Enter AgriMind AI",
    language: "Language", dashboard: "Dashboard",
    disease: "Disease Detection", intelligence: "Crop Intelligence",
    advisory: "AI Advisory", spraying: "Precision Spraying",
    records: "Sensor Records", overview: "Farm overview",
    overviewText: "Your crop intelligence at a glance.",
    temperature: "Temperature", humidity: "Humidity",
    moisture: "Soil Moisture", light: "Light Intensity",
    liveStatus: "System overview", connected: "Backend connection",
    refresh: "Refresh data", loading: "Loading...",
    detectTitle: "AI Plant Disease Detection",
    detectText: "Upload a clear crop leaf image for AI screening.",
    upload: "Choose leaf image", selectCrop: "Select supported crop",
    cropScope: "This model covers 14 crops and 38 PlantVillage classes only. Unsupported crops may be assigned a misleading label; treat every result as a screening aid.",
    analyze: "Analyze image", analyzing: "Analyzing image...",
    prediction: "AI screening result", confidence: "Model score",
    topResults: "Other possible results", warning: "Important notice",
    noResult: "No analysis yet",
    noResultText: "Upload a leaf image to begin disease screening.",
    intelligenceTitle: "Crop Intelligence",
    intelligenceText: "Environmental readings and crop observations.",
    observations: "Crop observations", source: "Data source",
    simulated: "SIMULATED DATA", real: "REAL SENSOR DATA",
    advisoryTitle: "AI Crop Advisory",
    advisoryText: "Recommendations based on available sensor information.",
    alerts: "Alerts", recommendations: "Recommendations",
    advisoryNotice: "These are preliminary suggestions, not confirmed diagnoses or pesticide instructions.",
    sprayingTitle: "Precision Spraying Planner",
    sprayingText: "Review areas that may need field inspection.",
    field: "Field", zone: "Zone", priority: "Inspection priority",
    approval: "Human approval required", pending: "Pending review",
    noAuto: "Automatic spraying is disabled in this prototype.",
    zoneNotice: "Zones are generic inspection prompts. No GPS location or field boundary is attached.",
    recordsTitle: "Sensor Records",
    recordsText: "Latest available environmental readings.",
    metric: "Reading", value: "Value", status: "Status",
    home: "Home", healthy: "System ready",
    error: "Unable to connect to the backend. Check that it is running.",
    chooseImage: "Please select an image first.",
    imageError: "Image analysis failed. Please try again.",
    noData: "No data available yet.", notConnected: "Not connected",
    lowConfidence: "Low-confidence result. Please upload a clearer image or consult an agricultural expert.",
    screeningNotice: "AI screening only; this score is not a calibrated probability or confirmed diagnosis.",
    cropMismatch: "The model's strongest class does not match the crop you selected. No disease result is shown.",
    planZone: "Generate inspection report", time: "Time",
    dataSource: "Source",
    explanation: "AI Disease Explanation",
    meaning: "What does this mean?",
    symptoms: "Symptoms to check",
    causes: "Possible causes",
    nextSteps: "Recommended next steps",
    healthyTitle: "Your leaf appears healthy",
    healthyText: "The model classified this leaf as healthy. No specific disease pattern was identified.",
    healthyAction: "Continue monitoring the crop. Check both sides of the leaves regularly and observe new growth.",
    disclaimer: "This explanation is general educational guidance based on the predicted model class. It is not a confirmed diagnosis.",
    unknownTitle: "More inspection is needed",
    unknownText: "AgriMind AI does not have a verified explanation for this particular model label.",
    unknownAction: "Take a clearer photograph and consult an agricultural expert before making treatment decisions.",
    uncertainTitle: "Result needs confirmation",
    uncertainText: "The model is not sufficiently confident about this result. The explanation may not match the actual plant condition.",
  },

  kn: {
    app: "AgriMind AI", tagline: "ಬುದ್ಧಿವಂತ ಬೆಳೆ ರಕ್ಷಣೆ",
    welcome: "ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಬೆಳೆಸಿ. ಉತ್ತಮವಾಗಿ ರಕ್ಷಿಸಿ.",
    welcomeText: "ಆರೋಗ್ಯಕರ ಭವಿಷ್ಯಕ್ಕಾಗಿ AI ಆಧಾರಿತ ಬೆಳೆ ಮಾಹಿತಿ.",
    choose: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    start: "AgriMind AI ತೆರೆಯಿರಿ", language: "ಭಾಷೆ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", disease: "ರೋಗ ಪತ್ತೆ",
    intelligence: "ಬೆಳೆ ಮಾಹಿತಿ", advisory: "AI ಸಲಹೆ",
    spraying: "ನಿಖರ ಸಿಂಪಡಣೆ", records: "ಸೆನ್ಸರ್ ದಾಖಲೆಗಳು",
    overview: "ಕೃಷಿ ಅವಲೋಕನ",
    overviewText: "ನಿಮ್ಮ ಬೆಳೆಯ ಮಾಹಿತಿಯನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನೋಡಿ.",
    temperature: "ತಾಪಮಾನ", humidity: "ಆರ್ದ್ರತೆ",
    moisture: "ಮಣ್ಣಿನ ತೇವಾಂಶ", light: "ಬೆಳಕಿನ ತೀವ್ರತೆ",
    liveStatus: "ವ್ಯವಸ್ಥೆಯ ಸ್ಥಿತಿ", connected: "ಬ್ಯಾಕೆಂಡ್ ಸಂಪರ್ಕ",
    refresh: "ಮಾಹಿತಿ ನವೀಕರಿಸಿ", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    detectTitle: "AI ಸಸ್ಯ ರೋಗ ಪತ್ತೆ",
    detectText: "AI ಪರಿಶೀಲನೆಗಾಗಿ ಬೆಳೆಯ ಎಲೆಯ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    upload: "ಎಲೆಯ ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",
    selectCrop: "ಬೆಂಬಲಿತ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    cropScope: "ಈ ಮಾದರಿ 14 ಬೆಳೆಗಳು ಮತ್ತು PlantVillage‌ನ 38 ವರ್ಗಗಳಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ. ಬೆಂಬಲವಿಲ್ಲದ ಬೆಳೆಗಳಿಗೆ ತಪ್ಪು ಹೆಸರು ಬರಬಹುದು. ಫಲಿತಾಂಶವನ್ನು ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆಯಾಗಿ ಮಾತ್ರ ಬಳಸಿ.",
    analyze: "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ", analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    prediction: "AI ಪರಿಶೀಲನೆಯ ಫಲಿತಾಂಶ", confidence: "ಮಾದರಿಯ ಅಂಕ",
    topResults: "ಇತರ ಸಾಧ್ಯ ಫಲಿತಾಂಶಗಳು", warning: "ಮುಖ್ಯ ಸೂಚನೆ",
    noResult: "ಇನ್ನೂ ವಿಶ್ಲೇಷಣೆ ಇಲ್ಲ",
    noResultText: "ರೋಗ ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭಿಸಲು ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    intelligenceTitle: "ಬೆಳೆ ಮಾಹಿತಿ",
    intelligenceText: "ಪರಿಸರದ ಅಳತೆಗಳು ಮತ್ತು ಬೆಳೆ ಅವಲೋಕನಗಳು.",
    observations: "ಬೆಳೆ ಅವಲೋಕನಗಳು", source: "ಮಾಹಿತಿಯ ಮೂಲ",
    simulated: "ಅನುಕರಿಸಿದ ಮಾಹಿತಿ", real: "ನೈಜ ಸೆನ್ಸರ್ ಮಾಹಿತಿ",
    advisoryTitle: "AI ಕೃಷಿ ಸಲಹೆ",
    advisoryText: "ಲಭ್ಯವಿರುವ ಸೆನ್ಸರ್ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಸಲಹೆಗಳು.",
    alerts: "ಎಚ್ಚರಿಕೆಗಳು", recommendations: "ಶಿಫಾರಸುಗಳು",
    advisoryNotice: "ಇವು ಪ್ರಾಥಮಿಕ ಸಲಹೆಗಳು ಮಾತ್ರ. ಖಚಿತ ರೋಗನಿರ್ಣಯ ಅಥವಾ ಕೀಟನಾಶಕ ಸೂಚನೆಗಳಲ್ಲ.",
    sprayingTitle: "ನಿಖರ ಸಿಂಪಡಣೆ ಯೋಜನೆ",
    sprayingText: "ಹೊಲದಲ್ಲಿ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ಪ್ರದೇಶಗಳನ್ನು ನೋಡಿ.",
    field: "ಹೊಲ", zone: "ವಲಯ", priority: "ಪರಿಶೀಲನೆಯ ಆದ್ಯತೆ",
    approval: "ಮಾನವ ಅನುಮತಿ ಅಗತ್ಯ", pending: "ಪರಿಶೀಲನೆ ಬಾಕಿ",
    noAuto: "ಈ ಮಾದರಿಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಸಿಂಪಡಣೆ ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ.",
    zoneNotice: "ವಲಯಗಳು ಸಾಮಾನ್ಯ ಪರಿಶೀಲನಾ ಸೂಚನೆಗಳು ಮಾತ್ರ. GPS ಸ್ಥಳ ಅಥವಾ ಹೊಲದ ಗಡಿ ಜೋಡಿಸಿಲ್ಲ.",
    recordsTitle: "ಸೆನ್ಸರ್ ದಾಖಲೆಗಳು",
    recordsText: "ಇತ್ತೀಚಿನ ಪರಿಸರದ ಅಳತೆಗಳು.",
    metric: "ಅಳತೆ", value: "ಮೌಲ್ಯ", status: "ಸ್ಥಿತಿ",
    home: "ಮುಖಪುಟ", healthy: "ವ್ಯವಸ್ಥೆ ಸಿದ್ಧವಾಗಿದೆ",
    error: "ಬ್ಯಾಕೆಂಡ್ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಅದು ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಪರಿಶೀಲಿಸಿ.",
    chooseImage: "ಮೊದಲು ಒಂದು ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    imageError: "ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    noData: "ಇನ್ನೂ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.", notConnected: "ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ",
    lowConfidence: "ಕಡಿಮೆ ವಿಶ್ವಾಸದ ಫಲಿತಾಂಶ. ಸ್ಪಷ್ಟವಾದ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    screeningNotice: "ಇದು AI ಪರಿಶೀಲನೆ ಮಾತ್ರ. ಈ ಅಂಕವು ಮಾಪನಾಂಕಿತ ಸಂಭವನೀಯತೆ ಅಥವಾ ಖಚಿತ ರೋಗನಿರ್ಣಯವಲ್ಲ.",
    cropMismatch: "ಮಾದರಿಯ ಪ್ರಮುಖ ವರ್ಗವು ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಬೆಳೆಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ. ರೋಗದ ಫಲಿತಾಂಶ ತೋರಿಸಲಾಗಿಲ್ಲ.",
    planZone: "ಪರಿಶೀಲನಾ ವರದಿ ರಚಿಸಿ", time: "ಸಮಯ",
    dataSource: "ಮೂಲ",
    explanation: "AI ರೋಗದ ವಿವರಣೆ",
    meaning: "ಇದರ ಅರ್ಥವೇನು?",
    symptoms: "ಪರಿಶೀಲಿಸಬೇಕಾದ ಲಕ್ಷಣಗಳು",
    causes: "ಸಂಭವನೀಯ ಕಾರಣಗಳು",
    nextSteps: "ಮುಂದಿನ ಕ್ರಮಗಳು",
    healthyTitle: "ನಿಮ್ಮ ಎಲೆ ಆರೋಗ್ಯಕರವಾಗಿ ಕಾಣುತ್ತದೆ",
    healthyText: "ಮಾದರಿಯು ಈ ಎಲೆಯನ್ನು ಆರೋಗ್ಯಕರವೆಂದು ಗುರುತಿಸಿದೆ. ನಿರ್ದಿಷ್ಟ ರೋಗದ ಲಕ್ಷಣ ಕಂಡುಬಂದಿಲ್ಲ.",
    healthyAction: "ಬೆಳೆಯನ್ನು ನಿಯಮಿತವಾಗಿ ಗಮನಿಸಿ. ಎಲೆಗಳ ಎರಡೂ ಬದಿಗಳನ್ನು ಮತ್ತು ಹೊಸ ಬೆಳವಣಿಗೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
    disclaimer: "ಈ ವಿವರಣೆಯು ಮಾದರಿಯ ಫಲಿತಾಂಶದ ಆಧಾರದ ಮೇಲಿನ ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ಮಾತ್ರ. ಇದು ಖಚಿತ ರೋಗನಿರ್ಣಯವಲ್ಲ.",
    unknownTitle: "ಹೆಚ್ಚಿನ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ",
    unknownText: "ಈ ಮಾದರಿಯ ವರ್ಗಕ್ಕೆ ಪರಿಶೀಲಿತ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ.",
    unknownAction: "ಸ್ಪಷ್ಟವಾದ ಚಿತ್ರವನ್ನು ತೆಗೆದು ಚಿಕಿತ್ಸೆಯ ನಿರ್ಧಾರಕ್ಕೆ ಮೊದಲು ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    uncertainTitle: "ಫಲಿತಾಂಶವನ್ನು ದೃಢೀಕರಿಸಬೇಕು",
    uncertainText: "ಈ ಫಲಿತಾಂಶದ ಬಗ್ಗೆ ಮಾದರಿಗೆ ಸಾಕಷ್ಟು ವಿಶ್ವಾಸವಿಲ್ಲ. ವಿವರಣೆಯು ನಿಜವಾದ ಸಸ್ಯದ ಸ್ಥಿತಿಗೆ ಹೊಂದಿಕೆಯಾಗದೇ ಇರಬಹುದು.",
  },

  hi: {
    app: "AgriMind AI", tagline: "बुद्धिमान फसल सुरक्षा",
    welcome: "समझदारी से उगाएँ। बेहतर सुरक्षा करें।",
    welcomeText: "स्वस्थ भविष्य के लिए AI आधारित फसल जानकारी।",
    choose: "अपनी भाषा चुनें", start: "AgriMind AI खोलें",
    language: "भाषा", dashboard: "डैशबोर्ड",
    disease: "रोग पहचान", intelligence: "फसल जानकारी",
    advisory: "AI सलाह", spraying: "सटीक छिड़काव",
    records: "सेंसर रिकॉर्ड", overview: "खेत का अवलोकन",
    overviewText: "अपनी फसल की जानकारी एक ही जगह देखें।",
    temperature: "तापमान", humidity: "नमी",
    moisture: "मिट्टी की नमी", light: "प्रकाश की तीव्रता",
    liveStatus: "सिस्टम की स्थिति", connected: "बैकएंड कनेक्शन",
    refresh: "डेटा रीफ्रेश करें", loading: "लोड हो रहा है...",
    detectTitle: "AI पौधों के रोग की पहचान",
    detectText: "AI जाँच के लिए फसल की पत्ती की साफ तस्वीर अपलोड करें।",
    upload: "पत्ती की तस्वीर चुनें", selectCrop: "समर्थित फसल चुनें",
    cropScope: "यह मॉडल केवल 14 फसलों और PlantVillage की 38 श्रेणियों तक सीमित है। असमर्थित फसल को गलत नाम मिल सकता है। परिणाम को केवल शुरुआती जाँच मानें।",
    analyze: "तस्वीर का विश्लेषण करें", analyzing: "विश्लेषण हो रहा है...",
    prediction: "AI जाँच का परिणाम", confidence: "मॉडल स्कोर",
    topResults: "अन्य संभावित परिणाम", warning: "महत्वपूर्ण सूचना",
    noResult: "अभी कोई विश्लेषण नहीं",
    noResultText: "रोग जाँच शुरू करने के लिए पत्ती की तस्वीर अपलोड करें।",
    intelligenceTitle: "फसल जानकारी",
    intelligenceText: "पर्यावरण के माप और फसल का अवलोकन।",
    observations: "फसल का अवलोकन", source: "डेटा का स्रोत",
    simulated: "सिम्युलेटेड डेटा", real: "वास्तविक सेंसर डेटा",
    advisoryTitle: "AI कृषि सलाह",
    advisoryText: "उपलब्ध सेंसर जानकारी पर आधारित सुझाव।",
    alerts: "चेतावनियाँ", recommendations: "सुझाव",
    advisoryNotice: "ये शुरुआती सुझाव हैं, पक्के निदान या कीटनाशक निर्देश नहीं।",
    sprayingTitle: "सटीक छिड़काव योजना",
    sprayingText: "उन क्षेत्रों की समीक्षा करें जहाँ खेत का निरीक्षण आवश्यक हो सकता है।",
    field: "खेत", zone: "क्षेत्र", priority: "निरीक्षण प्राथमिकता",
    approval: "मानव अनुमति आवश्यक", pending: "समीक्षा लंबित",
    noAuto: "इस प्रोटोटाइप में स्वचालित छिड़काव बंद है।",
    zoneNotice: "ये सामान्य निरीक्षण संकेत हैं। इनमें GPS स्थान या खेत की सीमा नहीं जुड़ी है।",
    recordsTitle: "सेंसर रिकॉर्ड",
    recordsText: "नवीनतम उपलब्ध पर्यावरणीय माप।",
    metric: "माप", value: "मान", status: "स्थिति",
    home: "होम", healthy: "सिस्टम तैयार है",
    error: "बैकएंड से कनेक्ट नहीं हो पाया। जाँचें कि वह चल रहा है।",
    chooseImage: "कृपया पहले एक तस्वीर चुनें।",
    imageError: "तस्वीर का विश्लेषण विफल हुआ। फिर से प्रयास करें।",
    noData: "अभी डेटा उपलब्ध नहीं है।", notConnected: "कनेक्ट नहीं है",
    lowConfidence: "कम विश्वास वाला परिणाम। साफ तस्वीर अपलोड करें या कृषि विशेषज्ञ से सलाह लें।",
    screeningNotice: "यह केवल AI जाँच है। यह स्कोर कैलिब्रेट की गई संभावना या पक्का निदान नहीं है।",
    cropMismatch: "मॉडल की मुख्य श्रेणी आपके चुने हुए फसल से मेल नहीं खाती। रोग परिणाम नहीं दिखाया गया है।",
    planZone: "निरीक्षण रिपोर्ट बनाएँ", time: "समय",
    dataSource: "स्रोत",
    explanation: "AI रोग की व्याख्या",
    meaning: "इसका क्या मतलब है?",
    symptoms: "जाँचने योग्य लक्षण",
    causes: "संभावित कारण",
    nextSteps: "अगले कदम",
    healthyTitle: "आपकी पत्ती स्वस्थ दिखाई देती है",
    healthyText: "मॉडल ने इस पत्ती को स्वस्थ बताया है। किसी विशेष रोग का स्पष्ट संकेत नहीं मिला।",
    healthyAction: "फसल की नियमित निगरानी करें। पत्तियों के दोनों तरफ और नई वृद्धि को देखें।",
    disclaimer: "यह विवरण मॉडल के परिणाम पर आधारित सामान्य जानकारी है। यह पक्का निदान नहीं है।",
    unknownTitle: "अधिक जाँच की आवश्यकता है",
    unknownText: "इस मॉडल श्रेणी के लिए सत्यापित विवरण उपलब्ध नहीं है।",
    unknownAction: "एक साफ तस्वीर लें और उपचार का निर्णय लेने से पहले कृषि विशेषज्ञ से सलाह लें।",
    uncertainTitle: "परिणाम की पुष्टि आवश्यक है",
    uncertainText: "मॉडल को इस परिणाम पर पर्याप्त भरोसा नहीं है। यह विवरण पौधे की वास्तविक स्थिति से मेल न भी खा सकता है।",
  },

  ml: {
    app: "AgriMind AI", tagline: "ബുദ്ധിപരമായ വിള സംരക്ഷണം",
    welcome: "ബുദ്ധിയോടെ കൃഷി ചെയ്യൂ. മികച്ച രീതിയിൽ സംരക്ഷിക്കൂ.",
    welcomeText: "ആരോഗ്യകരമായ നാളേക്കായി AI അധിഷ്ഠിത വിള വിവരങ്ങൾ.",
    choose: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    start: "AgriMind AI തുറക്കുക", language: "ഭാഷ",
    dashboard: "ഡാഷ്ബോർഡ്", disease: "രോഗം കണ്ടെത്തൽ",
    intelligence: "വിള വിവരങ്ങൾ", advisory: "AI ഉപദേശം",
    spraying: "കൃത്യമായ തളിക്കൽ", records: "സെൻസർ രേഖകൾ",
    overview: "കൃഷിയിട അവലോകനം",
    overviewText: "നിങ്ങളുടെ വിള വിവരങ്ങൾ ഒറ്റനോട്ടത്തിൽ.",
    temperature: "താപനില", humidity: "ഈർപ്പം",
    moisture: "മണ്ണിലെ ഈർപ്പം", light: "പ്രകാശ തീവ്രത",
    liveStatus: "സിസ്റ്റം നില", connected: "ബാക്ക്എൻഡ് കണക്ഷൻ",
    refresh: "വിവരങ്ങൾ പുതുക്കുക", loading: "ലോഡ് ചെയ്യുന്നു...",
    detectTitle: "AI സസ്യരോഗ കണ്ടെത്തൽ",
    detectText: "AI പരിശോധനയ്ക്കായി ഇലയുടെ വ്യക്തമായ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.",
    upload: "ഇലയുടെ ചിത്രം തിരഞ്ഞെടുക്കുക",
    selectCrop: "പിന്തുണയ്ക്കുന്ന വിള തിരഞ്ഞെടുക്കുക",
    cropScope: "ഈ മോഡൽ 14 വിളകളിലെയും PlantVillage-ലെ 38 വിഭാഗങ്ങളിലെയും ചിത്രങ്ങൾക്കു മാത്രമാണ്. പിന്തുണയില്ലാത്ത വിളയ്ക്ക് തെറ്റായ പേര് ലഭിക്കാം. ഫലം പ്രാഥമിക പരിശോധനയായി മാത്രം കാണുക.",
    analyze: "ചിത്രം വിശകലനം ചെയ്യുക", analyzing: "വിശകലനം ചെയ്യുന്നു...",
    prediction: "AI പരിശോധനാ ഫലം", confidence: "മോഡൽ സ്കോർ",
    topResults: "മറ്റ് സാധ്യതയുള്ള ഫലങ്ങൾ", warning: "പ്രധാന അറിയിപ്പ്",
    noResult: "ഇതുവരെ വിശകലനം നടത്തിയിട്ടില്ല",
    noResultText: "രോഗ പരിശോധന ആരംഭിക്കാൻ ഇലയുടെ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.",
    intelligenceTitle: "വിള വിവരങ്ങൾ",
    intelligenceText: "പരിസ്ഥിതി അളവുകളും വിള നിരീക്ഷണങ്ങളും.",
    observations: "വിള നിരീക്ഷണങ്ങൾ", source: "വിവരത്തിന്റെ ഉറവിടം",
    simulated: "സിമുലേറ്റഡ് ഡാറ്റ", real: "യഥാർത്ഥ സെൻസർ ഡാറ്റ",
    advisoryTitle: "AI കൃഷി ഉപദേശം",
    advisoryText: "ലഭ്യമായ സെൻസർ വിവരങ്ങളെ അടിസ്ഥാനമാക്കിയുള്ള നിർദ്ദേശങ്ങൾ.",
    alerts: "മുന്നറിയിപ്പുകൾ", recommendations: "ശുപാർശകൾ",
    advisoryNotice: "ഇവ പ്രാഥമിക നിർദ്ദേശങ്ങൾ മാത്രമാണ്. സ്ഥിരീകരിച്ച രോഗനിർണയമോ കീടനാശിനി നിർദ്ദേശങ്ങളോ അല്ല.",
    sprayingTitle: "കൃത്യമായ തളിക്കൽ പദ്ധതി",
    sprayingText: "പരിശോധന ആവശ്യമായേക്കാവുന്ന പ്രദേശങ്ങൾ പരിശോധിക്കുക.",
    field: "കൃഷിയിടം", zone: "മേഖല", priority: "പരിശോധനാ മുൻഗണന",
    approval: "മനുഷ്യന്റെ അനുമതി ആവശ്യമാണ്", pending: "പരിശോധന കാത്തിരിക്കുന്നു",
    noAuto: "ഈ പ്രോട്ടോടൈപ്പിൽ ഓട്ടോമാറ്റിക് തളിക്കൽ പ്രവർത്തനരഹിതമാണ്.",
    zoneNotice: "മേഖലകൾ പൊതുവായ പരിശോധനാ സൂചനകൾ മാത്രമാണ്. GPS സ്ഥാനമോ കൃഷിയിട അതിരോ ചേർത്തിട്ടില്ല.",
    recordsTitle: "സെൻസർ രേഖകൾ",
    recordsText: "ഏറ്റവും പുതിയ പരിസ്ഥിതി അളവുകൾ.",
    metric: "അളവ്", value: "മൂല്യം", status: "നില",
    home: "ഹോം", healthy: "സിസ്റ്റം തയ്യാറാണ്",
    error: "ബാക്ക്എൻഡുമായി ബന്ധിപ്പിക്കാൻ കഴിഞ്ഞില്ല. അത് പ്രവർത്തിക്കുന്നുണ്ടെന്ന് ഉറപ്പാക്കുക.",
    chooseImage: "ആദ്യം ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക.",
    imageError: "ചിത്രം വിശകലനം ചെയ്യാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
    noData: "വിവരങ്ങൾ ലഭ്യമല്ല.", notConnected: "ബന്ധിപ്പിച്ചിട്ടില്ല",
    lowConfidence: "കുറഞ്ഞ വിശ്വാസ്യതയുള്ള ഫലം. വ്യക്തമായ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ കാർഷിക വിദഗ്ധനെ സമീപിക്കുക.",
    screeningNotice: "ഇത് AI പരിശോധന മാത്രമാണ്. ഈ സ്കോർ കൃത്യമായി കാലിബ്രേറ്റ് ചെയ്ത സാധ്യതയോ സ്ഥിരീകരിച്ച രോഗനിർണയമോ അല്ല.",
    cropMismatch: "മോഡലിന്റെ പ്രധാന വിഭാഗം നിങ്ങൾ തിരഞ്ഞെടുത്ത വിളയുമായി പൊരുത്തപ്പെടുന്നില്ല. രോഗഫലം കാണിക്കുന്നില്ല.",
    planZone: "പരിശോധനാ റിപ്പോർട്ട് തയ്യാറാക്കുക", time: "സമയം",
    dataSource: "ഉറവിടം",
    explanation: "AI രോഗ വിശദീകരണം",
    meaning: "ഇതിന്റെ അർത്ഥം എന്താണ്?",
    symptoms: "പരിശോധിക്കേണ്ട ലക്ഷണങ്ങൾ",
    causes: "സാധ്യമായ കാരണങ്ങൾ",
    nextSteps: "അടുത്ത നടപടികൾ",
    healthyTitle: "നിങ്ങളുടെ ഇല ആരോഗ്യകരമായി കാണപ്പെടുന്നു",
    healthyText: "ഈ ഇലയെ മോഡൽ ആരോഗ്യകരമായി തിരിച്ചറിഞ്ഞു. പ്രത്യേക രോഗലക്ഷണങ്ങൾ കണ്ടെത്തിയിട്ടില്ല.",
    healthyAction: "വിള പതിവായി നിരീക്ഷിക്കുക. ഇലകളുടെ ഇരുവശവും പുതിയ വളർച്ചയും പരിശോധിക്കുക.",
    disclaimer: "ഈ വിശദീകരണം മോഡൽ ഫലത്തെ അടിസ്ഥാനമാക്കിയുള്ള പൊതുവായ വിവരമാണ്. ഇത് സ്ഥിരീകരിച്ച രോഗനിർണയമല്ല.",
    unknownTitle: "കൂടുതൽ പരിശോധന ആവശ്യമാണ്",
    unknownText: "ഈ മോഡൽ വിഭാഗത്തിന് സ്ഥിരീകരിച്ച വിശദീകരണം ലഭ്യമല്ല.",
    unknownAction: "വ്യക്തമായ ചിത്രം എടുത്ത് ചികിത്സ തീരുമാനിക്കുന്നതിന് മുമ്പ് കാർഷിക വിദഗ്ധനെ സമീപിക്കുക.",
    uncertainTitle: "ഫലം സ്ഥിരീകരിക്കേണ്ടതുണ്ട്",
    uncertainText: "ഈ ഫലത്തെക്കുറിച്ച് മോഡലിന് മതിയായ വിശ്വാസമില്ല. വിശദീകരണം യഥാർത്ഥ സസ്യാവസ്ഥയുമായി പൊരുത്തപ്പെടണമെന്നില്ല.",
  },

  ta: {
    app: "AgriMind AI", tagline: "அறிவார்ந்த பயிர் பாதுகாப்பு",
    welcome: "புத்திசாலித்தனமாக பயிரிடுங்கள். சிறப்பாகப் பாதுகாக்குங்கள்.",
    welcomeText: "ஆரோக்கியமான எதிர்காலத்திற்கான AI பயிர் நுண்ணறிவு.",
    choose: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    start: "AgriMind AI திறக்கவும்", language: "மொழி",
    dashboard: "டாஷ்போர்டு", disease: "நோய் கண்டறிதல்",
    intelligence: "பயிர் தகவல்", advisory: "AI ஆலோசனை",
    spraying: "துல்லிய தெளிப்பு", records: "சென்சார் பதிவுகள்",
    overview: "பண்ணை மேலோட்டம்",
    overviewText: "உங்கள் பயிர் தகவல்களை ஒரே இடத்தில் பாருங்கள்.",
    temperature: "வெப்பநிலை", humidity: "ஈரப்பதம்",
    moisture: "மண் ஈரப்பதம்", light: "ஒளியின் தீவிரம்",
    liveStatus: "அமைப்பின் நிலை", connected: "பின்தள இணைப்பு",
    refresh: "தரவைப் புதுப்பிக்கவும்", loading: "ஏற்றப்படுகிறது...",
    detectTitle: "AI தாவர நோய் கண்டறிதல்",
    detectText: "AI பரிசோதனைக்காக தெளிவான இலைப் படத்தைப் பதிவேற்றவும்.",
    upload: "இலைப் படத்தைத் தேர்ந்தெடுக்கவும்",
    selectCrop: "ஆதரிக்கப்படும் பயிரைத் தேர்ந்தெடுக்கவும்",
    cropScope: "இந்த மாதிரி 14 பயிர்கள் மற்றும் PlantVillage-இன் 38 வகைகளை மட்டுமே உள்ளடக்குகிறது. ஆதரிக்கப்படாத பயிருக்கு தவறான பெயர் வழங்கப்படலாம். முடிவை ஆரம்பநிலை சோதனையாக மட்டும் கருதுங்கள்.",
    analyze: "படத்தை ஆய்வு செய்யவும்", analyzing: "ஆய்வு செய்யப்படுகிறது...",
    prediction: "AI பரிசோதனை முடிவு", confidence: "மாதிரி மதிப்பெண்",
    topResults: "மற்ற சாத்தியமான முடிவுகள்", warning: "முக்கிய அறிவிப்பு",
    noResult: "இன்னும் ஆய்வு இல்லை",
    noResultText: "நோய் பரிசோதனையைத் தொடங்க இலைப் படத்தைப் பதிவேற்றவும்.",
    intelligenceTitle: "பயிர் தகவல்",
    intelligenceText: "சுற்றுச்சூழல் அளவீடுகள் மற்றும் பயிர் கவனிப்புகள்.",
    observations: "பயிர் கவனிப்புகள்", source: "தரவு மூலம்",
    simulated: "உருவகப்படுத்தப்பட்ட தரவு", real: "உண்மையான சென்சார் தரவு",
    advisoryTitle: "AI விவசாய ஆலோசனை",
    advisoryText: "கிடைக்கும் சென்சார் தகவல்களின் அடிப்படையிலான பரிந்துரைகள்.",
    alerts: "எச்சரிக்கைகள்", recommendations: "பரிந்துரைகள்",
    advisoryNotice: "இவை ஆரம்பகட்ட ஆலோசனைகள் மட்டுமே. உறுதிப்படுத்தப்பட்ட நோயறிதலோ பூச்சிக்கொல்லி வழிமுறைகளோ அல்ல.",
    sprayingTitle: "துல்லிய தெளிப்பு திட்டம்",
    sprayingText: "வயலில் ஆய்வு தேவைப்படக்கூடிய பகுதிகளைப் பாருங்கள்.",
    field: "வயல்", zone: "பகுதி", priority: "ஆய்வு முன்னுரிமை",
    approval: "மனித அனுமதி தேவை", pending: "ஆய்வு நிலுவையில்",
    noAuto: "இந்த முன்மாதிரியில் தானியங்கி தெளிப்பு முடக்கப்பட்டுள்ளது.",
    zoneNotice: "இவை பொதுவான ஆய்வு பரிந்துரைகள் மட்டுமே. GPS இடமோ வயல் எல்லையோ இணைக்கப்படவில்லை.",
    recordsTitle: "சென்சார் பதிவுகள்",
    recordsText: "சமீபத்திய சுற்றுச்சூழல் அளவீடுகள்.",
    metric: "அளவீடு", value: "மதிப்பு", status: "நிலை",
    home: "முகப்பு", healthy: "அமைப்பு தயார்",
    error: "பின்தளத்துடன் இணைக்க முடியவில்லை. அது இயங்குகிறதா எனச் சரிபார்க்கவும்.",
    chooseImage: "முதலில் ஒரு படத்தைத் தேர்ந்தெடுக்கவும்.",
    imageError: "பட ஆய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    noData: "தரவு இன்னும் கிடைக்கவில்லை.", notConnected: "இணைக்கப்படவில்லை",
    lowConfidence: "குறைந்த நம்பிக்கை முடிவு. தெளிவான படத்தைப் பதிவேற்றவும் அல்லது விவசாய நிபுணரை அணுகவும்.",
    screeningNotice: "இது AI ஆரம்பநிலை சோதனை மட்டுமே. இந்த மதிப்பெண் அளவுத்திருத்தம் செய்யப்பட்ட நிகழ்தகவோ உறுதியான நோயறிதலோ அல்ல.",
    cropMismatch: "மாதிரியின் முதன்மை வகை நீங்கள் தேர்ந்தெடுத்த பயிருடன் பொருந்தவில்லை. நோய் முடிவு காட்டப்படவில்லை.",
    planZone: "ஆய்வு அறிக்கையை உருவாக்கவும்", time: "நேரம்",
    dataSource: "மூலம்",
    explanation: "AI நோய் விளக்கம்",
    meaning: "இதன் பொருள் என்ன?",
    symptoms: "சரிபார்க்க வேண்டிய அறிகுறிகள்",
    causes: "சாத்தியமான காரணங்கள்",
    nextSteps: "அடுத்த நடவடிக்கைகள்",
    healthyTitle: "உங்கள் இலை ஆரோக்கியமாகத் தெரிகிறது",
    healthyText: "இந்த இலையை மாதிரி ஆரோக்கியமானதாகக் கண்டறிந்துள்ளது. குறிப்பிட்ட நோயின் அறிகுறிகள் கண்டறியப்படவில்லை.",
    healthyAction: "பயிரைத் தொடர்ந்து கண்காணிக்கவும். இலைகளின் இருபுறங்களையும் புதிய வளர்ச்சியையும் கவனிக்கவும்.",
    disclaimer: "இந்த விளக்கம் மாதிரி முடிவை அடிப்படையாகக் கொண்ட பொதுவான தகவல் மட்டுமே. இது உறுதியான நோயறிதல் அல்ல.",
    unknownTitle: "மேலும் ஆய்வு தேவை",
    unknownText: "இந்த மாதிரி வகைக்கு சரிபார்க்கப்பட்ட விளக்கம் இல்லை.",
    unknownAction: "தெளிவான படத்தை எடுத்து சிகிச்சை முடிவு செய்வதற்கு முன் விவசாய நிபுணரை அணுகவும்.",
    uncertainTitle: "முடிவை உறுதிப்படுத்த வேண்டும்",
    uncertainText: "இந்த முடிவில் மாதிரிக்கு போதுமான நம்பிக்கை இல்லை. விளக்கம் உண்மையான தாவர நிலைக்குப் பொருந்தாமல் இருக்கலாம்.",
  },

  te: {
    app: "AgriMind AI", tagline: "తెలివైన పంట రక్షణ",
    welcome: "తెలివిగా పండించండి. మెరుగ్గా రక్షించండి.",
    welcomeText: "ఆరోగ్యకరమైన భవిష్యత్తు కోసం AI ఆధారిత పంట సమాచారం.",
    choose: "మీ భాషను ఎంచుకోండి", start: "AgriMind AI తెరవండి",
    language: "భాష", dashboard: "డ్యాష్‌బోర్డ్",
    disease: "వ్యాధి గుర్తింపు", intelligence: "పంట సమాచారం",
    advisory: "AI సలహా", spraying: "ఖచ్చితమైన పిచికారీ",
    records: "సెన్సార్ రికార్డులు", overview: "వ్యవసాయ అవలోకనం",
    overviewText: "మీ పంట సమాచారాన్ని ఒకే చోట చూడండి.",
    temperature: "ఉష్ణోగ్రత", humidity: "తేమ",
    moisture: "నేల తేమ", light: "కాంతి తీవ్రత",
    liveStatus: "వ్యవస్థ స్థితి", connected: "బ్యాకెండ్ కనెక్షన్",
    refresh: "డేటాను రిఫ్రెష్ చేయండి", loading: "లోడ్ అవుతోంది...",
    detectTitle: "AI మొక్కల వ్యాధి గుర్తింపు",
    detectText: "AI పరీక్ష కోసం స్పష్టమైన ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి.",
    upload: "ఆకు చిత్రాన్ని ఎంచుకోండి",
    selectCrop: "మద్దతు ఉన్న పంటను ఎంచుకోండి",
    cropScope: "ఈ మోడల్ 14 పంటలు మరియు PlantVillage‌లోని 38 తరగతులకు మాత్రమే పరిమితం. మద్దతు లేని పంటకు తప్పు పేరు రావచ్చు. ఫలితాన్ని ప్రాథమిక పరిశీలనగా మాత్రమే చూడండి.",
    analyze: "చిత్రాన్ని విశ్లేషించండి", analyzing: "విశ్లేషిస్తోంది...",
    prediction: "AI పరీక్ష ఫలితం", confidence: "మోడల్ స్కోరు",
    topResults: "ఇతర సాధ్యమైన ఫలితాలు", warning: "ముఖ్యమైన గమనిక",
    noResult: "ఇంకా విశ్లేషణ లేదు",
    noResultText: "వ్యాధి పరీక్ష ప్రారంభించడానికి ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి.",
    intelligenceTitle: "పంట సమాచారం",
    intelligenceText: "పర్యావరణ కొలతలు మరియు పంట పరిశీలనలు.",
    observations: "పంట పరిశీలనలు", source: "డేటా మూలం",
    simulated: "సిమ్యులేటెడ్ డేటా", real: "నిజమైన సెన్సార్ డేటా",
    advisoryTitle: "AI వ్యవసాయ సలహా",
    advisoryText: "అందుబాటులో ఉన్న సెన్సార్ సమాచారం ఆధారంగా సూచనలు.",
    alerts: "హెచ్చరికలు", recommendations: "సిఫార్సులు",
    advisoryNotice: "ఇవి ప్రాథమిక సూచనలు మాత్రమే. నిర్ధారిత రోగ నిర్ధారణ లేదా పురుగుమందుల సూచనలు కావు.",
    sprayingTitle: "ఖచ్చితమైన పిచికారీ ప్రణాళిక",
    sprayingText: "పొలంలో పరిశీలన అవసరమయ్యే ప్రాంతాలను చూడండి.",
    field: "పొలం", zone: "జోన్", priority: "పరిశీలన ప్రాధాన్యత",
    approval: "మానవ అనుమతి అవసరం", pending: "సమీక్ష పెండింగ్‌లో ఉంది",
    noAuto: "ఈ నమూనాలో ఆటోమేటిక్ పిచికారీ నిలిపివేయబడింది.",
    zoneNotice: "జోన్లు సాధారణ పరిశీలన సూచనలు మాత్రమే. GPS స్థానం లేదా పొలం సరిహద్దు జత చేయలేదు.",
    recordsTitle: "సెన్సార్ రికార్డులు",
    recordsText: "తాజా పర్యావరణ కొలతలు.",
    metric: "కొలత", value: "విలువ", status: "స్థితి",
    home: "హోమ్", healthy: "వ్యవస్థ సిద్ధంగా ఉంది",
    error: "బ్యాకెండ్‌కు కనెక్ట్ కాలేకపోయింది. అది నడుస్తోందో లేదో తనిఖీ చేయండి.",
    chooseImage: "ముందుగా ఒక చిత్రాన్ని ఎంచుకోండి.",
    imageError: "చిత్ర విశ్లేషణ విఫలమైంది. మళ్లీ ప్రయత్నించండి.",
    noData: "ఇంకా డేటా అందుబాటులో లేదు.", notConnected: "కనెక్ట్ కాలేదు",
    lowConfidence: "తక్కువ విశ్వాస ఫలితం. స్పష్టమైన చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా వ్యవసాయ నిపుణుడిని సంప్రదించండి.",
    screeningNotice: "ఇది AI ప్రాథమిక పరీక్ష మాత్రమే. ఈ స్కోరు క్రమాంకనం చేసిన సంభావ్యత లేదా నిర్ధారిత రోగ నిర్ధారణ కాదు.",
    cropMismatch: "మోడల్ ప్రధాన తరగతి మీరు ఎంచుకున్న పంటతో సరిపోలలేదు. వ్యాధి ఫలితం చూపించలేదు.",
    planZone: "పరిశీలన నివేదికను రూపొందించండి", time: "సమయం",
    dataSource: "మూలం",
    explanation: "AI వ్యాధి వివరణ",
    meaning: "దీని అర్థం ఏమిటి?",
    symptoms: "పరిశీలించాల్సిన లక్షణాలు",
    causes: "సంభావ్య కారణాలు",
    nextSteps: "తదుపరి చర్యలు",
    healthyTitle: "మీ ఆకు ఆరోగ్యంగా కనిపిస్తోంది",
    healthyText: "మోడల్ ఈ ఆకును ఆరోగ్యంగా గుర్తించింది. నిర్దిష్ట వ్యాధి లక్షణాలు గుర్తించబడలేదు.",
    healthyAction: "పంటను క్రమం తప్పకుండా పరిశీలించండి. ఆకుల రెండు వైపులా మరియు కొత్త పెరుగుదలను గమనించండి.",
    disclaimer: "ఈ వివరణ మోడల్ ఫలితంపై ఆధారపడిన సాధారణ సమాచారం మాత్రమే. ఇది నిర్ధారిత రోగ నిర్ధారణ కాదు.",
    unknownTitle: "మరింత పరిశీలన అవసరం",
    unknownText: "ఈ మోడల్ తరగతికి ధృవీకరించిన వివరణ అందుబాటులో లేదు.",
    unknownAction: "స్పష్టమైన చిత్రాన్ని తీసి చికిత్స నిర్ణయం తీసుకునే ముందు వ్యవసాయ నిపుణుడిని సంప్రదించండి.",
    uncertainTitle: "ఫలితాన్ని నిర్ధారించాలి",
    uncertainText: "ఈ ఫలితంపై మోడల్‌కు తగినంత విశ్వాసం లేదు. వివరణ మొక్క యొక్క నిజమైన పరిస్థితికి సరిపోకపోవచ్చు.",
  },
};

// Disease label translations
const diseaseTranslations: Record<Exclude<Language, "en">, Record<string, string>> = {
  kn: {
    "Tomato with Early Blight": "ಟೊಮೇಟೊದಲ್ಲಿ ಆರಂಭಿಕ ಅಂಗಮಾರಿ ರೋಗ",
    "Tomato with Late Blight": "ಟೊಮೇಟೊದಲ್ಲಿ ತಡ ಅಂಗಮಾರಿ ರೋಗ",
    "Tomato with Leaf Mold": "ಟೊಮೇಟೊದಲ್ಲಿ ಎಲೆ ಅಚ್ಚು ರೋಗ",
    "Tomato healthy": "ಆರೋಗ್ಯಕರ ಟೊಮೇಟೊ",
    "Tomato with Bacterial Spot": "ಟೊಮೇಟೊದಲ್ಲಿ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಚುಕ್ಕೆ ರೋಗ",
    "Tomato with Septoria Leaf Spot": "ಟೊಮೇಟೊದಲ್ಲಿ ಸೆಪ್ಟೋರಿಯಾ ಎಲೆ ಚುಕ್ಕೆ ರೋಗ",
    "Tomato with Spider Mites": "ಟೊಮೇಟೊದಲ್ಲಿ ಜೇಡ ಹುಳುವಿನ ಹಾನಿ",
    "Tomato with Target Spot": "ಟೊಮೇಟೊದಲ್ಲಿ ಗುರಿ ಚುಕ್ಕೆ ರೋಗ",
    "Tomato with Yellow Leaf Curl Virus": "ಟೊಮೇಟೊದಲ್ಲಿ ಹಳದಿ ಎಲೆ ಮುದುಡುವ ವೈರಸ್",
    "Corn (Maize) with Common Rust": "ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಸಾಮಾನ್ಯ ತುಕ್ಕು ರೋಗ",
    "Corn (Maize) with Northern Leaf Blight": "ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಉತ್ತರದ ಎಲೆ ಅಂಗಮಾರಿ ರೋಗ",
    "Corn (Maize) with Cercospora Leaf Spot": "ಮೆಕ್ಕೆಜೋಳದಲ್ಲಿ ಸೆರ್ಕೋಸ್ಪೋರಾ ಎಲೆ ಚುಕ್ಕೆ ರೋಗ",
    "Corn (Maize) healthy": "ಆರೋಗ್ಯಕರ ಮೆಕ್ಕೆಜೋಳ",
    "Bell Pepper with Bacterial Spot": "ದೊಣ್ಣೆ ಮೆಣಸಿನಲ್ಲಿ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಚುಕ್ಕೆ ರೋಗ",
    "Bell Pepper healthy": "ಆರೋಗ್ಯಕರ ದೊಣ್ಣೆ ಮೆಣಸು",
    "Apple with Apple Scab": "ಸೇಬಿನಲ್ಲಿ ಆಪಲ್ ಸ್ಕ್ಯಾಬ್ ರೋಗ",
    "Apple with Black Rot": "ಸೇಬಿನಲ್ಲಿ ಕಪ್ಪು ಕೊಳೆ ರೋಗ",
    "Apple with Cedar Apple Rust": "ಸೇಬಿನಲ್ಲಿ ಸೀಡರ್ ತುಕ್ಕು ರೋಗ",
    "Apple healthy": "ಆರೋಗ್ಯಕರ ಸೇಬು",
    "Cherry with Powdery Mildew": "ಚೆರ್ರಿಯಲ್ಲಿ ಬೂದಿ ರೋಗ",
    "Cherry healthy": "ಆರೋಗ್ಯಕರ ಚೆರ್ರಿ",
    "Grape with Black Rot": "ದ್ರಾಕ್ಷಿಯಲ್ಲಿ ಕಪ್ಪು ಕೊಳೆ ರೋಗ",
    "Grape with Esca": "ದ್ರಾಕ್ಷಿಯಲ್ಲಿ ಎಸ್ಕಾ ರೋಗ",
    "Grape with Leaf Blight": "ದ್ರಾಕ್ಷಿಯಲ್ಲಿ ಎಲೆ ಅಂಗಮಾರಿ ರೋಗ",
    "Grape healthy": "ಆರೋಗ್ಯಕರ ದ್ರಾಕ್ಷಿ",
    "Peach with Bacterial Spot": "ಪೀಚ್‌ನಲ್ಲಿ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಚುಕ್ಕೆ ರೋಗ",
    "Peach healthy": "ಆರೋಗ್ಯಕರ ಪೀಚ್",
    "Strawberry with Leaf Scorch": "ಸ್ಟ್ರಾಬೆರಿಯಲ್ಲಿ ಎಲೆ ಸುಡುವ ರೋಗ",
    "Strawberry healthy": "ಆರೋಗ್ಯಕರ ಸ್ಟ್ರಾಬೆರಿ",
    "Potato with Early Blight": "ಆಲೂಗಡ್ಡೆಯಲ್ಲಿ ಆರಂಭಿಕ ಅಂಗಮಾರಿ ರೋಗ",
    "Potato with Late Blight": "ಆಲೂಗಡ್ಡೆಯಲ್ಲಿ ತಡ ಅಂಗಮಾರಿ ರೋಗ",
    "Potato healthy": "ಆರೋಗ್ಯಕರ ಆಲೂಗಡ್ಡೆ",
    "Raspberry healthy": "ಆರೋಗ್ಯಕರ ರಾಸ್ಪ್ಬೆರಿ",
    "Soybean healthy": "ಆರೋಗ್ಯಕರ ಸೋಯಾಬೀನ್",
    "Squash with Powdery Mildew": "ಕುಂಬಳಕಾಯಿಯಲ್ಲಿ ಬೂದಿ ರೋಗ",
  },
  hi: {
    "Tomato with Early Blight": "टमाटर में अर्ली ब्लाइट रोग",
    "Tomato with Late Blight": "टमाटर में लेट ब्लाइट रोग",
    "Tomato with Leaf Mold": "टमाटर में लीफ मोल्ड रोग",
    "Tomato healthy": "स्वस्थ टमाटर",
    "Tomato with Bacterial Spot": "टमाटर में जीवाणु धब्बा रोग",
    "Tomato with Septoria Leaf Spot": "टमाटर में सेप्टोरिया पत्ती धब्बा रोग",
    "Tomato with Spider Mites": "टमाटर में मकड़ी के कण का प्रकोप",
    "Tomato with Target Spot": "टमाटर में टारगेट स्पॉट रोग",
    "Tomato with Yellow Leaf Curl Virus": "टमाटर में पीली पत्ती मुड़ने वाला वायरस",
    "Corn (Maize) with Common Rust": "मक्का में सामान्य रतुआ रोग",
    "Corn (Maize) with Northern Leaf Blight": "मक्का में उत्तरी पत्ती झुलसा रोग",
    "Corn (Maize) with Cercospora Leaf Spot": "मक्का में सर्कोस्पोरा पत्ती धब्बा रोग",
    "Corn (Maize) healthy": "स्वस्थ मक्का",
    "Bell Pepper with Bacterial Spot": "शिमला मिर्च में जीवाणु धब्बा रोग",
    "Bell Pepper healthy": "स्वस्थ शिमला मिर्च",
    "Apple with Apple Scab": "सेब में एप्पल स्कैब रोग",
    "Apple with Black Rot": "सेब में काला सड़न रोग",
    "Apple with Cedar Apple Rust": "सेब में सीडर रतुआ रोग",
    "Apple healthy": "स्वस्थ सेब",
    "Cherry with Powdery Mildew": "चेरी में चूर्णिल आसिता रोग",
    "Cherry healthy": "स्वस्थ चेरी",
    "Grape with Black Rot": "अंगूर में काला सड़न रोग",
    "Grape with Esca": "अंगूर में एस्का रोग",
    "Grape with Leaf Blight": "अंगूर में पत्ती झुलसा रोग",
    "Grape healthy": "स्वस्थ अंगूर",
    "Peach with Bacterial Spot": "आड़ू में जीवाणु धब्बा रोग",
    "Peach healthy": "स्वस्थ आड़ू",
    "Strawberry with Leaf Scorch": "स्ट्रॉबेरी में पत्ती झुलसा रोग",
    "Strawberry healthy": "स्वस्थ स्ट्रॉबेरी",
    "Potato with Early Blight": "आलू में अर्ली ब्लाइट रोग",
    "Potato with Late Blight": "आलू में लेट ब्लाइट रोग",
    "Potato healthy": "स्वस्थ आलू",
    "Raspberry healthy": "स्वस्थ रास्पबेरी",
    "Soybean healthy": "स्वस्थ सोयाबीन",
    "Squash with Powdery Mildew": "स्क्वैश में चूर्णिल आसिता रोग",
  },
  ml: {
    "Tomato with Early Blight": "തക്കാളിയിലെ ആദ്യകാല ബ്ലൈറ്റ് രോഗം",
    "Tomato with Late Blight": "തക്കാളിയിലെ വൈകിയ ബ്ലൈറ്റ് രോഗം",
    "Tomato with Leaf Mold": "തക്കാളിയിലെ ഇല പൂപ്പൽ രോഗം",
    "Tomato healthy": "ആരോഗ്യമുള്ള തക്കാളി",
    "Tomato with Bacterial Spot": "തക്കാളിയിലെ ബാക്ടീരിയൽ പുള്ളി രോഗം",
    "Tomato with Septoria Leaf Spot": "തക്കാളിയിലെ സെപ്റ്റോറിയ ഇല പുള്ളി രോഗം",
    "Tomato with Spider Mites": "തക്കാളിയിലെ ചിലന്തി മൂലമുള്ള കേടുപാട്",
    "Tomato with Target Spot": "തക്കാളിയിലെ ടാർഗറ്റ് സ്പോട്ട് രോഗം",
    "Tomato with Yellow Leaf Curl Virus": "തക്കാളിയിലെ മഞ്ഞ ഇല ചുരുളൽ വൈറസ്",
    "Corn (Maize) with Common Rust": "ചോളത്തിലെ സാധാരണ തുരുമ്പ് രോഗം",
    "Corn (Maize) with Northern Leaf Blight": "ചോളത്തിലെ വടക്കൻ ഇല കരിച്ചിൽ രോഗം",
    "Corn (Maize) with Cercospora Leaf Spot": "ചോളത്തിലെ സെർകോസ്പോറ ഇല പുള്ളി രോഗം",
    "Corn (Maize) healthy": "ആരോഗ്യമുള്ള ചോളം",
    "Bell Pepper with Bacterial Spot": "കാപ്സിക്കത്തിലെ ബാക്ടീരിയൽ പുള്ളി രോഗം",
    "Bell Pepper healthy": "ആരോഗ്യമുള്ള കാപ്സിക്കം",
    "Apple with Apple Scab": "ആപ്പിളിലെ സ്കാബ് രോഗം",
    "Apple with Black Rot": "ആപ്പിളിലെ കറുത്ത ചീയൽ രോഗം",
    "Apple with Cedar Apple Rust": "ആപ്പിളിലെ സീഡർ തുരുമ്പ് രോഗം",
    "Apple healthy": "ആരോഗ്യമുള്ള ആപ്പിൾ",
    "Cherry with Powdery Mildew": "ചെറിയിലെ പൊടിപൂപ്പൽ രോഗം",
    "Cherry healthy": "ആരോഗ്യമുള്ള ചെറി",
    "Grape with Black Rot": "മുന്തിരിയിലെ കറുത്ത ചീയൽ രോഗം",
    "Grape with Esca": "മുന്തിരിയിലെ എസ്ക രോഗം",
    "Grape with Leaf Blight": "മുന്തിരിയിലെ ഇല കരിച്ചിൽ രോഗം",
    "Grape healthy": "ആരോഗ്യമുള്ള മുന്തിരി",
    "Peach with Bacterial Spot": "പീച്ചിലെ ബാക്ടീരിയൽ പുള്ളി രോഗം",
    "Peach healthy": "ആരോഗ്യമുള്ള പീച്ച്",
    "Strawberry with Leaf Scorch": "സ്ട്രോബെറിയിലെ ഇല കരിച്ചിൽ രോഗം",
    "Strawberry healthy": "ആരോഗ്യമുള്ള സ്ട്രോബെറി",
    "Potato with Early Blight": "ഉരുളക്കിഴങ്ങിലെ ആദ്യകാല ബ്ലൈറ്റ് രോഗം",
    "Potato with Late Blight": "ഉരുളക്കിഴങ്ങിലെ വൈകിയ ബ്ലൈറ്റ് രോഗം",
    "Potato healthy": "ആരോഗ്യമുള്ള ഉരുളക്കിഴങ്ങ്",
    "Raspberry healthy": "ആരോഗ്യമുള്ള റാസ്ബെറി",
    "Soybean healthy": "ആരോഗ്യമുള്ള സോയാബീൻ",
    "Squash with Powdery Mildew": "സ്ക്വാഷിലെ പൊടിപൂപ്പൽ രോഗം",
  },
  ta: {
    "Tomato with Early Blight": "தக்காளியில் ஆரம்பகால கருகல் நோய்",
    "Tomato with Late Blight": "தக்காளியில் தாமதமான கருகல் நோய்",
    "Tomato with Leaf Mold": "தக்காளி இலை அச்சு நோய்",
    "Tomato healthy": "ஆரோக்கியமான தக்காளி",
    "Tomato with Bacterial Spot": "தக்காளியில் பாக்டீரியா புள்ளி நோய்",
    "Tomato with Septoria Leaf Spot": "தக்காளியில் செப்டோரியா இலைப்புள்ளி நோய்",
    "Tomato with Spider Mites": "தக்காளியில் சிலந்திப் பூச்சி தாக்குதல்",
    "Tomato with Target Spot": "தக்காளியில் இலக்கு புள்ளி நோய்",
    "Tomato with Yellow Leaf Curl Virus": "தக்காளியில் மஞ்சள் இலை சுருள் வைரஸ்",
    "Corn (Maize) with Common Rust": "மக்காச்சோளத்தில் பொதுவான துரு நோய்",
    "Corn (Maize) with Northern Leaf Blight": "மக்காச்சோளத்தில் வடக்கு இலை கருகல் நோய்",
    "Corn (Maize) with Cercospora Leaf Spot": "மக்காச்சோளத்தில் செர்கோஸ்போரா இலைப்புள்ளி நோய்",
    "Corn (Maize) healthy": "ஆரோக்கியமான மக்காச்சோளம்",
    "Bell Pepper with Bacterial Spot": "குடைமிளகாயில் பாக்டீரியா புள்ளி நோய்",
    "Bell Pepper healthy": "ஆரோக்கியமான குடைமிளகாய்",
    "Apple with Apple Scab": "ஆப்பிளில் ஸ்கேப் நோய்",
    "Apple with Black Rot": "ஆப்பிளில் கருப்பு அழுகல் நோய்",
    "Apple with Cedar Apple Rust": "ஆப்பிளில் சிடார் துரு நோய்",
    "Apple healthy": "ஆரோக்கியமான ஆப்பிள்",
    "Cherry with Powdery Mildew": "செர்ரியில் மாவுப்பூஞ்சை நோய்",
    "Cherry healthy": "ஆரோக்கியமான செர்ரி",
    "Grape with Black Rot": "திராட்சையில் கருப்பு அழுகல் நோய்",
    "Grape with Esca": "திராட்சையில் எஸ்கா நோய்",
    "Grape with Leaf Blight": "திராட்சையில் இலை கருகல் நோய்",
    "Grape healthy": "ஆரோக்கியமான திராட்சை",
    "Peach with Bacterial Spot": "பீச்சில் பாக்டீரியா புள்ளி நோய்",
    "Peach healthy": "ஆரோக்கியமான பீச்",
    "Strawberry with Leaf Scorch": "ஸ்ட்ராபெர்ரியில் இலை கருகல் நோய்",
    "Strawberry healthy": "ஆரோக்கியமான ஸ்ட்ராபெர்ரி",
    "Potato with Early Blight": "உருளைக்கிழங்கில் ஆரம்பகால கருகல் நோய்",
    "Potato with Late Blight": "உருளைக்கிழங்கில் தாமதமான கருகல் நோய்",
    "Potato healthy": "ஆரோக்கியமான உருளைக்கிழங்கு",
    "Raspberry healthy": "ஆரோக்கியமான ராஸ்பெர்ரி",
    "Soybean healthy": "ஆரோக்கியமான சோயாபீன்",
    "Squash with Powdery Mildew": "ஸ்குவாஷில் மாவுப்பூஞ்சை நோய்",
  },
  te: {
    "Tomato with Early Blight": "టమాటాలో ఎర్లీ బ్లైట్ వ్యాధి",
    "Tomato with Late Blight": "టమాటాలో లేట్ బ్లైట్ వ్యాధి",
    "Tomato with Leaf Mold": "టమాటాలో ఆకు బూజు వ్యాధి",
    "Tomato healthy": "ఆరోగ్యకరమైన టమాటా",
    "Tomato with Bacterial Spot": "టమాటాలో బ్యాక్టీరియా మచ్చల వ్యాధి",
    "Tomato with Septoria Leaf Spot": "టమాటాలో సెప్టోరియా ఆకు మచ్చల వ్యాధి",
    "Tomato with Spider Mites": "టమాటాలో సాలీడు పురుగుల దాడి",
    "Tomato with Target Spot": "టమాటాలో టార్గెట్ స్పాట్ వ్యాధి",
    "Tomato with Yellow Leaf Curl Virus": "టమాటాలో పసుపు ఆకు ముడత వైరస్",
    "Corn (Maize) with Common Rust": "మొక్కజొన్నలో సాధారణ తుప్పు వ్యాధి",
    "Corn (Maize) with Northern Leaf Blight": "మొక్కజొన్నలో ఉత్తర ఆకు ఎండు తెగులు",
    "Corn (Maize) with Cercospora Leaf Spot": "మొక్కజొన్నలో సెర్కోస్పోరా ఆకు మచ్చల వ్యాధి",
    "Corn (Maize) healthy": "ఆరోగ్యకరమైన మొక్కజొన్న",
    "Bell Pepper with Bacterial Spot": "క్యాప్సికంలో బ్యాక్టీరియా మచ్చల వ్యాధి",
    "Bell Pepper healthy": "ఆరోగ్యకరమైన క్యాప్సికం",
    "Apple with Apple Scab": "ఆపిల్‌లో స్కాబ్ వ్యాధి",
    "Apple with Black Rot": "ఆపిల్‌లో నల్ల కుళ్ళు వ్యాధి",
    "Apple with Cedar Apple Rust": "ఆపిల్‌లో సీడర్ తుప్పు వ్యాధి",
    "Apple healthy": "ఆరోగ్యకరమైన ఆపిల్",
    "Cherry with Powdery Mildew": "చెర్రీలో బూజు తెగులు",
    "Cherry healthy": "ఆరోగ్యకరమైన చెర్రీ",
    "Grape with Black Rot": "ద్రాక్షలో నల్ల కుళ్ళు వ్యాధి",
    "Grape with Esca": "ద్రాక్షలో ఎస్కా వ్యాధి",
    "Grape with Leaf Blight": "ద్రాక్షలో ఆకు ఎండు తెగులు",
    "Grape healthy": "ఆరోగ్యకరమైన ద్రాక్ష",
    "Peach with Bacterial Spot": "పీచ్‌లో బ్యాక్టీరియా మచ్చల వ్యాధి",
    "Peach healthy": "ఆరోగ్యకరమైన పీచ్",
    "Strawberry with Leaf Scorch": "స్ట్రాబెర్రీలో ఆకు ఎండు తెగులు",
    "Strawberry healthy": "ఆరోగ్యకరమైన స్ట్రాబెర్రీ",
    "Potato with Early Blight": "బంగాళాదుంపలో ఎర్లీ బ్లైట్ వ్యాధి",
    "Potato with Late Blight": "బంగాళాదుంపలో లేట్ బ్లైట్ వ్యాధి",
    "Potato healthy": "ఆరోగ్యకరమైన బంగాళాదుంప",
    "Raspberry healthy": "ఆరోగ్యకరమైన రాస్ప్‌బెర్రీ",
    "Soybean healthy": "ఆరోగ్యకరమైన సోయాబీన్",
    "Squash with Powdery Mildew": "స్క్వాష్‌లో బూజు తెగులు",
  },
};

const advisoryTranslations: Record<Exclude<Language, "en">, Record<string, string>> = {
  kn: {
    "High temperature detected.": "ಹೆಚ್ಚಿನ ತಾಪಮಾನ ಪತ್ತೆಯಾಗಿದೆ.",
    "High soil moisture detected.": "ಮಣ್ಣಿನಲ್ಲಿ ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಪತ್ತೆಯಾಗಿದೆ.",
    "Monitor the crop for heat stress and check irrigation needs.": "ಬೆಳೆಯಲ್ಲಿ ಉಷ್ಣ ಒತ್ತಡವಿದೆಯೇ ಗಮನಿಸಿ ಮತ್ತು ನೀರಾವರಿ ಅಗತ್ಯವನ್ನು ಪರಿಶೀಲಿಸಿ.",
    "Check for waterlogging and ensure proper field drainage.": "ನೀರು ನಿಲ್ಲುವ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಹೊಲದಲ್ಲಿ ಸರಿಯಾದ ಒಳಚರಂಡಿ ವ್ಯವಸ್ಥೆ ಖಚಿತಪಡಿಸಿ.",
  },
  hi: {
    "High temperature detected.": "उच्च तापमान पाया गया।",
    "High soil moisture detected.": "मिट्टी में अधिक नमी पाई गई।",
    "Monitor the crop for heat stress and check irrigation needs.": "फसल में गर्मी के तनाव पर नज़र रखें और सिंचाई की आवश्यकता जाँचें।",
    "Check for waterlogging and ensure proper field drainage.": "जलभराव की जाँच करें और खेत में उचित जल निकासी सुनिश्चित करें।",
  },
  ml: {
    "High temperature detected.": "ഉയർന്ന താപനില കണ്ടെത്തി.",
    "High soil moisture detected.": "മണ്ണിൽ ഉയർന്ന ഈർപ്പം കണ്ടെത്തി.",
    "Monitor the crop for heat stress and check irrigation needs.": "വിളയിലെ ചൂട് സമ്മർദ്ദം നിരീക്ഷിക്കുകയും ജലസേചന ആവശ്യം പരിശോധിക്കുകയും ചെയ്യുക.",
    "Check for waterlogging and ensure proper field drainage.": "വെള്ളക്കെട്ട് പരിശോധിക്കുകയും കൃഷിയിടത്തിൽ ശരിയായ നീർവാർച്ച ഉറപ്പാക്കുകയും ചെയ്യുക.",
  },
  ta: {
    "High temperature detected.": "அதிக வெப்பநிலை கண்டறியப்பட்டது.",
    "High soil moisture detected.": "மண்ணில் அதிக ஈரப்பதம் கண்டறியப்பட்டது.",
    "Monitor the crop for heat stress and check irrigation needs.": "பயிரில் வெப்ப அழுத்தம் உள்ளதா எனக் கண்காணித்து நீர்ப்பாசனத் தேவையைச் சரிபார்க்கவும்.",
    "Check for waterlogging and ensure proper field drainage.": "நீர் தேங்குகிறதா எனச் சரிபார்த்து வயலில் சரியான வடிகால் வசதியை உறுதிசெய்யவும்.",
  },
  te: {
    "High temperature detected.": "అధిక ఉష్ణోగ్రత గుర్తించబడింది.",
    "High soil moisture detected.": "నేలలో అధిక తేమ గుర్తించబడింది.",
    "Monitor the crop for heat stress and check irrigation needs.": "పంటలో వేడి ఒత్తిడిని గమనించి నీటిపారుదల అవసరాన్ని తనిఖీ చేయండి.",
    "Check for waterlogging and ensure proper field drainage.": "నీరు నిలిచే సమస్యను తనిఖీ చేసి పొలంలో సరైన నీటి పారుదల ఉండేలా చూడండి.",
  },
};

// Curated educational explanations for known model classes.
// These explanations are not generated by the image classifier.
type DiseaseGuide = {
  category: "healthy" | "fungal" | "bacterial" | "viral" | "pest" | "unknown";
  meaning: string;
  symptoms: string;
  causes: string;
  action: string;
};

const diseaseGuides: Record<Language, Record<DiseaseGuide["category"], Omit<DiseaseGuide, "category">>> = {
  en: {
    healthy: {
      meaning: "The model classified this leaf as healthy. No specific disease pattern was identified.",
      symptoms: "No clear disease pattern was identified by the model. Continue checking for unusual spots, yellowing or wilting.",
      causes: "No specific disease cause was identified in this result.",
      action: "Continue regular field monitoring. Check both sides of leaves and observe new growth."
    },
    fungal: {
      meaning: "The model detected a fungal-type disease pattern. Fungal infections can damage leaf tissue and affect plant growth.",
      symptoms: "Possible signs include brown or dark spots, yellowing, dry patches, leaf blight or powder-like growth.",
      causes: "Fungal diseases can spread through infected plant material, spores, moisture and favourable environmental conditions.",
      action: "Remove severely affected leaves where practical, avoid unnecessary overhead watering, improve airflow and monitor nearby plants."
    },
    bacterial: {
      meaning: "The model detected a bacterial-type disease pattern. Bacterial infections can cause damaged areas on leaves.",
      symptoms: "Possible signs include dark or water-soaked spots, yellow edges and damaged leaf tissue.",
      causes: "Bacteria can spread through infected plant material, contaminated tools, splashing water and wounds on plants.",
      action: "Avoid handling wet plants, clean tools, remove severely affected material where practical and seek local agricultural advice."
    },
    viral: {
      meaning: "The model detected a possible viral disease pattern. Plant viruses can affect leaf shape, colour and overall growth.",
      symptoms: "Possible signs include yellowing, curled leaves, unusual colour patterns and stunted growth.",
      causes: "Some plant viruses spread through infected planting material or insect vectors such as whiteflies and aphids.",
      action: "Inspect nearby plants and check for insect activity. Ask an agricultural expert to confirm the result before taking action."
    },
    pest: {
      meaning: "The model detected a possible pest-related damage pattern.",
      symptoms: "Look for tiny insects, fine webbing, pale spots or stippling on the leaf surface.",
      causes: "Pest damage may be associated with mites or other small insects feeding on leaf tissue.",
      action: "Inspect the underside of leaves carefully and monitor the spread. Seek local agricultural advice before choosing a control method."
    },
    unknown: {
      meaning: "The model returned a disease class, but AgriMind AI does not have a verified explanation for this particular class.",
      symptoms: "The exact symptoms cannot be reliably described from this model result alone.",
      causes: "The cause cannot be determined safely from the available model label.",
      action: "Take a clearer photograph and consult an agricultural expert for confirmation."
    }
  },

  kn: {
    healthy: {
      meaning: "ಮಾದರಿಯು ಈ ಎಲೆಯನ್ನು ಆರೋಗ್ಯಕರವೆಂದು ಗುರುತಿಸಿದೆ. ನಿರ್ದಿಷ್ಟ ರೋಗದ ಲಕ್ಷಣ ಕಂಡುಬಂದಿಲ್ಲ.",
      symptoms: "ಮಾದರಿಯು ಸ್ಪಷ್ಟವಾದ ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ಗುರುತಿಸಿಲ್ಲ. ಆದರೂ ಚುಕ್ಕೆಗಳು, ಹಳದಿ ಬಣ್ಣ ಅಥವಾ ಒಣಗುವಿಕೆಯನ್ನು ಗಮನಿಸಿ.",
      causes: "ಈ ಫಲಿತಾಂಶದಲ್ಲಿ ನಿರ್ದಿಷ್ಟ ರೋಗದ ಕಾರಣ ಕಂಡುಬಂದಿಲ್ಲ.",
      action: "ಬೆಳೆಯನ್ನು ನಿಯಮಿತವಾಗಿ ಗಮನಿಸಿ. ಎಲೆಗಳ ಎರಡೂ ಬದಿಗಳನ್ನು ಮತ್ತು ಹೊಸ ಬೆಳವಣಿಗೆಯನ್ನು ಪರಿಶೀಲಿಸಿ."
    },
    fungal: {
      meaning: "ಮಾದರಿಯು ಶಿಲೀಂಧ್ರದಿಂದ ಉಂಟಾಗಬಹುದಾದ ಎಲೆ ರೋಗವನ್ನು ಗುರುತಿಸಿದೆ. ಇದು ಎಲೆಗಳ ಅಂಗಾಂಶಕ್ಕೆ ಹಾನಿ ಮಾಡಬಹುದು.",
      symptoms: "ಕಂದು ಅಥವಾ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು, ಹಳದಿ ಬಣ್ಣ, ಒಣಗಿದ ಭಾಗಗಳು ಅಥವಾ ಬಿಳಿ ಪುಡಿಯಂತಹ ಪದರ ಕಾಣಿಸಬಹುದು.",
      causes: "ಸೋಂಕಿತ ಸಸ್ಯ ಭಾಗಗಳು, ಶಿಲೀಂಧ್ರ ಬೀಜಕಗಳು, ತೇವಾಂಶ ಮತ್ತು ಅನುಕೂಲಕರ ಹವಾಮಾನದಿಂದ ಈ ರೋಗ ಹರಡಬಹುದು.",
      action: "ತೀವ್ರವಾಗಿ ಹಾನಿಗೊಳಗಾದ ಎಲೆಗಳನ್ನು ಸಾಧ್ಯವಾದರೆ ತೆಗೆದುಹಾಕಿ. ಗಾಳಿಯ ಸಂಚಾರ ಸುಧಾರಿಸಿ ಮತ್ತು ಸುತ್ತಲಿನ ಗಿಡಗಳನ್ನು ಗಮನಿಸಿ."
    },
    bacterial: {
      meaning: "ಮಾದರಿಯು ಬ್ಯಾಕ್ಟೀರಿಯಾದಿಂದ ಉಂಟಾಗಬಹುದಾದ ಎಲೆ ರೋಗವನ್ನು ಗುರುತಿಸಿದೆ.",
      symptoms: "ಕಪ್ಪು ಅಥವಾ ನೀರು ತುಂಬಿದಂತೆ ಕಾಣುವ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಎಲೆಗಳ ಹಳದಿ ಅಂಚುಗಳು ಕಾಣಿಸಬಹುದು.",
      causes: "ಸೋಂಕಿತ ಸಸ್ಯ ಭಾಗಗಳು, ಕಲುಷಿತ ಉಪಕರಣಗಳು, ನೀರಿನ ಸಿಂಚನ ಮತ್ತು ಸಸ್ಯದ ಗಾಯಗಳಿಂದ ಬ್ಯಾಕ್ಟೀರಿಯಾ ಹರಡಬಹುದು.",
      action: "ಒದ್ದೆಯಾದ ಗಿಡಗಳನ್ನು ಮುಟ್ಟುವುದನ್ನು ತಪ್ಪಿಸಿ. ಉಪಕರಣಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ ಮತ್ತು ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ."
    },
    viral: {
      meaning: "ಮಾದರಿಯು ವೈರಸ್‌ನಿಂದ ಉಂಟಾಗಬಹುದಾದ ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ಗುರುತಿಸಿದೆ. ಇದು ಎಲೆಗಳ ಬಣ್ಣ ಮತ್ತು ಆಕಾರದ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು.",
      symptoms: "ಎಲೆ ಹಳದಿಯಾಗುವುದು, ಮುದುಡುವುದು, ಬಣ್ಣದ ಮಾದರಿಗಳು ಬದಲಾಗುವುದು ಮತ್ತು ಗಿಡದ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುವುದು ಕಂಡುಬರಬಹುದು.",
      causes: "ಸೋಂಕಿತ ಸಸ್ಯ ವಸ್ತುಗಳು ಅಥವಾ ಬಿಳಿ ನೊಣ ಮತ್ತು ಆಫಿಡ್‌ಗಳಂತಹ ಕೀಟಗಳ ಮೂಲಕ ಕೆಲವು ವೈರಸ್‌ಗಳು ಹರಡಬಹುದು.",
      action: "ಹತ್ತಿರದ ಗಿಡಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಕೃಷಿ ತಜ್ಞರಿಂದ ದೃಢೀಕರಣ ಪಡೆಯಿರಿ."
    },
    pest: {
      meaning: "ಮಾದರಿಯು ಕೀಟಗಳಿಂದ ಉಂಟಾಗಿರಬಹುದಾದ ಹಾನಿಯನ್ನು ಗುರುತಿಸಿದೆ.",
      symptoms: "ಸಣ್ಣ ಕೀಟಗಳು, ಸೂಕ್ಷ್ಮ ಜಾಲಗಳು ಅಥವಾ ಎಲೆಗಳ ಮೇಲೆ ಸಣ್ಣ ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಬಹುದು.",
      causes: "ಸಣ್ಣ ಹುಳಗಳು ಅಥವಾ ಇತರ ಕೀಟಗಳು ಎಲೆಗಳ ಅಂಗಾಂಶವನ್ನು ತಿನ್ನುವುದರಿಂದ ಹಾನಿ ಉಂಟಾಗಬಹುದು.",
      action: "ಎಲೆಗಳ ಕೆಳಭಾಗವನ್ನು ಪರಿಶೀಲಿಸಿ. ಯಾವುದೇ ನಿಯಂತ್ರಣ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ."
    },
    unknown: {
      meaning: "ಮಾದರಿಯು ಒಂದು ರೋಗದ ವರ್ಗವನ್ನು ತೋರಿಸಿದೆ. ಆದರೆ ಈ ವರ್ಗಕ್ಕೆ ಪರಿಶೀಲಿತ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ.",
      symptoms: "ಈ ಫಲಿತಾಂಶದಿಂದ ನಿಖರವಾದ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
      causes: "ಲಭ್ಯವಿರುವ ಮಾದರಿಯ ಹೆಸರಿನಿಂದ ಕಾರಣವನ್ನು ಖಚಿತವಾಗಿ ನಿರ್ಧರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
      action: "ಸ್ಪಷ್ಟವಾದ ಚಿತ್ರವನ್ನು ತೆಗೆದು ಕೃಷಿ ತಜ್ಞರಿಂದ ಪರಿಶೀಲಿಸಿ."
    }
  },

  hi: {
    healthy: {
      meaning: "मॉडल ने इस पत्ती को स्वस्थ बताया है। किसी विशेष रोग का स्पष्ट संकेत नहीं मिला।",
      symptoms: "मॉडल को रोग के स्पष्ट लक्षण नहीं मिले। फिर भी धब्बे, पीलापन और मुरझाने पर ध्यान दें।",
      causes: "इस परिणाम में किसी विशेष रोग का कारण नहीं पहचाना गया।",
      action: "फसल की नियमित निगरानी करें। पत्तियों के दोनों तरफ और नई वृद्धि को देखें।"
    },
    fungal: {
      meaning: "मॉडल ने फफूंद से संबंधित संभावित पत्ती रोग पहचाना है। इससे पत्तियों के ऊतकों को नुकसान हो सकता है।",
      symptoms: "भूरे या काले धब्बे, पीलापन, सूखे हिस्से, पत्ती झुलसना या सफेद पाउडर जैसी परत दिख सकती है।",
      causes: "यह रोग संक्रमित पौधों के हिस्सों, फफूंद के बीजाणुओं, नमी और अनुकूल मौसम से फैल सकता है।",
      action: "बहुत प्रभावित पत्तियों को जहाँ संभव हो हटाएँ। हवा का अच्छा प्रवाह रखें और आसपास के पौधों पर नजर रखें।"
    },
    bacterial: {
      meaning: "मॉडल ने बैक्टीरिया से संबंधित संभावित पत्ती रोग पहचाना है।",
      symptoms: "गहरे या पानी जैसे धब्बे, पीले किनारे और पत्तियों के ऊतकों को नुकसान दिखाई दे सकता है।",
      causes: "बैक्टीरिया संक्रमित पौधों, दूषित औजारों, पानी के छींटों और पौधों के घावों से फैल सकते हैं।",
      action: "गीले पौधों को छूने से बचें। औजार साफ रखें और कृषि विशेषज्ञ से सलाह लें।"
    },
    viral: {
      meaning: "मॉडल ने वायरस से संबंधित संभावित रोग के लक्षण पहचाने हैं। इससे पत्तियों का रंग और आकार बदल सकता है।",
      symptoms: "पत्तियों का पीला होना, मुड़ना, असामान्य रंग के पैटर्न और पौधे की वृद्धि धीमी होना संभव है।",
      causes: "कुछ पौधों के वायरस संक्रमित रोपण सामग्री या सफेद मक्खी और एफिड जैसे कीटों से फैल सकते हैं।",
      action: "आसपास के पौधों की जाँच करें। कोई कदम उठाने से पहले कृषि विशेषज्ञ से पुष्टि करें।"
    },
    pest: {
      meaning: "मॉडल ने कीटों से होने वाली संभावित क्षति पहचानी है।",
      symptoms: "छोटे कीड़े, महीन जाले या पत्तियों पर छोटे हल्के धब्बे दिखाई दे सकते हैं।",
      causes: "माइट या अन्य छोटे कीट पत्तियों के ऊतकों को खाकर नुकसान पहुँचा सकते हैं।",
      action: "पत्तियों के नीचे की तरफ जाँच करें और नियंत्रण का तरीका चुनने से पहले कृषि विशेषज्ञ से सलाह लें।"
    },
    unknown: {
      meaning: "मॉडल ने एक रोग श्रेणी बताई है, लेकिन इस श्रेणी की सत्यापित जानकारी उपलब्ध नहीं है।",
      symptoms: "इस परिणाम से सटीक लक्षण बताना संभव नहीं है।",
      causes: "मॉडल के उपलब्ध नाम से कारण की पुष्टि नहीं की जा सकती।",
      action: "एक साफ तस्वीर लें और कृषि विशेषज्ञ से जाँच करवाएँ।"
    }
  },

  ml: {
    healthy: {
      meaning: "ഈ ഇലയെ മോഡൽ ആരോഗ്യകരമായി തിരിച്ചറിഞ്ഞു. പ്രത്യേക രോഗലക്ഷണങ്ങൾ കണ്ടെത്തിയിട്ടില്ല.",
      symptoms: "വ്യക്തമായ രോഗലക്ഷണങ്ങൾ മോഡൽ കണ്ടെത്തിയിട്ടില്ല. എങ്കിലും പാടുകൾ, മഞ്ഞനിറം, വാടൽ എന്നിവ ശ്രദ്ധിക്കുക.",
      causes: "ഈ ഫലത്തിൽ പ്രത്യേക രോഗകാരണം കണ്ടെത്തിയിട്ടില്ല.",
      action: "വിള പതിവായി നിരീക്ഷിക്കുക. ഇലകളുടെ ഇരുവശവും പുതിയ വളർച്ചയും പരിശോധിക്കുക."
    },
    fungal: {
      meaning: "ഫംഗസ് മൂലമുള്ള ഇലരോഗത്തിന്റെ സാധ്യത മോഡൽ കണ്ടെത്തി. ഇത് ഇലകളുടെ കോശങ്ങൾക്ക് കേടുവരുത്താം.",
      symptoms: "തവിട്ട് അല്ലെങ്കിൽ കറുത്ത പാടുകൾ, മഞ്ഞനിറം, ഉണങ്ങിയ ഭാഗങ്ങൾ, ഇല കരിച്ചിൽ അല്ലെങ്കിൽ വെളുത്ത പൊടിപോലുള്ള പാളി എന്നിവ കാണാം.",
      causes: "രോഗബാധിത സസ്യഭാഗങ്ങൾ, ഫംഗസ് ബീജങ്ങൾ, ഈർപ്പം, അനുകൂല കാലാവസ്ഥ എന്നിവയിലൂടെ രോഗം പടരാം.",
      action: "കൂടുതൽ ബാധിച്ച ഇലകൾ കഴിയുമെങ്കിൽ നീക്കം ചെയ്യുക. വായുസഞ്ചാരം മെച്ചപ്പെടുത്തുകയും സമീപത്തെ ചെടികൾ നിരീക്ഷിക്കുകയും ചെയ്യുക."
    },
    bacterial: {
      meaning: "ബാക്ടീരിയ മൂലമുള്ള ഇലരോഗത്തിന്റെ സാധ്യത മോഡൽ കണ്ടെത്തി.",
      symptoms: "ഇരുണ്ട പാടുകൾ, വെള്ളം നിറഞ്ഞതുപോലുള്ള പാടുകൾ, ഇലയുടെ അരികിലെ മഞ്ഞനിറം എന്നിവ കാണാം.",
      causes: "രോഗബാധിത സസ്യഭാഗങ്ങൾ, മലിനമായ ഉപകരണങ്ങൾ, വെള്ളത്തിന്റെ ചിതറൽ, ചെടികളിലെ മുറിവുകൾ എന്നിവയിലൂടെ ബാക്ടീരിയ പടരാം.",
      action: "നനഞ്ഞ ചെടികൾ കൈകാര്യം ചെയ്യുന്നത് ഒഴിവാക്കുക. ഉപകരണങ്ങൾ വൃത്തിയാക്കി കാർഷിക വിദഗ്ധന്റെ ഉപദേശം തേടുക."
    },
    viral: {
      meaning: "വൈറസ് മൂലമുള്ള രോഗലക്ഷണങ്ങളുടെ സാധ്യത മോഡൽ കണ്ടെത്തി. ഇത് ഇലയുടെ നിറത്തെയും ആകൃതിയെയും ബാധിക്കാം.",
      symptoms: "ഇല മഞ്ഞനിറമാകുക, ചുരുളുക, അസാധാരണമായ നിറവ്യത്യാസങ്ങൾ, ചെടിയുടെ വളർച്ച കുറയുക എന്നിവ സംഭവിക്കാം.",
      causes: "രോഗബാധിത നടീൽ വസ്തുക്കളിലൂടെയോ വെള്ളീച്ച, മുഞ്ഞ പോലുള്ള കീടങ്ങളിലൂടെയോ ചില വൈറസുകൾ പടരാം.",
      action: "സമീപത്തെ ചെടികൾ പരിശോധിക്കുക. നടപടികൾ സ്വീകരിക്കുന്നതിന് മുമ്പ് വിദഗ്ധന്റെ സ്ഥിരീകരണം തേടുക."
    },
    pest: {
      meaning: "കീടങ്ങൾ മൂലമുള്ള നാശത്തിന്റെ സാധ്യത മോഡൽ കണ്ടെത്തി.",
      symptoms: "ചെറിയ കീടങ്ങൾ, നേർത്ത വലകൾ, ഇലകളിലെ ചെറിയ നിറംമങ്ങിയ പാടുകൾ എന്നിവ കാണാം.",
      causes: "ചെറിയ ചിലന്തിക്കീടങ്ങളോ മറ്റ് ചെറിയ കീടങ്ങളോ ഇലകളുടെ കോശങ്ങൾ ഭക്ഷിക്കുന്നതിലൂടെ നാശമുണ്ടാക്കാം.",
      action: "ഇലകളുടെ അടിവശം പരിശോധിക്കുക. നിയന്ത്രണ മാർഗം തിരഞ്ഞെടുക്കുന്നതിന് മുമ്പ് കാർഷിക വിദഗ്ധനെ സമീപിക്കുക."
    },
    unknown: {
      meaning: "മോഡൽ ഒരു രോഗവിഭാഗം നൽകിയിട്ടുണ്ട്. എന്നാൽ ഈ വിഭാഗത്തിന് സ്ഥിരീകരിച്ച വിശദീകരണം ലഭ്യമല്ല.",
      symptoms: "ഈ ഫലത്തിൽ നിന്ന് കൃത്യമായ ലക്ഷണങ്ങൾ വിശദീകരിക്കാൻ കഴിയില്ല.",
      causes: "ലഭ്യമായ മോഡൽ പേരിൽ നിന്ന് കാരണം സ്ഥിരീകരിക്കാൻ കഴിയില്ല.",
      action: "വ്യക്തമായ ചിത്രം എടുത്ത് കാർഷിക വിദഗ്ധനെ സമീപിക്കുക."
    }
  },

  ta: {
    healthy: {
      meaning: "இந்த இலையை மாதிரி ஆரோக்கியமானதாகக் கண்டறிந்துள்ளது. குறிப்பிட்ட நோயின் அறிகுறிகள் கண்டறியப்படவில்லை.",
      symptoms: "தெளிவான நோய் அறிகுறிகள் மாதிரியால் கண்டறியப்படவில்லை. இருப்பினும் புள்ளிகள், மஞ்சள் நிறம் மற்றும் வாடுதல் ஆகியவற்றைக் கவனிக்கவும்.",
      causes: "இந்த முடிவில் குறிப்பிட்ட நோய்க்கான காரணம் கண்டறியப்படவில்லை.",
      action: "பயிரைத் தொடர்ந்து கண்காணிக்கவும். இலைகளின் இருபுறங்களையும் புதிய வளர்ச்சியையும் கவனிக்கவும்."
    },
    fungal: {
      meaning: "பூஞ்சை தொடர்பான இலை நோயை மாதிரி கண்டறிந்துள்ளது. இது இலை திசுக்களைப் பாதிக்கலாம்.",
      symptoms: "பழுப்பு அல்லது கரும்புள்ளிகள், மஞ்சள் நிறம், உலர்ந்த பகுதிகள், இலைக் கருகல் அல்லது வெள்ளைப் பொடி போன்ற படலம் தோன்றலாம்.",
      causes: "பாதிக்கப்பட்ட தாவரப் பகுதிகள், பூஞ்சை வித்துகள், ஈரப்பதம் மற்றும் சாதகமான வானிலை மூலம் நோய் பரவலாம்.",
      action: "கடுமையாகப் பாதிக்கப்பட்ட இலைகளை முடிந்தால் அகற்றவும். காற்றோட்டத்தை மேம்படுத்தி அருகிலுள்ள செடிகளைக் கண்காணிக்கவும்."
    },
    bacterial: {
      meaning: "பாக்டீரியா தொடர்பான இலை நோயை மாதிரி கண்டறிந்துள்ளது.",
      symptoms: "கருமையான புள்ளிகள், நீர் படிந்தது போன்ற புள்ளிகள் மற்றும் இலை ஓரங்களில் மஞ்சள் நிறம் தோன்றலாம்.",
      causes: "பாதிக்கப்பட்ட தாவரப் பகுதிகள், மாசடைந்த கருவிகள், நீர் தெறித்தல் மற்றும் தாவரக் காயங்கள் மூலம் பாக்டீரியா பரவலாம்.",
      action: "ஈரமான செடிகளைக் கையாள்வதைத் தவிர்க்கவும். கருவிகளைச் சுத்தமாக வைத்துக் கொண்டு விவசாய நிபுணரை அணுகவும்."
    },
    viral: {
      meaning: "வைரஸ் தொடர்பான நோய் அறிகுறிகளை மாதிரி கண்டறிந்துள்ளது. இது இலை நிறத்தையும் வடிவத்தையும் மாற்றலாம்.",
      symptoms: "இலை மஞ்சளாகுதல், சுருண்டு போதல், வழக்கமற்ற நிற மாற்றங்கள் மற்றும் வளர்ச்சி குறைதல் ஏற்படலாம்.",
      causes: "பாதிக்கப்பட்ட நடவு பொருட்கள் அல்லது வெள்ளை ஈ மற்றும் அசுவினி போன்ற பூச்சிகள் மூலம் சில வைரஸ்கள் பரவலாம்.",
      action: "அருகிலுள்ள செடிகளைப் பரிசோதிக்கவும். நடவடிக்கை எடுப்பதற்கு முன் விவசாய நிபுணரிடம் உறுதிப்படுத்தவும்."
    },
    pest: {
      meaning: "பூச்சிகளால் ஏற்பட்டிருக்கக்கூடிய சேதத்தை மாதிரி கண்டறிந்துள்ளது.",
      symptoms: "சிறிய பூச்சிகள், மெல்லிய வலைகள் அல்லது இலைகளில் சிறிய வெளிர் புள்ளிகள் தோன்றலாம்.",
      causes: "சிறிய சிலந்திப் பூச்சிகள் அல்லது பிற பூச்சிகள் இலைத் திசுக்களை உண்பதால் சேதம் ஏற்படலாம்.",
      action: "இலைகளின் அடிப்புறத்தைப் பரிசோதிக்கவும். கட்டுப்பாட்டு முறையைத் தேர்வு செய்வதற்கு முன் நிபுணரின் ஆலோசனையைப் பெறவும்."
    },
    unknown: {
      meaning: "மாதிரி ஒரு நோய் வகையைக் காட்டியுள்ளது. ஆனால் அதற்கான சரிபார்க்கப்பட்ட விளக்கம் இல்லை.",
      symptoms: "இந்த முடிவை மட்டும் வைத்து துல்லியமான அறிகுறிகளைக் கூற முடியாது.",
      causes: "மாதிரியின் பெயரை மட்டும் வைத்து காரணத்தை உறுதிப்படுத்த முடியாது.",
      action: "தெளிவான படத்தை எடுத்து விவசாய நிபுணரிடம் பரிசோதிக்கவும்."
    }
  },

  te: {
    healthy: {
      meaning: "మోడల్ ఈ ఆకును ఆరోగ్యంగా గుర్తించింది. నిర్దిష్ట వ్యాధి లక్షణాలు గుర్తించబడలేదు.",
      symptoms: "మోడల్ స్పష్టమైన వ్యాధి లక్షణాలను గుర్తించలేదు. అయినప్పటికీ మచ్చలు, పసుపు రంగు మరియు వాడిపోవడాన్ని గమనించండి.",
      causes: "ఈ ఫలితంలో నిర్దిష్ట వ్యాధికి కారణం గుర్తించబడలేదు.",
      action: "పంటను క్రమం తప్పకుండా పరిశీలించండి. ఆకుల రెండు వైపులా మరియు కొత్త పెరుగుదలను గమనించండి."
    },
    fungal: {
      meaning: "మోడల్ ఫంగస్‌కు సంబంధించిన ఆకు వ్యాధిని గుర్తించింది. ఇది ఆకు కణజాలాన్ని దెబ్బతీయవచ్చు.",
      symptoms: "గోధుమ లేదా నల్ల మచ్చలు, పసుపు రంగు, ఎండిన భాగాలు, ఆకు ఎండు తెగులు లేదా తెల్లటి పొడి లాంటి పొర కనిపించవచ్చు.",
      causes: "సోకిన మొక్కల భాగాలు, ఫంగస్ బీజాలు, తేమ మరియు అనుకూల వాతావరణం ద్వారా వ్యాధి వ్యాపించవచ్చు.",
      action: "తీవ్రంగా దెబ్బతిన్న ఆకులను సాధ్యమైతే తొలగించండి. గాలి ప్రసరణను మెరుగుపరచి సమీపంలోని మొక్కలను గమనించండి."
    },
    bacterial: {
      meaning: "మోడల్ బ్యాక్టీరియాకు సంబంధించిన ఆకు వ్యాధిని గుర్తించింది.",
      symptoms: "ముదురు మచ్చలు, నీటితో తడిసినట్లు కనిపించే మచ్చలు మరియు ఆకు అంచుల పసుపు రంగు కనిపించవచ్చు.",
      causes: "సోకిన మొక్కల భాగాలు, కలుషితమైన పనిముట్లు, నీటి చిమ్మడం మరియు మొక్కల గాయాల ద్వారా బ్యాక్టీరియా వ్యాపించవచ్చు.",
      action: "తడి మొక్కలను తాకకుండా ఉండండి. పనిముట్లను శుభ్రంగా ఉంచి వ్యవసాయ నిపుణుడిని సంప్రదించండి."
    },
    viral: {
      meaning: "మోడల్ వైరస్‌కు సంబంధించిన వ్యాధి లక్షణాలను గుర్తించింది. ఇది ఆకు రంగు మరియు ఆకారాన్ని ప్రభావితం చేయవచ్చు.",
      symptoms: "ఆకులు పసుపు రంగులోకి మారడం, ముడుచుకోవడం, అసాధారణ రంగు మార్పులు మరియు మొక్క పెరుగుదల తగ్గడం జరగవచ్చు.",
      causes: "సోకిన నాటే పదార్థాలు లేదా తెల్లదోమలు, అఫిడ్స్ వంటి కీటకాల ద్వారా కొన్ని వైరస్‌లు వ్యాపించవచ్చు.",
      action: "సమీపంలోని మొక్కలను పరిశీలించండి. చర్య తీసుకునే ముందు వ్యవసాయ నిపుణుడితో నిర్ధారించుకోండి."
    },
    pest: {
      meaning: "మోడల్ కీటకాల వల్ల సంభవించిన నష్టాన్ని గుర్తించింది.",
      symptoms: "చిన్న కీటకాలు, సన్నని వలలు లేదా ఆకులపై చిన్న లేత మచ్చలు కనిపించవచ్చు.",
      causes: "చిన్న పురుగులు లేదా ఇతర కీటకాలు ఆకు కణజాలాన్ని తినడం వల్ల నష్టం కలగవచ్చు.",
      action: "ఆకుల దిగువ భాగాన్ని పరిశీలించండి. నియంత్రణ పద్ధతిని ఎంచుకునే ముందు వ్యవసాయ నిపుణుడి సలహా తీసుకోండి."
    },
    unknown: {
      meaning: "మోడల్ ఒక వ్యాధి వర్గాన్ని చూపించింది. అయితే ఈ వర్గానికి ధృవీకరించిన వివరణ అందుబాటులో లేదు.",
      symptoms: "ఈ ఫలితం ఆధారంగా ఖచ్చితమైన లక్షణాలను వివరించడం సాధ్యం కాదు.",
      causes: "మోడల్ చూపించిన పేరును మాత్రమే ఆధారంగా చేసుకుని కారణాన్ని నిర్ధారించలేము.",
      action: "స్పష్టమైన చిత్రాన్ని తీసి వ్యవసాయ నిపుణుడిని సంప్రదించండి."
    }
  }
};

function getDiseaseCategory(prediction: string): DiseaseGuide["category"] {
  const label = prediction.toLowerCase();

  if (label.includes("healthy")) return "healthy";

  if (
    label.includes("bacterial") ||
    label.includes("bacteria")
  ) {
    return "bacterial";
  }

  if (
    label.includes("yellow leaf curl") ||
    label.includes("virus") ||
    label.includes("viral")
  ) {
    return "viral";
  }

  if (
    label.includes("spider mite") ||
    label.includes("mite") ||
    label.includes("pest")
  ) {
    return "pest";
  }

  const fungalTerms = [
    "blight",
    "mildew",
    "mold",
    "scab",
    "rust",
    "rot",
    "esca",
    "scorch",
    "septoria",
    "target spot",
    "cercospora",
    "fungal",
  ];

  if (fungalTerms.some((term) => label.includes(term))) {
    return "fungal";
  }

  return "unknown";
}

function getDiseaseGuide(prediction: string, language: Language) {
  const category = getDiseaseCategory(prediction);
  return {
    category,
    ...diseaseGuides[language][category],
  };
}

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [started, setStarted] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [cropData, setCropData] = useState<any>(null);
  const [advisoryData, setAdvisoryData] = useState<any>(null);
  const [sensorRecords, setSensorRecords] = useState<any[]>([]);
  const [sprayingResult, setSprayingResult] = useState<any>(null);
  const [diseaseResult, setDiseaseResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);

  const tr = (key: string) =>
    translations[language][key] || translations.en[key] || key;

  const translateDisease = (value: string) => {
    if (language === "en") return value;
    return diseaseTranslations[language][value] || value;
  };

  const translateAdvisory = (value: string) => {
    if (language === "en") return value;
    return advisoryTranslations[language][value] || value;
  };

  async function loadCropData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/crop-intelligence`);
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setCropData(data);
      setBackendOnline(true);
    } catch {
      setError(tr("error"));
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadAdvisoryData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/ai-advisory`);
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setAdvisoryData(data);
      setBackendOnline(true);
    } catch {
      setError(tr("error"));
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadSensorRecords() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/sensor-records?limit=100`);
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      setSensorRecords(Array.isArray(data.data) ? data.data : []);
      setBackendOnline(true);
    } catch {
      setError(tr("error"));
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadSprayingPlan() {
    if (!diseaseResult || diseaseResult.crop_match === false) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/precision-spraying`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diseaseResult),
      });

      if (!response.ok) throw new Error("API error");

      setSprayingResult(await response.json());
      setBackendOnline(true);
    } catch {
      setError(tr("error"));
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!started) return;

    if (page === "dashboard" || page === "intelligence") {
      loadCropData();
    }

    if (page === "advisory") {
      loadAdvisoryData();
    }

    if (page === "records") {
      loadSensorRecords();
    }
  }, [started, page]);

  const sensor =
    cropData?.sensor_data ||
    cropData?.sensors ||
    cropData?.sensor_readings ||
    cropData?.data ||
    cropData ||
    {};

  const advisory = advisoryData?.advisory || {};

  const getValue = (keys: string[]) => {
    for (const key of keys) {
      const value = sensor?.[key];
      if (value !== undefined && value !== null) return value;
    }
    return null;
  };

  const metrics = [
    {
      label: tr("temperature"),
      value: getValue(["temperature", "temp"]),
      unit: "°C",
      icon: "🌡️",
    },
    {
      label: tr("humidity"),
      value: getValue(["humidity", "air_humidity"]),
      unit: "%",
      icon: "💧",
    },
    {
      label: tr("moisture"),
      value: getValue(["soil_moisture", "moisture", "soilMoisture"]),
      unit: "%",
      icon: "🌱",
    },
    {
      label: tr("light"),
      value: getValue(["light_intensity", "light", "lightIntensity"]),
      unit: " lux",
      icon: "☀️",
    },
  ];

  const observations: string[] = Array.isArray(cropData?.observations)
    ? cropData.observations
    : Array.isArray(cropData?.crop_observations)
      ? cropData.crop_observations
      : [];

  const alerts: string[] = Array.isArray(advisory?.alerts)
    ? advisory.alerts
    : [];

  const recommendations: string[] = Array.isArray(advisory?.recommendations)
    ? advisory.recommendations
    : [];

  async function analyzeImage() {
    if (!selectedImage) {
      setError(tr("chooseImage"));
      return;
    }

    setLoading(true);
    setError("");
    setDiseaseResult(null);
    setSprayingResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("crop", selectedCrop);

      const response = await fetch(`${API}/predict-disease`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail || "Analysis failed");
      }

      const result = await response.json();
      setDiseaseResult(result);
      setBackendOnline(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : tr("imageError")
      );
    } finally {
      setLoading(false);
    }
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setSprayingResult(null);
    setPreview(URL.createObjectURL(file));
    setDiseaseResult(null);
    setError("");
  }

  const navItems: { id: Page; icon: string; label: string }[] = [
    { id: "dashboard", icon: "⌂", label: tr("dashboard") },
    { id: "disease", icon: "✿", label: tr("disease") },
    { id: "intelligence", icon: "◈", label: tr("intelligence") },
    { id: "advisory", icon: "✧", label: tr("advisory") },
    { id: "spraying", icon: "⌁", label: tr("spraying") },
    { id: "records", icon: "▤", label: tr("records") },
  ];

  if (!started) {
    return (
      <main className="welcome-page">
        <div className="welcome-overlay" />

        <header className="welcome-top">
          <div className="brand">
            <span className="brand-icon">🌿</span>
            <span>{tr("app")}</span>
          </div>

          <div className="language-control">
            <span>文</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="welcome-content">
          <div className="eyebrow">AI · AGRICULTURE · INTELLIGENCE</div>
          <h1>{tr("welcome")}</h1>
          <p>{tr("welcomeText")}</p>

          <div className="welcome-language">
            <label>{tr("choose")}</label>

            <div className="language-grid">
              {Object.entries(languageNames).map(([code, name]) => (
                <button
                  key={code}
                  className={
                    language === code
                      ? "language-option selected"
                      : "language-option"
                  }
                  onClick={() => setLanguage(code as Language)}
                >
                  {name}
                  {language === code && <span> ✓</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            className="primary-button start-button"
            onClick={() => setStarted(true)}
          >
            {tr("start")} <span>→</span>
          </button>
        </section>

        <div className="welcome-footer">
          SMARTER FARMING · BETTER TOMORROW
        </div>
      </main>
    );
  }

  const pageTitle: Record<Page, string> = {
    dashboard: tr("dashboard"),
    disease: tr("detectTitle"),
    intelligence: tr("intelligenceTitle"),
    advisory: tr("advisoryTitle"),
    spraying: tr("sprayingTitle"),
    records: tr("recordsTitle"),
  };

  const guide =
    diseaseResult &&
    diseaseResult.crop_match !== false &&
    !diseaseResult.uncertain
      ? getDiseaseGuide(diseaseResult.prediction || "Unknown", language)
      : null;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🌿</span>
          <div>
            <strong>AgriMind AI</strong>
            <small>{tr("tagline")}</small>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                page === item.id ? "nav-link active" : "nav-link"
              }
              onClick={() => {
                setPage(item.id);
                setError("");
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {page === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-card">
            <span
              className={
                backendOnline ? "status-dot online" : "status-dot"
              }
            />
            <div>
              <strong>{tr("connected")}</strong>
              <small>
                {backendOnline ? tr("healthy") : tr("notConnected")}
              </small>
            </div>
          </div>

          <label className="sidebar-language">
            {tr("language")}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <button
            className="back-home"
            onClick={() => setStarted(false)}
          >
            ← {tr("home")}
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="main-topbar">
          <div className="breadcrumb">
            AgriMind AI <span>/</span> {pageTitle[page]}
          </div>

          <div className="topbar-right">
            <span
              className={
                backendOnline
                  ? "connection-pill online-pill"
                  : "connection-pill"
              }
            >
              <i />
              {backendOnline ? tr("healthy") : tr("notConnected")}
            </span>

            <button
              className="refresh-button"
              onClick={loadCropData}
            >
              ↻ {tr("refresh")}
            </button>
          </div>
        </header>

        <div className="page-content">
          {error && <div className="error-banner">⚠ {error}</div>}

          {loading && (
            <div className="muted" role="status">
              {tr("loading")}
            </div>
          )}

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    AGRICULTURE INTELLIGENCE
                  </div>
                  <h1>{tr("overview")}</h1>
                  <p>{tr("overviewText")}</p>
                </div>

                <span className="date-chip">
                  🌱 AgriMind AI · Prototype
                </span>
              </div>

              <section className="hero-panel">
                <div>
                  <span className="hero-kicker">
                    YOUR FARM, INSIGHTFULLY CONNECTED
                  </span>

                  <h2>
                    Understand your crops.
                    <br />
                    Make informed decisions.
                  </h2>

                  <p>
                    AI-powered screening and environmental insights in one place.
                  </p>

                  <button
                    onClick={() => setPage("disease")}
                    className="hero-action"
                  >
                    {tr("disease")} <span>→</span>
                  </button>
                </div>

                <div className="hero-orbit">
                  <div className="orbit-ring ring-one" />
                  <div className="orbit-ring ring-two" />
                  <div className="orbit-center">🌾</div>
                  <span className="orbit-leaf leaf-one">✦</span>
                  <span className="orbit-leaf leaf-two">✧</span>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>{tr("liveStatus")}</h2>
                  <p>{tr("overviewText")}</p>
                </div>

                <span className="data-tag">
                  {sensor?.source || tr("simulated")}
                </span>
              </div>

              <div className="metric-grid">
                {metrics.map((metric) => (
                  <div className="metric-card" key={metric.label}>
                    <div className="metric-top">
                      <span>{metric.label}</span>
                      <span className="metric-icon">{metric.icon}</span>
                    </div>

                    <div className="metric-value">
                      {metric.value ?? "—"}
                      <small>
                        {metric.value !== null ? metric.unit : ""}
                      </small>
                    </div>

                    <div className="metric-caption">
                      {metric.value !== null
                        ? sensor?.source || tr("simulated")
                        : tr("noData")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="dashboard-bottom">
                <div className="info-panel">
                  <h3>{tr("intelligence")}</h3>
                  <p>{tr("intelligenceText")}</p>
                  <button
                    className="text-action"
                    onClick={() => setPage("intelligence")}
                  >
                    {tr("intelligence")} →
                  </button>
                </div>

                <div className="info-panel">
                  <h3>{tr("advisory")}</h3>
                  <p>{tr("advisoryText")}</p>
                  <button
                    className="text-action"
                    onClick={() => setPage("advisory")}
                  >
                    {tr("advisory")} →
                  </button>
                </div>
              </div>
            </>
          )}

          {/* DISEASE DETECTION */}
          {page === "disease" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    COMPUTER VISION · AI SCREENING
                  </div>
                  <h1>{tr("detectTitle")}</h1>
                  <p>{tr("detectText")}</p>
                </div>
              </div>

              <div className="two-column">
                <section className="content-panel">
                  <h2>{tr("upload")}</h2>
                  <p className="muted">{tr("detectText")}</p>

                  <label className="crop-field">
                    {tr("selectCrop")}

                    <select
                      value={selectedCrop}
                      onChange={(event) => {
                        setSelectedCrop(event.target.value);
                        setDiseaseResult(null);
                        setSprayingResult(null);
                      }}
                    >
                      {supportedCrops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="notice-box">
                    ⓘ {tr("cropScope")}
                  </div>

                  <label className="upload-zone">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Selected leaf"
                        className="image-preview"
                      />
                    ) : (
                      <>
                        <span className="upload-symbol">↑</span>
                        <strong>{tr("upload")}</strong>
                        <small>JPG · PNG · WEBP · MAX 10 MB</small>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImage}
                      hidden
                    />
                  </label>

                  {selectedImage && (
                    <p className="file-name">
                      ✓ {selectedImage.name}
                    </p>
                  )}

                  <button
                    className="primary-button full-button"
                    onClick={analyzeImage}
                    disabled={loading}
                  >
                    {loading ? tr("analyzing") : tr("analyze")}
                    <span>→</span>
                  </button>
                </section>

                {/* RESULT PANEL */}
                <section className="content-panel result-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{tr("prediction")}</h2>
                      <p className="muted">{tr("topResults")}</p>
                    </div>

                    <span className="ai-chip">✦ AI</span>
                  </div>

                  {diseaseResult ? (
                    <>
                      <div className="result-name">
                        {translateDisease(
                          diseaseResult.prediction || "Unknown"
                        )}
                      </div>

                      {diseaseResult.crop_match !== false && (
                        <>
                          <div className="confidence-row">
                            <span>{tr("confidence")}</span>
                            <strong>
                              {diseaseResult.confidence}%
                            </strong>
                          </div>

                          <div className="confidence-track">
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(diseaseResult.confidence) || 0
                                  )
                                )}%`,
                              }}
                            />
                          </div>

                          {Array.isArray(diseaseResult.top_predictions) &&
                            diseaseResult.top_predictions.map(
                              (item: any, index: number) => (
                                <div
                                  className="prediction-row"
                                  key={index}
                                >
                                  <span>
                                    {translateDisease(item.disease)}
                                  </span>
                                  <strong>{item.confidence}%</strong>
                                </div>
                              )
                            )}
                        </>
                      )}

                      {/* CROP MISMATCH */}
                      {diseaseResult.crop_match === false ? (
                        <div className="notice-box">
                          ⓘ {tr("cropMismatch")}
                        </div>
                      ) : diseaseResult.uncertain ? (
                        /* LOW CONFIDENCE */
                        <>
                          <div
                            className="notice-box"
                            style={{ marginTop: "18px" }}
                          >
                            ⚠ {tr("lowConfidence")}
                          </div>

                          <div
                            className="guide-card"
                            style={{ marginTop: "16px" }}
                          >
                            <h3>⚠ {tr("uncertainTitle")}</h3>
                            <p>{tr("uncertainText")}</p>
                          </div>
                        </>
                      ) : (
                        /* DISEASE EXPLANATION */
                        <>
                          {guide && (
                            <div
                              className="disease-guide"
                              style={{
                                display: "grid",
                                gap: "12px",
                                marginTop: "22px",
                              }}
                            >
                              <div
                                className="guide-card"
                                style={{
                                  padding: "17px",
                                  borderRadius: "14px",
                                  border: "1px solid rgba(100,150,110,0.2)",
                                  background: "rgba(100,150,110,0.06)",
                                }}
                              >
                                <h3 style={{ margin: "0 0 9px", fontSize: "15px" }}>
                                  {guide.category === "healthy"
                                    ? "🌿"
                                    : "🔍"}{" "}
                                  {guide.category === "healthy"
                                    ? tr("healthyTitle")
                                    : tr("meaning")}
                                </h3>

                                <p style={{ margin: 0, lineHeight: 1.7 }}>
                                  {guide.category === "healthy"
                                    ? tr("healthyText")
                                    : guide.meaning}
                                </p>
                              </div>

                              {guide.category !== "healthy" &&
                                guide.category !== "unknown" && (
                                  <>
                                    <div
                                      className="guide-card"
                                      style={{
                                        padding: "17px",
                                        borderRadius: "14px",
                                        border: "1px solid rgba(100,150,110,0.2)",
                                        background: "rgba(100,150,110,0.06)",
                                      }}
                                    >
                                      <h3 style={{ margin: "0 0 9px", fontSize: "15px" }}>
                                        🌱 {tr("symptoms")}
                                      </h3>
                                      <p style={{ margin: 0, lineHeight: 1.7 }}>
                                        {guide.symptoms}
                                      </p>
                                    </div>

                                    <div
                                      className="guide-card"
                                      style={{
                                        padding: "17px",
                                        borderRadius: "14px",
                                        border: "1px solid rgba(100,150,110,0.2)",
                                        background: "rgba(100,150,110,0.06)",
                                      }}
                                    >
                                      <h3 style={{ margin: "0 0 9px", fontSize: "15px" }}>
                                        🧬 {tr("causes")}
                                      </h3>
                                      <p style={{ margin: 0, lineHeight: 1.7 }}>
                                        {guide.causes}
                                      </p>
                                    </div>
                                  </>
                                )}

                              {guide.category === "unknown" && (
                                <div
                                  className="guide-card"
                                  style={{
                                    padding: "17px",
                                    borderRadius: "14px",
                                    border: "1px solid rgba(100,150,110,0.2)",
                                    background: "rgba(100,150,110,0.06)",
                                  }}
                                >
                                  <h3 style={{ margin: "0 0 9px", fontSize: "15px" }}>
                                    🔎 {tr("unknownTitle")}
                                  </h3>
                                  <p style={{ margin: "0 0 10px", lineHeight: 1.7 }}>
                                    {tr("unknownText")}
                                  </p>
                                  <p style={{ margin: 0, lineHeight: 1.7 }}>
                                    {guide.symptoms}
                                  </p>
                                </div>
                              )}

                              <div
                                className="guide-card"
                                style={{
                                  padding: "17px",
                                  borderRadius: "14px",
                                  border: "1px solid rgba(100,150,110,0.2)",
                                  background: "rgba(100,150,110,0.06)",
                                }}
                              >
                                <h3 style={{ margin: "0 0 9px", fontSize: "15px" }}>
                                  💡 {tr("nextSteps")}
                                </h3>

                                <p style={{ margin: 0, lineHeight: 1.7 }}>
                                  {guide.category === "healthy"
                                    ? tr("healthyAction")
                                    : guide.category === "unknown"
                                      ? tr("unknownAction")
                                      : guide.action}
                                </p>
                              </div>
                            </div>
                          )}

                          <div
                            className="notice-box"
                            style={{ marginTop: "16px" }}
                          >
                            ⓘ {tr("disclaimer")}
                          </div>

                          <div className="notice-box">
                            {tr("screeningNotice")}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="empty-state">
                      <span>✧</span>
                      <strong>{tr("noResult")}</strong>
                      <p>{tr("noResultText")}</p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {/* CROP INTELLIGENCE */}
          {page === "intelligence" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    ENVIRONMENTAL MONITORING
                  </div>
                  <h1>{tr("intelligenceTitle")}</h1>
                  <p>{tr("intelligenceText")}</p>
                </div>
              </div>

              <div className="metric-grid">
                {metrics.map((metric) => (
                  <div className="metric-card" key={metric.label}>
                    <div className="metric-top">
                      <span>{metric.label}</span>
                      <span className="metric-icon">{metric.icon}</span>
                    </div>

                    <div className="metric-value">
                      {metric.value ?? "—"}
                      <small>
                        {metric.value !== null ? metric.unit : ""}
                      </small>
                    </div>

                    <div className="metric-caption">
                      {tr("source")}: {sensor?.source || tr("simulated")}
                    </div>
                  </div>
                ))}
              </div>

              <section className="content-panel observations-panel">
                <h2>{tr("observations")}</h2>

                {observations.length ? (
                  observations.map((item, i) => (
                    <div className="list-row" key={i}>
                      <span className="list-check">✓</span>
                      {translateAdvisory(item)}
                    </div>
                  ))
                ) : (
                  <p className="muted">{tr("noData")}</p>
                )}

                <div className="notice-box">
                  ⓘ {tr("source")}: {sensor?.source || tr("simulated")}
                </div>
              </section>
            </>
          )}

          {/* AI ADVISORY */}
          {page === "advisory" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    AI-ASSISTED FARM GUIDANCE
                  </div>
                  <h1>{tr("advisoryTitle")}</h1>
                  <p>{tr("advisoryText")}</p>
                  <span className="data-tag">
                    {advisoryData?.data_source || tr("simulated")}
                  </span>
                </div>
              </div>

              <div className="advisory-grid">
                <section className="content-panel">
                  <div className="panel-heading">
                    <h2>{tr("alerts")}</h2>
                    <span className="alert-icon">!</span>
                  </div>

                  {alerts.length ? (
                    alerts.map((item, i) => (
                      <div className="list-row alert-row" key={i}>
                        <span>⚠</span>
                        {translateAdvisory(item)}
                      </div>
                    ))
                  ) : (
                    <p className="muted">{tr("noData")}</p>
                  )}
                </section>

                <section className="content-panel">
                  <div className="panel-heading">
                    <h2>{tr("recommendations")}</h2>
                    <span className="recommend-icon">✧</span>
                  </div>

                  {recommendations.length ? (
                    recommendations.map((item, i) => (
                      <div className="list-row" key={i}>
                        <span className="list-check">✓</span>
                        {translateAdvisory(item)}
                      </div>
                    ))
                  ) : (
                    <p className="muted">{tr("noData")}</p>
                  )}
                </section>
              </div>

              <div className="notice-box">
                ⓘ {tr("advisoryNotice")}
              </div>
            </>
          )}

          {/* PRECISION SPRAYING */}
          {page === "spraying" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">FIELD ZONE REVIEW</div>
                  <h1>{tr("sprayingTitle")}</h1>
                  <p>{tr("sprayingText")}</p>
                </div>
              </div>

              <section className="content-panel spraying-panel">
                {!diseaseResult ? (
                  <div className="empty-state">
                    <strong>{tr("noResult")}</strong>
                    <p>{tr("noResultText")}</p>
                    <button
                      className="text-action"
                      onClick={() => setPage("disease")}
                    >
                      {tr("disease")} →
                    </button>
                  </div>
                ) : diseaseResult.crop_match === false ? (
                  <div className="empty-state">
                    <strong>{tr("cropMismatch")}</strong>
                    <button
                      className="text-action"
                      onClick={() => setPage("disease")}
                    >
                      {tr("disease")} →
                    </button>
                  </div>
                ) : (
                  <div className="spray-details">
                    <h2>
                      {tr("field")} {sprayingResult?.field_id || "FIELD-001"}
                    </h2>

                    <p className="muted">
                      {tr("prediction")}:{" "}
                      {translateDisease(diseaseResult.prediction || "Unknown")}
                    </p>

                    <button
                      className="primary-button"
                      onClick={loadSprayingPlan}
                      disabled={loading}
                    >
                      {loading ? tr("loading") : tr("planZone")}
                    </button>

                    {sprayingResult && (
                      <>
                        <div className="spray-status">
                          {sprayingResult.status || tr("pending")}
                        </div>

                        {Array.isArray(sprayingResult.zones) &&
                        sprayingResult.zones.length > 0 ? (
                          sprayingResult.zones.map((zone: any) => (
                            <div
                              className="detail-row"
                              key={zone.zone_id}
                            >
                              <span>
                                {zone.zone_id} · {zone.priority}
                              </span>
                              <strong>
                                {translateDisease(zone.detected_issue || "")}
                              </strong>
                            </div>
                          ))
                        ) : (
                          <p className="muted">
                            {sprayingResult.message}
                          </p>
                        )}
                      </>
                    )}

                    <div className="notice-box">
                      ⓘ {tr("zoneNotice")} {tr("noAuto")}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* SENSOR RECORDS */}
          {page === "records" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    ENVIRONMENTAL DATA LOG
                  </div>
                  <h1>{tr("recordsTitle")}</h1>
                  <p>{tr("recordsText")}</p>
                </div>
              </div>

              <section className="content-panel table-panel">
                <div className="panel-heading">
                  <h2>{tr("recordsTitle")}</h2>
                  <span className="data-tag">
                    {sensorRecords[0]?.source || tr("simulated")}
                  </span>
                </div>

                <div className="record-table">
                  <div className="record-row record-header">
                    <span>{tr("time")} / GPS</span>
                    <span>
                      {tr("temperature")} · {tr("humidity")} ·{" "}
                      {tr("moisture")} · {tr("light")}
                    </span>
                    <span>{tr("dataSource")}</span>
                  </div>

                  {sensorRecords.map((record) => (
                    <div className="record-row" key={record.id}>
                      <span>
                        {record.timestamp}
                        {record.latitude != null &&
                          record.longitude != null && (
                            <>
                              <br />
                              📍 {record.latitude}, {record.longitude}
                            </>
                          )}
                      </span>

                      <strong>
                        {record.temperature ?? "—"} °C ·{" "}
                        {record.humidity ?? "—"}% ·{" "}
                        {record.soil_moisture ?? "—"}% ·{" "}
                        {record.light_intensity ?? "—"} lx
                      </strong>

                      <span className="record-status">
                        {record.source}
                      </span>
                    </div>
                  ))}

                  {!sensorRecords.length && (
                    <p className="muted">{tr("noData")}</p>
                  )}
                </div>

                <div className="notice-box">
                  ⓘ {tr("source")}:{" "}
                  {sensorRecords[0]?.source || tr("simulated")}
                </div>
              </section>
            </>
          )}
        </div>

        <footer className="app-footer">
          <span>🌿 AgriMind AI</span>
          <span>AI-powered crop intelligence · Prototype</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
