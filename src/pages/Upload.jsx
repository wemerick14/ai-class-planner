import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ApiKeySetup from '../components/ApiKeySetup'
import AnalysisProgress from '../components/AnalysisProgress'
import { useAIAnalysis } from '../hooks/useAIAnalysis'

function Upload() {
  const navigate = useNavigate()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState({
    transcript: null,
    degreeAudit: null
  })
  const [apiKey, setApiKey] = useState('')
  const [showAnalysis, setShowAnalysis] = useState(false)
  
  const { isAnalyzing, analysisProgress, analyzeDocuments } = useAIAnalysis()

  useEffect(() => {
    // Check for environment variable first, then stored API key
    const envKey = import.meta.env.VITE_GEMINI_API_KEY
    const stored = localStorage.getItem('geminiApiKey')
    
    if (envKey) {
      setApiKey(envKey)
    } else if (stored) {
      setApiKey(stored)
    }
  }, [])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e, fileType) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => ({
        ...prev,
        [fileType]: e.dataTransfer.files[0]
      }))
    }
  }

  const handleFileSelect = (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({
        ...prev,
        [fileType]: e.target.files[0]
      }))
    }
  }

  const handleContinue = () => {
    if (files.transcript || files.degreeAudit) {
      // Store files in localStorage for now
      localStorage.setItem('uploadedFiles', JSON.stringify({
        transcript: files.transcript?.name,
        degreeAudit: files.degreeAudit?.name,
        uploadedAt: new Date().toISOString()
      }))
      
      // Check if we have API key for immediate analysis
      if (apiKey) {
        setShowAnalysis(true)
        startAnalysis()
      } else {
        navigate('/onboarding')
      }
    }
  }

  const startAnalysis = async () => {
    try {
      // Get preferences from localStorage if available, otherwise use defaults
      const storedPreferences = localStorage.getItem('studentPreferences')
      const preferences = storedPreferences ? JSON.parse(storedPreferences) : {
        graduationDate: { semester: 'Spring', year: new Date().getFullYear() + 2 },
        maxCreditsPerSemester: 15,
        summerSessions: false,
        winterSessions: false
      }

      await analyzeDocuments(files, preferences, apiKey)
      navigate('/dashboard')
    } catch (error) {
      console.error('Analysis failed:', error)
      alert(`Analysis failed: ${error.message}`)
      setShowAnalysis(false)
    }
  }

  const handleApiKeySet = (key) => {
    setApiKey(key)
  }

  return (
    <>
      <AnalysisProgress progress={analysisProgress} isVisible={showAnalysis && isAnalyzing} />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Your Academic Documents
          </h1>
          <p className="text-lg text-gray-600">
            Upload your transcript and degree audit to get started. We'll analyze them to create your personalized graduation plan.
          </p>
        </div>

        {/* API Key Setup */}
        {!apiKey && (
          <div className="mb-8">
            <ApiKeySetup onApiKeySet={handleApiKeySet} />
          </div>
        )}

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Transcript Upload */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Official Transcript
          </h3>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'transcript')}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e, 'transcript')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {files.transcript ? (
              <div className="text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">{files.transcript.name}</p>
                <p className="text-xs text-gray-500">Click to replace</p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-900 mb-1">Upload your transcript</p>
                <p className="text-xs text-gray-500">PDF, DOC, or TXT files</p>
              </div>
            )}
          </div>
        </div>

        {/* Degree Audit Upload */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 text-secondary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Degree Audit
          </h3>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? 'border-secondary-500 bg-secondary-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={(e) => handleDrop(e, 'degreeAudit')}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e, 'degreeAudit')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {files.degreeAudit ? (
              <div className="text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">{files.degreeAudit.name}</p>
                <p className="text-xs text-gray-500">Click to replace</p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-900 mb-1">Upload your degree audit</p>
                <p className="text-xs text-gray-500">PDF, DOC, or TXT files</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="card bg-blue-50 border-blue-200 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Your documents are processed locally and securely
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            AI extracts your completed courses and remaining requirements
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            We'll ask about your graduation timeline preferences
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            Generate personalized graduation scenarios just for you
          </li>
        </ul>
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={!files.transcript && !files.degreeAudit}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            files.transcript || files.degreeAudit
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Preferences
        </button>
        {!files.transcript && !files.degreeAudit && (
          <p className="text-sm text-gray-500 mt-2">
            Please upload at least one document to continue
          </p>
        )}
      </div>
    </div>
    </>
  )
}

export default Upload