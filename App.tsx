import React, { useState, useCallback, useEffect } from 'react';

const SpeakerWaveIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const SpeakerXMarkIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const App: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [textToRead, setTextToRead] = useState(
    'Hello! I am a world-class senior frontend engineer. Edit this text, and I will read it aloud for you in any voice you choose.'
  );
  
  useEffect(() => {
    const populateVoiceList = () => {
      if (!('speechSynthesis' in window)) return;
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if (selectedVoiceURI === '' && availableVoices.find(v => v.default)) {
            setSelectedVoiceURI(availableVoices.find(v => v.default)!.voiceURI);
        } else if (selectedVoiceURI === '' && availableVoices[0]) {
          setSelectedVoiceURI(availableVoices[0].voiceURI);
        }
      }
    };

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    return () => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (speechSynthesis) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoiceURI]);

  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (textToRead.trim() === '') return;
        
      const utterance = new SpeechSynthesisUtterance(textToRead);
      
      const selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, textToRead, voices, selectedVoiceURI]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="flex flex-col items-center text-center w-full">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
            Text-to-Speech Synthesizer
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl">
            Type any text into the box below and select a voice to hear it read aloud by your browser's text-to-speech engine.
          </p>
        </div>
        
        <div className="w-full max-w-2xl">
          <label htmlFor="text-to-read" className="sr-only">Text to read</label>
          <textarea
            id="text-to-read"
            value={textToRead}
            onChange={(e) => setTextToRead(e.target.value)}
            className="bg-slate-800 text-slate-100 rounded-xl w-full p-4 font-mono text-base focus:ring-2 focus:ring-sky-500 focus:outline-none h-48 resize-y shadow-lg"
            placeholder="Enter text here..."
            aria-label="Text to read aloud"
          />
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-xs">
            <button
              onClick={handleSpeak}
              className="w-full flex items-center justify-center gap-3 text-slate-300 hover:text-white transition-colors duration-200 text-base font-medium px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
              aria-label={isSpeaking ? "Stop reading" : "Read text aloud"}
            >
              {isSpeaking ? (
                <>
                  <SpeakerXMarkIcon className="h-5 w-5" />
                  Stop Reading
                </>
              ) : (
                <>
                  <SpeakerWaveIcon className="h-5 w-5" />
                  Read Aloud
                </>
              )}
            </button>
            <div className="relative w-full">
                <label htmlFor="voice-select" className="sr-only">Choose a voice:</label>
                <select
                  id="voice-select"
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  disabled={voices.length === 0}
                  className="w-full appearance-none bg-slate-700 border-slate-600 text-slate-300 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Select a voice for text-to-speech"
                >
                  {voices.length > 0 ? (
                    voices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  ) : (
                    <option>Loading voices...</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
            <p>Built by a world-class senior frontend React engineer.</p>
            <p>UI/UX crafted with Tailwind CSS for a modern, aesthetic appeal.</p>
        </div>
      </main>
    </div>
  );
};

export default App;
