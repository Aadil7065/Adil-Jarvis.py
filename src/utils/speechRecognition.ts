// Web Speech API Voice Recognition Wrapper for JARVIS

export interface SpeechListenerOptions {
  lang?: string;
  continuous?: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export class JarvisSpeechListener {
  private recognition: any = null;
  private isListening: boolean = false;
  private options: SpeechListenerOptions | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  start(options: SpeechListenerOptions) {
    if (!this.recognition) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    this.options = options;
    this.recognition.lang = options.lang || 'en-US';
    this.recognition.continuous = options.continuous ?? false;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.options?.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        this.options?.onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        this.options?.onResult(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      // Ignore 'no-speech' or 'aborted' without crashing
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        this.options?.onError?.(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.options?.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition already started or error:', e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      this.isListening = false;
    }
  }

  getActiveState(): boolean {
    return this.isListening;
  }
}

export const speechListener = new JarvisSpeechListener();
