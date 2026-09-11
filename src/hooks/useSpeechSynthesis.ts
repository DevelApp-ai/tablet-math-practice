import { useCallback, useEffect, useState } from 'react'

/**
 * Phase 6 (plan §8.2): Web Speech API "read aloud" hook. Dependency-free and
 * guarded for browsers without the API. Respects the active locale via the
 * document language (set by the app's i18n detector) with a navigator fallback.
 */
export function useSpeechSynthesis() {
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  )
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!supported) return
    const handleEnd = () => setSpeaking(false)
    window.speechSynthesis.addEventListener('end', handleEnd)
    return () => {
      window.speechSynthesis.removeEventListener('end', handleEnd)
    }
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const docLang = typeof document !== 'undefined' ? document.documentElement.lang : ''
      utterance.lang = docLang || (typeof navigator !== 'undefined' ? navigator.language : '') || 'en-US'
      utterance.rate = 0.9
      setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [supported]
  )

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported, speaking, speak, stop }
}
