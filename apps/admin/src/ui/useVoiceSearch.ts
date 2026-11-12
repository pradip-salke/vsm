import { useCallback, useEffect, useRef, useState } from 'react';

type RecognitionAlternative = { transcript: string };
type RecognitionResult = { isFinal: boolean; length: number; [index: number]: RecognitionAlternative };
type RecognitionEvent = { resultIndex: number; results: { length: number; [index: number]: RecognitionResult } };
type RecognitionErrorEvent = { error: string; message?: string };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => Recognition;

export type VoiceStatus = 'idle' | 'starting' | 'listening' | 'unsupported' | 'error';

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow the microphone for this site in the browser address bar, then try again.',
  'service-not-allowed': 'Speech recognition is blocked by the browser. Allow microphone access for this site and try again.',
  'audio-capture': 'No microphone was found. Connect a microphone and try again.',
  'no-speech': 'No speech was heard. Tap the mic and speak clearly.',
  network: 'Speech recognition needs an internet connection. Check your connection and try again.',
  'language-not-supported': 'This browser does not support English (India) speech recognition.',
  'bad-grammar': 'Speech could not be recognised. Please try again.',
};

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Spoken queries often end with punctuation added by the recogniser ("Blog posts."). */
function cleanTranscript(text: string) {
  return text.replace(/\s+/g, ' ').replace(/[.,!?;:]+$/u, '').trim();
}

/**
 * Browser speech-to-text for the admin search box.
 * `onTranscript(text, isFinal)` receives live interim text and the final phrase.
 */
export function useVoiceSearch(onTranscript: (text: string, isFinal: boolean) => void) {
  const [status, setStatus] = useState<VoiceStatus>(() => (recognitionConstructor() ? 'idle' : 'unsupported'));
  const [message, setMessage] = useState('');
  const recognitionRef = useRef<Recognition | null>(null);
  const callbackRef = useRef(onTranscript);
  const heardRef = useRef(false);
  callbackRef.current = onTranscript;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    }
    recognition?.abort();
    setStatus((current) => (current === 'unsupported' ? current : 'idle'));
    setMessage('');
  }, []);

  const start = useCallback(() => {
    const Ctor = recognitionConstructor();
    if (!Ctor) {
      setStatus('unsupported');
      setMessage('Voice search is not supported in this browser. Use Google Chrome, Microsoft Edge or Safari.');
      return;
    }
    if (!window.isSecureContext) {
      setStatus('error');
      setMessage('Voice search needs a secure connection. Open the admin over https:// or http://localhost.');
      return;
    }
    if (recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    heardRef.current = false;

    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return;
      setStatus('listening');
      setMessage('Listening… say a page or module name, for example "blog posts".');
    };
    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return;
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]!;
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) finalText += transcript;
        else interimText += transcript;
      }
      const text = cleanTranscript(finalText || interimText);
      if (!text) return;
      heardRef.current = true;
      callbackRef.current(text, Boolean(finalText));
      if (finalText) setMessage(`Searching for “${text}”.`);
    };
    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;
      if (event.error === 'aborted') return;
      setStatus('error');
      setMessage(ERROR_MESSAGES[event.error] ?? `Voice search stopped (${event.error}). Please try again.`);
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setStatus((current) => {
        if (current === 'error' || current === 'unsupported') return current;
        if (!heardRef.current) {
          setMessage(ERROR_MESSAGES['no-speech']!);
          return 'error';
        }
        setMessage('Listening stopped. Tap Start listening to try again.');
        return 'idle';
      });
    };

    recognitionRef.current = recognition;
    setStatus('starting');
    setMessage('Starting microphone… allow access if the browser asks.');
    try {
      recognition.start();
    } catch (cause) {
      recognitionRef.current = null;
      setStatus('error');
      setMessage(cause instanceof Error ? `Could not start voice search: ${cause.message}` : 'Could not start voice search.');
    }
  }, []);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.abort();
  }, []);

  return { status, message, start, stop, abort, listening: status === 'listening' || status === 'starting' };
}
