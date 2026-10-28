import { ref, onMounted, onUnmounted } from 'vue'

const deferredPrompt = ref(null)
const isInstalled = ref(false)
const isIOS = ref(false)
const isInstallable = ref(false)

export function usePWAInstall() {
  const checkStandalone = () => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    isInstalled.value = isStandaloneMode
    if (isStandaloneMode) {
      isInstallable.value = false
    }
  }

  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    isInstallable.value = true
  }

  const handleAppInstalled = () => {
    isInstalled.value = true
    isInstallable.value = false
    deferredPrompt.value = null
  }

  onMounted(() => {
    checkStandalone()

    const ua = window.navigator.userAgent.toLowerCase()
    isIOS.value = /iphone|ipad|ipod/.test(ua) && !window.MSStream

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })

  const install = async () => {
    if (!deferredPrompt.value) return false
    try {
      await deferredPrompt.value.prompt()
      const choice = await deferredPrompt.value.userChoice
      if (choice && choice.outcome === 'accepted') {
        isInstalled.value = true
        isInstallable.value = false
        deferredPrompt.value = null
        return true
      }
    } catch (err) {
      console.warn('PWA install error:', err)
    }
    return false
  }

  return {
    isInstallable,
    isInstalled,
    isIOS,
    install,
  }
}
