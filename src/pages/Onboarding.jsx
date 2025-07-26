import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Onboarding() {
  const navigate = useNavigate()
  const [preferences, setPreferences] = useState({
    graduationDate: {
      semester: 'Spring',
      year: new Date().getFullYear() + 2
    },
    winterSessions: false,
    summerSessions: false,
    maxCreditsPerSemester: 15,
    flexibleTimeline: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Store preferences in localStorage
    localStorage.setItem('studentPreferences', JSON.stringify(preferences))
    
    // Navigate to dashboard
    navigate('/dashboard')
  }

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateGraduationDate = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      graduationDate: {
        ...prev.graduationDate,
        [field]: value
      }
    }))
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tell Us About Your Goals
        </h1>
        <p className="text-lg text-gray-600">
          Help us create the perfect graduation timeline by sharing your preferences and constraints.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Graduation Timeline */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Graduation Timeline</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Graduation Semester
              </label>
              <select
                value={preferences.graduationDate.semester}
                onChange={(e) => updateGraduationDate('semester', e.target.value)}
                className="input-field"
              >
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Graduation Year
              </label>
              <select
                value={preferences.graduationDate.year}
                onChange={(e) => updateGraduationDate('year', parseInt(e.target.value))}
                className="input-field"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.flexibleTimeline}
                onChange={(e) => updatePreference('flexibleTimeline', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                I'm flexible with my graduation date (±1 semester)
              </span>
            </label>
          </div>
        </div>

        {/* Session Availability */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Availability</h2>
          
          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={preferences.summerSessions}
                onChange={(e) => updatePreference('summerSessions', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Summer Sessions</span>
                <p className="text-sm text-gray-600">
                  I'm willing to take courses during summer sessions to accelerate my graduation
                </p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={preferences.winterSessions}
                onChange={(e) => updatePreference('winterSessions', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Winter Sessions</span>
                <p className="text-sm text-gray-600">
                  I'm willing to take courses during winter intersession/January term
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Course Load Preferences */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Load Preferences</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Credit Hours Per Semester
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="12"
                max="21"
                value={preferences.maxCreditsPerSemester}
                onChange={(e) => updatePreference('maxCreditsPerSemester', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-gray-900 w-8">
                {preferences.maxCreditsPerSemester}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Light Load (12)</span>
              <span>Heavy Load (21)</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Course Load Recommendation</p>
                <p className="text-sm text-yellow-700">
                  Most students take 15-18 credit hours per semester. Consider your other commitments when choosing your load.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
          >
            <span>Create My Graduation Plan</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="text-sm text-gray-500 mt-3">
            We'll analyze your documents and preferences to create personalized graduation scenarios
          </p>
        </div>
      </form>
    </div>
  )
}

export default Onboarding