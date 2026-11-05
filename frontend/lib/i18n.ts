import en from "../locales/en.json";
import hi from "../locales/hi.json";
import ml from "../locales/ml.json";
import ta from "../locales/ta.json";

export type LanguageCode = "en" | "hi" | "ml" | "ta";

export const LOCALES: Record<LanguageCode, any> = { en, hi, ml, ta };

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "ta", label: "தமிழ் (Tamil)" }
];

// Multilingual search transliteration lookup table
export const TRANSLITERATION_MAP: Record<string, string> = {
  // Hindi / Devanagari
  "कथकली": "Kathakali",
  "मधुबनी": "Madhubani",
  "पट्टचित्र": "Pattachitra",
  "कलमकारी": "Kalamkari",
  "वारली": "Warli",
  "तंजावुर": "Thanjavur",
  "भरतनाट्यम": "Bharatanatyam",
  "छाऊ": "Chhau",
  "पश्मीना": "Pashmina",
  "कांगड़ा": "Kangra",
  "कोणार्क": "Konark",
  "हम्पी": "Hampi",
  "अजंता": "Ajanta",
  "बिदरी": "Bidriware",
  "चंदेरी": "Chanderi",
  "पटोला": "Patola",
  
  // Malayalam
  "കഥകളി": "Kathakali",
  "കൂടിയാട്ടം": "Koodiyattam",
  "തെയ്യം": "Theyyam",
  "ആറന്മുള": "Aranmula",
  "മുടിയേറ്റ്": "Mudiyettu",
  "കേരളം": "Kerala",

  // Tamil
  "கதகளி": "Kathakali",
  "பரதநாட்டியம்": "Bharatanatyam",
  "தஞ்சாவூர்": "Thanjavur",
  "காஞ்சிபுரம்": "Kanchipuram",
  "சுவாமிமலை": "Swamimalai",
  "மாமல்லபுரம்": "Mamallapuram"
};

export function normalizeSearchQuery(query: string): string {
  if (!query) return "";
  const trimmed = query.trim();
  for (const [indic, latin] of Object.entries(TRANSLITERATION_MAP)) {
    if (trimmed.includes(indic)) {
      return trimmed.replace(indic, latin);
    }
  }
  return trimmed;
}

export function getTranslation(keyPath: string, lang: LanguageCode = "en"): string {
  const dict = LOCALES[lang] || LOCALES.en;
  const parts = keyPath.split(".");
  let cur: any = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      // Fallback to English
      let fallback: any = LOCALES.en;
      for (const fp of parts) {
        if (fallback && typeof fallback === "object" && fp in fallback) {
          fallback = fallback[fp];
        } else {
          return keyPath;
        }
      }
      return typeof fallback === "string" ? fallback : keyPath;
    }
  }
  return typeof cur === "string" ? cur : keyPath;
}
