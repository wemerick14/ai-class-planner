import { useState, useCallback } from 'react'
import geminiService from '../services/geminiService'
import documentProcessor from '../services/documentProcessor'

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState({
    step: '',
    progress: 0,
    details: ''
  })
  const [analysisResults, setAnalysisResults] = useState({
    transcriptData: null,
    degreeAuditData: null,
    timelineData: null,
    error: null
  })

  const updateProgress = useCallback((step, progress, details = '') => {
    setAnalysisProgress({ step, progress, details })
  }, [])

  const analyzeDocuments = useCallback(async (files, preferences, apiKey) => {
    setIsAnalyzing(true)
    setAnalysisResults({ transcriptData: null, degreeAuditData: null, timelineData: null, error: null })
    
    try {
      // Set up Gemini API key
      if (apiKey) {
        geminiService.setApiKey(apiKey)
      }

      if (!geminiService.isConfigured()) {
        throw new Error('Gemini API key is required for document analysis')
      }

      updateProgress('Extracting text from documents', 10, 'Processing uploaded files...')
      
      // Process uploaded files
      const documentResults = await documentProcessor.processDocuments(
        Object.values(files).filter(Boolean)
      )

      const failedDocuments = documentResults.filter(result => !result.success)
      if (failedDocuments.length > 0) {
        throw new Error(`Failed to process documents: ${failedDocuments.map(d => d.error).join(', ')}`)
      }

      // Separate transcript and degree audit
      const transcriptFile = documentResults.find(result => 
        result.file.toLowerCase().includes('transcript') || 
        files.transcript?.name === result.file
      )
      const degreeAuditFile = documentResults.find(result => 
        result.file.toLowerCase().includes('audit') || 
        files.degreeAudit?.name === result.file
      )

      let transcriptData = null
      let degreeAuditData = null

      // Parse transcript if available - simple single API call with preprocessing
      if (transcriptFile) {
        updateProgress('Analyzing transcript', 30, 'Extracting course history and grades with AI preprocessing...')
        transcriptData = await geminiService.parseTranscript(transcriptFile.text)
        
        // Store in localStorage for persistence
        localStorage.setItem('transcriptData', JSON.stringify(transcriptData))
      }

      // Parse degree audit if available - simple single API call with preprocessing
      if (degreeAuditFile) {
        updateProgress('Analyzing degree audit', 60, 'Identifying remaining requirements with AI preprocessing...')
        degreeAuditData = await geminiService.parseDegreeAudit(degreeAuditFile.text)
        
        // Store in localStorage for persistence
        localStorage.setItem('degreeAuditData', JSON.stringify(degreeAuditData))
      }

      // Generate timeline if we have sufficient data
      let timelineData = null
      if ((transcriptData || degreeAuditData) && preferences) {
        updateProgress('Generating graduation timeline', 85, 'Creating personalized graduation scenarios...')
        timelineData = await geminiService.generateGraduationTimeline(
          transcriptData, 
          degreeAuditData, 
          preferences
        )
        
        // Store in localStorage for persistence
        localStorage.setItem('timelineData', JSON.stringify(timelineData))
      }

      updateProgress('Analysis complete', 100, 'Your graduation plan is ready!')

      const results = {
        transcriptData,
        degreeAuditData,
        timelineData,
        error: null
      }

      setAnalysisResults(results)
      
      // Store complete analysis results
      localStorage.setItem('analysisResults', JSON.stringify({
        ...results,
        analyzedAt: new Date().toISOString()
      }))

      return results

    } catch (error) {
      console.error('AI Analysis Error:', error)
      const errorResult = {
        transcriptData: null,
        degreeAuditData: null,
        timelineData: null,
        error: error.message
      }
      
      setAnalysisResults(errorResult)
      updateProgress('Analysis failed', 0, error.message)
      
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }, [updateProgress])

  const loadStoredResults = useCallback(() => {
    try {
      const stored = localStorage.getItem('analysisResults')
      if (stored) {
        const results = JSON.parse(stored)
        setAnalysisResults(results)
        return results
      }
    } catch (error) {
      console.error('Error loading stored results:', error)
    }
    return null
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysisResults({
      transcriptData: null,
      degreeAuditData: null,
      timelineData: null,
      error: null
    })
    setAnalysisProgress({ step: '', progress: 0, details: '' })
    
    // Clear from localStorage
    localStorage.removeItem('analysisResults')
    localStorage.removeItem('transcriptData')
    localStorage.removeItem('degreeAuditData')
    localStorage.removeItem('timelineData')
  }, [])

  return {
    isAnalyzing,
    analysisProgress,
    analysisResults,
    analyzeDocuments,
    loadStoredResults,
    clearAnalysis
  }
}