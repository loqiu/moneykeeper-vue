import { ref, onMounted } from 'vue'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = '161545064775-0d898na3c3cgrl8htbsod2o73smjvo3p.apps.googleusercontent.com'

export function useGoogleLogin(callback) {
    const isReady = ref(false)

    const loadGoogleScript = () => {
        if (document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)) {
            checkGoogleObject()
            return
        }

        const script = document.createElement('script')
        script.src = GOOGLE_SCRIPT_SRC
        script.async = true
        script.defer = true
        script.onload = checkGoogleObject
        document.head.appendChild(script)
    }

    const checkGoogleObject = () => {
        if (window.google && window.google.accounts) {
            isReady.value = true
            initializeGoogleLogin()
        } else {
            setTimeout(checkGoogleObject, 100)
        }
    }

    const initializeGoogleLogin = () => {
        if (!window.google) return

        window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        })
    }

    const handleCredentialResponse = (response) => {
        if (callback) {
            callback(response)
        }
    }

    const renderGoogleButton = (elementId, options = {}) => {
        if (!isReady.value || !window.google) {
            // Retry if not ready
            const interval = setInterval(() => {
                if (isReady.value && window.google) {
                    clearInterval(interval)
                    renderGoogleButton(elementId, options)
                }
            }, 100)
            return
        }

        const element = document.getElementById(elementId)
        if (element) {
            window.google.accounts.id.renderButton(element, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'pill',
                text: 'signin_with',
                ...options
            })
        }
    }

    onMounted(() => {
        loadGoogleScript()
    })

    return {
        isReady,
        renderGoogleButton
    }
}
