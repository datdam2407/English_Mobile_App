import { ref } from 'vue'

export function useAudio() {
  const isPlaying = ref(false)
  const currentPlayingWord = ref('')
  const currentPlayingAccent = ref('US') // 'UK' or 'US'

  const playAudio = async (word, accent = 'US') => {
    if (!word) return

    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this browser')
      return
    }

    try {
      isPlaying.value = true
      currentPlayingWord.value = word
      currentPlayingAccent.value = accent.toUpperCase()

      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(word)
      const targetLang = accent.toUpperCase() === 'UK' ? 'en-GB' : 'en-US'
      utterance.lang = targetLang
      utterance.rate = 0.88 // Clear, natural speed
      utterance.pitch = 1

      // Pick matching voice if available
      const voices = speechSynthesis.getVoices()
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find(v => 
          accent.toUpperCase() === 'UK'
            ? v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB')
            : v.lang.startsWith('en-US') || v.lang.startsWith('en_US')
        )
        if (matchingVoice) {
          utterance.voice = matchingVoice
        }
      }

      utterance.onend = () => {
        isPlaying.value = false
        currentPlayingWord.value = ''
      }

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e)
        isPlaying.value = false
        currentPlayingWord.value = ''
      }

      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Error with speech synthesis:', error)
      isPlaying.value = false
      currentPlayingWord.value = ''
    }
  }

  const playAudioUK = (word) => playAudio(word, 'UK')
  const playAudioUS = (word) => playAudio(word, 'US')

  return {
    isPlaying,
    currentPlayingWord,
    currentPlayingAccent,
    playAudio,
    playAudioUK,
    playAudioUS
  }
}
