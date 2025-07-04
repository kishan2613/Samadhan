import { useState } from 'react';

export default function LanguageSelector({ onLanguageSelected }) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  // Language options with native names
  const languages = {
    en: { code: 'en', name: 'English', nativeName: 'English' },
    as: { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    brx: { code: 'brx', name: 'Bodo', nativeName: 'बड़ो' },
    gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    mni: { code: 'mni', name: 'Manipuri', nativeName: 'মণিপুরী' },
    mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    or: { code: 'or', name: 'Oriya', nativeName: 'ଓଡ଼ିଆ' },
    pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' }
  };

  return (
    <div className="max-w-2xl mt-3 mx-auto p-6 bg-[url('/assets/images/LanguageSelectBG.png')] bg-cover rounded-lg shadow-lg">
       
      <div className="mb-8 text-center">
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-4">Samadhan</h1> */}
        
        {/* Welcome messages with audio */}
        <div className="space-y-4">
          {/* <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <p className="text-lg text-gray-800">{welcomeMessages.en}</p>
              <button 
                onClick={() => playAudio('en')}
                disabled={audioPlaying}
                className="ml-3 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                aria-label="Play English audio"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div> */}
          
          {/* <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <p className="text-lg text-gray-800 font-hindi">{welcomeMessages.hi}</p>
              <button 
                onClick={() => playAudio('hi')}
                disabled={audioPlaying}
                className="ml-3 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                aria-label="Play Hindi audio"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div> */}
        </div>
      </div>
      
      <div className="mt-6">
       
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Select Your Language</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.values(languages).map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelected(lang.code)}
              className={`p-4 rounded-lg transition-colors  hover:bg-blue-50 shadow-sm flex flex-col items-center justify-center min-h-24 ${
                selectedLanguage === lang.code ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white'
              }`}
            >
              <span className="text-lg font-semibold mb-1">{lang.nativeName}</span>
              <span className="text-sm text-gray-500">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* {selectedLanguage && (
        <div className="mt-8 text-center">
          <p className="text-green-600 font-medium">
            {selectedLanguage === 'en' ? 
              'Language set successfully!' : 
              'भाषा सफलतापूर्वक सेट की गई!'}
          </p>
        </div>
      )} */}
    </div>
  );
}