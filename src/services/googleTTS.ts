/**
 * Google Cloud Text-to-Speech Service
 * Provides high-quality voice synthesis using Google's API
 */

const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

interface GoogleTTSRequest {
  input: {
    text: string;
  };
  voice: {
    languageCode: string;
    name: string;
  };
  audioConfig: {
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    pitch?: number;
    speakingRate?: number;
  };
}

interface GoogleTTSResponse {
  audioContent: string; // Base64 encoded audio
}

/**
 * Convert text to speech using Google Cloud Text-to-Speech API
 * @param text Text to convert to speech
 * @param options Optional voice and audio configuration
 * @returns Promise<string> Base64 encoded audio content
 */
export const synthesizeSpeech = async (
  text: string,
  options?: {
    languageCode?: string;
    voiceName?: string;
    audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    pitch?: number;
    speakingRate?: number;
  }
): Promise<string> => {
  if (!GOOGLE_TTS_API_KEY) {
    throw new Error('Google TTS API key is not configured. Please add VITE_GOOGLE_TTS_API_KEY to .env file.');
  }

  const requestBody: GoogleTTSRequest = {
    input: {
      text: text
    },
    voice: {
      languageCode: options?.languageCode || 'en-IN',
      name: options?.voiceName || 'en-IN-Wavenet-D'
    },
    audioConfig: {
      audioEncoding: options?.audioEncoding || 'MP3',
      pitch: options?.pitch,
      speakingRate: options?.speakingRate
    }
  };

  try {
    const response = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${GOOGLE_TTS_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google TTS API error: ${response.status} - ${errorText}`);
    }

    const data: GoogleTTSResponse = await response.json();
    return data.audioContent;
  } catch (error) {
    console.error('❌ Google TTS API error:', error);
    throw error;
  }
};

/**
 * Play audio from base64 encoded content
 * @param base64Audio Base64 encoded audio
 * @returns Promise<void> Resolves when audio finishes playing
 */
export const playAudioFromBase64 = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Convert base64 to blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create audio element
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      // Play the audio
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Speak text using Google Cloud Text-to-Speech
 * This is the main function to use for TTS
 * @param text Text to speak
 * @param options Optional voice and audio configuration
 * @returns Promise<void> Resolves when speech is complete
 */
export const speakText = async (
  text: string,
  options?: {
    languageCode?: string;
    voiceName?: string;
    audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    pitch?: number;
    speakingRate?: number;
  }
): Promise<void> => {
  console.log(`🗣️ Starting Google TTS:`, text.substring(0, 50) + '...');
  
  try {
    const audioContent = await synthesizeSpeech(text, options);
    await playAudioFromBase64(audioContent);
    console.log('✅ Google TTS completed successfully');
  } catch (error) {
    console.error('❌ Google TTS failed:', error);
    throw error;
  }
};

// Audio element for managing playback
let currentAudio: HTMLAudioElement | null = null;
let isPlaybackInProgress = false;

/**
 * Stop currently playing audio
 */
export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    isPlaybackInProgress = false;
    console.log('🛑 Stopped Google TTS playback');
  }
};

/**
 * Enhanced version with playback control
 * @param text Text to speak
 * @param options Optional voice and audio configuration
 * @returns Promise<void> Resolves when speech is complete
 */
export const speakTextWithControl = (
  text: string,
  options?: {
    languageCode?: string;
    voiceName?: string;
    audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    pitch?: number;
    speakingRate?: number;
  }
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    // Prevent multiple simultaneous calls
    if (isPlaybackInProgress) {
      console.log('⚠️ TTS playback already in progress, rejecting duplicate call');
      reject(new Error('TTS playback already in progress'));
      return;
    }

    console.log(`🗣️ Starting Google TTS with control:`, text.substring(0, 50) + '...');
    
    try {
      isPlaybackInProgress = true;
      
      // Stop any currently playing audio
      stopSpeaking();
      
      const audioContent = await synthesizeSpeech(text, options);
      
      // Convert base64 to blob
      const binaryString = atob(audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create audio element
      currentAudio = new Audio(audioUrl);
      
      currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        isPlaybackInProgress = false;
        console.log('✅ Google TTS completed successfully');
        resolve();
      };
      
      currentAudio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        isPlaybackInProgress = false;
        console.error('❌ Audio playback error:', error);
        reject(error);
      };
      
      // Play the audio
      await currentAudio.play();
    } catch (error) {
      console.error('❌ Google TTS failed:', error);
      currentAudio = null;
      isPlaybackInProgress = false;
      reject(error);
    }
  });
};
