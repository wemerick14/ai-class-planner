import { useState } from 'react'

function ApiKeySetup({ onApiKeySet, isRequired = false }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setIsValidating(true)
    try {
      // Basic validation - check if it looks like a valid API key
      if (apiKey.length < 20) {
        throw new Error('API key appears to be too short')
      }

      // Store in localStorage (you might want to use more secure storage in production)
      localStorage.setItem('geminiApiKey', apiKey)
      
      onApiKeySet(apiKey)
    } catch (error) {
      alert(error.message)
    } finally {
      setIsValidating(false)
    }
  }

  const loadStoredKey = () => {
    const stored = localStorage.getItem('geminiApiKey')
    if (stored) {
      setApiKey(stored)
      onApiKeySet(stored)
    }
  }

  return (
    <div className="card bg-blue-50 border-blue-200">
      <div className="flex items-start space-x-3 mb-4">
        <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-1.105 0-2.105-.452-2.829-1.172M15 7a2 2 0 00-2 2m2-2v10a6 6 0 01-6 6c-1.657 0-3.157-.672-4.243-1.757M15 7a2 2 0 012 2m-2-2v10a6 6 0 01-6 6c-1.105 0-2.105-.452-2.829-1.172" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Google Gemini API Key Required
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            To analyze your documents with AI, please provide your Google Gemini API key. 
            This key is stored locally and used only for document processing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            Google Gemini API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="input-field pr-10"
              required={isRequired}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!apiKey.trim() || isValidating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              apiKey.trim() && !isValidating
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isValidating ? 'Validating...' : 'Set API Key'}
          </button>
          
          <button
            type="button"
            onClick={loadStoredKey}
            className="btn-secondary"
          >
            Load Saved Key
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to get your API key:</h4>
        <ol className="text-xs text-blue-800 space-y-1">
          <li>1. Visit <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
          <li>2. Sign in with your Google account</li>
          <li>3. Click "Get API Key" and create a new key</li>
          <li>4. Copy the key and paste it here</li>
        </ol>
      </div>
    </div>
  )
}

export default ApiKeySetup