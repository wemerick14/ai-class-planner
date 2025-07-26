function AnalysisProgress({ progress, isVisible = true }) {
  if (!isVisible) return null

  const { step, progress: percentage, details } = progress

  const steps = [
    { name: 'Extracting text from documents', min: 0, max: 20 },
    { name: 'Analyzing transcript', min: 20, max: 40 },
    { name: 'Analyzing degree audit', min: 40, max: 60 },
    { name: 'Generating graduation timeline', min: 60, max: 90 },
    { name: 'Analysis complete', min: 90, max: 100 }
  ]

  const currentStepIndex = steps.findIndex(s => s.name === step)
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Analyzing Your Documents
          </h2>
          <p className="text-gray-600">
            Our AI is processing your academic information to create your personalized graduation plan
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{step}</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          {details && (
            <p className="text-sm text-gray-500 mt-2">{details}</p>
          )}
        </div>

        {/* Step Indicators */}
        <div className="space-y-3">
          {steps.map((stepInfo, index) => {
            const isCompleted = percentage > stepInfo.max
            const isActive = currentStepIndex === index
            const isPending = currentStepIndex < index

            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-sm ${
                  isCompleted || isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {stepInfo.name}
                </span>
                {isActive && (
                  <div className="flex-1 flex justify-end">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-blue-900">Processing Information</p>
              <p className="text-blue-700">
                This may take 1-2 minutes depending on document size and complexity. 
                Your data is processed securely and stored only on your device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisProgress