import { useState, useEffect } from 'react'
import { useAIAnalysis } from '../hooks/useAIAnalysis'
import AnalysisProgress from '../components/AnalysisProgress'

function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const { analysisResults, loadStoredResults, isAnalyzing, analysisProgress } = useAIAnalysis()

  useEffect(() => {
    // Load data from localStorage
    const files = localStorage.getItem('uploadedFiles')
    const prefs = localStorage.getItem('studentPreferences')
    
    if (files) setUploadedFiles(JSON.parse(files))
    if (prefs) setPreferences(JSON.parse(prefs))
    
    // Load any existing analysis results
    loadStoredResults()
  }, [loadStoredResults])

  // Show analysis progress if currently analyzing
  if (isAnalyzing) {
    return <AnalysisProgress progress={analysisProgress} isVisible={true} />
  }

  // Use real analysis data if available, otherwise fall back to mock data
  const data = analysisResults.transcriptData || analysisResults.degreeAuditData ? {
    // Real data from AI analysis
    completedCredits: analysisResults.transcriptData?.summary?.totalCredits || 87,
    remainingCredits: analysisResults.degreeAuditData?.summary?.totalCreditsRemaining || 33,
    totalCredits: analysisResults.degreeAuditData?.summary?.totalCreditsRequired || 120,
    gpa: analysisResults.transcriptData?.summary?.gpa || 3.67,
    remainingRequirements: analysisResults.degreeAuditData ? Object.entries(analysisResults.degreeAuditData.requirements || {}).map(([key, req]) => ({
      category: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      completed: req.completed || 0,
      total: req.totalRequired || 0,
      courses: req.remaining ? req.remaining.map(course => course.courseCode || course.courseName).slice(0, 4) : []
    })) : mockData.remainingRequirements,
    scenarios: analysisResults.timelineData?.scenarios || mockData.scenarios
  } : mockData

  // Mock data for demonstration
  const mockData = {
    completedCredits: 87,
    remainingCredits: 33,
    totalCredits: 120,
    gpa: 3.67,
    remainingRequirements: [
      { category: 'Major Requirements', completed: 8, total: 12, courses: ['FIN 4350', 'FIN 4360', 'MKT 4380', 'MGMT 4390'] },
      { category: 'Minor Requirements', completed: 4, total: 6, courses: ['DATA 3310', 'DATA 4320'] },
      { category: 'General Education', completed: 10, total: 12, courses: ['HIST 2301', 'PHIL 1301'] },
      { category: 'Free Electives', completed: 2, total: 3, courses: ['Any 3000+ level'] }
    ],
    scenarios: [
      {
        name: 'Standard Timeline',
        graduationDate: 'Spring 2026',
        semesters: 3,
        summerCourses: 0,
        avgCreditsPerSemester: 15
      },
      {
        name: 'Accelerated Timeline',
        graduationDate: 'Fall 2025',
        semesters: 2,
        summerCourses: 6,
        avgCreditsPerSemester: 18
      },
      {
        name: 'Relaxed Timeline',
        graduationDate: 'Fall 2026',
        semesters: 4,
        summerCourses: 0,
        avgCreditsPerSemester: 12
      }
    ]
  }

  const progressPercentage = (data.completedCredits / data.totalCredits) * 100

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Your Graduation Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Based on your academic history and preferences, here's your personalized graduation plan.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {data.completedCredits}
          </div>
          <div className="text-sm text-gray-600">Credits Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-secondary-600 mb-2">
            {data.remainingCredits}
          </div>
          <div className="text-sm text-gray-600">Credits Remaining</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {data.gpa}
          </div>
          <div className="text-sm text-gray-600">Current GPA</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-sm text-gray-600">Degree Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Degree Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-primary-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{data.completedCredits} credits completed</span>
          <span>{data.remainingCredits} credits to go</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Remaining Requirements */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Remaining Requirements</h3>
          <div className="space-y-4">
            {data.remainingRequirements.map((req, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{req.category}</h4>
                  <span className="text-sm text-gray-600">{req.completed}/{req.total} complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-secondary-600 h-2 rounded-full"
                    style={{ width: `${(req.completed / req.total) * 100}%` }}
                  ></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {req.courses.map((course, courseIndex) => (
                    <span key={courseIndex} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graduation Scenarios */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Graduation Scenarios</h3>
          <div className="space-y-4">
            {data.scenarios.map((scenario, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                  <span className="text-sm font-medium text-primary-600">{scenario.graduationDate}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="block text-gray-900 font-medium">{scenario.semesters}</span>
                    <span>Semesters</span>
                  </div>
                  <div>
                    <span className="block text-gray-900 font-medium">{scenario.avgCreditsPerSemester}</span>
                    <span>Avg Credits</span>
                  </div>
                  <div>
                    <span className="block text-gray-900 font-medium">{scenario.summerCourses}</span>
                    <span>Summer Credits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 btn-primary">
            View Detailed Schedule
          </button>
        </div>
      </div>

      {/* Upload Info */}
      {uploadedFiles && (
        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {uploadedFiles.transcript && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Transcript: {uploadedFiles.transcript}</span>
              </div>
            )}
            {uploadedFiles.degreeAudit && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Degree Audit: {uploadedFiles.degreeAudit}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard