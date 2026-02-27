import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr' | 'gu' | 'pa' | 'or';

interface LangOption {
  code: Language;
  name: string;
  native: string;
}

export const LANGUAGES: LangOption[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
];

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  'nav.home': { en: 'Home', hi: 'होम', ta: 'முகப்பு', te: 'హోమ్', kn: 'ಮುಖಪುಟ', ml: 'ഹോം', bn: 'হোম', mr: 'होम', gu: 'હોમ', pa: 'ਹੋਮ', or: 'ହୋମ' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', ta: 'டாஷ்போர்டு', te: 'డాష్‌బోర్డ్', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ml: 'ഡാഷ്‌ബോർഡ്', bn: 'ড্যাশবোর্ড', mr: 'डॅशबोर्ड', gu: 'ડેશબોર્ડ', pa: 'ਡੈਸ਼ਬੋਰਡ', or: 'ଡ୍ୟାସବୋର୍ଡ' },
  'nav.login': { en: 'Login', hi: 'लॉगिन', ta: 'உள்நுழை', te: 'లాగిన్', kn: 'ಲಾಗಿನ್', ml: 'ലോഗിൻ', bn: 'লগইন', mr: 'लॉगिन', gu: 'લૉગિન', pa: 'ਲੌਗਇਨ', or: 'ଲଗଇନ' },
  'nav.signup': { en: 'Sign Up', hi: 'साइन अप', ta: 'பதிவு', te: 'సైన్ అప్', kn: 'ಸೈನ್ ಅಪ್', ml: 'സൈൻ അപ്പ്', bn: 'সাইন আপ', mr: 'साइन अप', gu: 'સાઇન અપ', pa: 'ਸਾਈਨ ਅੱਪ', or: 'ସାଇନ ଅପ' },
  'hero.title': { en: 'Bridging Farmers, Technology & Government', hi: 'किसानों, प्रौद्योगिकी और सरकार को जोड़ना', ta: 'விவசாயிகள், தொழில்நுட்பம் & அரசாங்கத்தை இணைத்தல்', te: 'రైతులు, సాంకేతికత & ప్రభుత్వాన్ని అనుసంధానం', kn: 'ರೈತರು, ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಸರ್ಕಾರವನ್ನು ಸಂಪರ್ಕಿಸುವುದು', ml: 'കർഷകരെയും സാങ്കേതികവിദ്യയെയും സർക്കാരിനെയും ബന്ധിപ്പിക്കുന്നു', bn: 'কৃষক, প্রযুক্তি এবং সরকারকে সংযুক্ত করা', mr: 'शेतकरी, तंत्रज्ञान आणि सरकारला जोडणे', gu: 'ખેડૂતો, ટેકનોલોજી અને સરકારને જોડવું', pa: 'ਕਿਸਾਨਾਂ, ਤਕਨਾਲੋਜੀ ਅਤੇ ਸਰਕਾਰ ਨੂੰ ਜੋੜਨਾ', or: 'କୃଷକ, ପ୍ରଯୁକ୍ତି ଏବଂ ସରକାରକୁ ସଂଯୋଗ' },
  'leaf.title': { en: 'Leaf Disease Detection', hi: 'पत्ती रोग पहचान', ta: 'இலை நோய் கண்டறிதல்', te: 'ఆకు వ్యాధి గుర్తింపు', kn: 'ಎಲೆ ರೋಗ ಪತ್ತೆ', ml: 'ഇല രോഗ കണ്ടെത്തൽ', bn: 'পাতা রোগ সনাক্তকরণ', mr: 'पान रोग ओळख', gu: 'પાન રોગ શોધ', pa: 'ਪੱਤਾ ਰੋਗ ਖੋਜ', or: 'ପତ୍ର ରୋଗ ଚିହ୍ନଟ' },
  'common.upload': { en: 'Upload Image', hi: 'छवि अपलोड करें', ta: 'படம் பதிவேற்று', te: 'చిత్రం అప్‌లోడ్', kn: 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್', ml: 'ചിത്രം അപ്‌ലോഡ്', bn: 'ছবি আপলোড', mr: 'प्रतिमा अपलोड', gu: 'છબી અપલોડ', pa: 'ਤਸਵੀਰ ਅੱਪਲੋਡ', or: 'ଛବି ଅପଲୋଡ' },
  'common.scan': { en: 'Scan Now', hi: 'अभी स्कैन करें', ta: 'இப்போது ஸ்கேன்', te: 'ఇప్పుడు స్కాన్', kn: 'ಈಗ ಸ್ಕ್ಯಾನ್', ml: 'ഇപ്പോൾ സ്കാൻ', bn: 'এখন স্ক্যান', mr: 'आता स्कॅन', gu: 'હવે સ્કેન', pa: 'ਹੁਣੇ ਸਕੈਨ', or: 'ବର୍ତ୍ତମାନ ସ୍କାନ' },
  'common.download': { en: 'Download Report', hi: 'रिपोर्ट डाउनलोड', ta: 'அறிக்கை பதிவிறக்கம்', te: 'నివేదిక డౌన్‌లోడ్', kn: 'ವರದಿ ಡೌನ್‌ಲೋಡ್', ml: 'റിപ്പോർട്ട് ഡൗൺലോഡ്', bn: 'রিপোর্ট ডাউনলোড', mr: 'अहवाल डाउनलोड', gu: 'રિપોર્ટ ડાઉનલોડ', pa: 'ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ', or: 'ରିପୋର୍ଟ ଡାଉନଲୋଡ' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
};
