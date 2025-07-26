import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Plan Your Perfect
            <span className="text-primary-600"> Graduation Timeline</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your transcript and degree audit, then let AI create optimized graduation plans 
            that fit your schedule and preferences.
          </p>
          <Link
            to="/upload"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
          >
            <span>Get Started</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
            <p className="text-gray-600">
              Simply upload your transcript and degree audit. Our AI will extract all the important information.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              Advanced AI processes your academic history and identifies optimal course sequences.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Planning</h3>
            <p className="text-gray-600">
              Get multiple graduation scenarios with summer/winter options and flexible timelines.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to optimize your graduation path?
          </h2>
          <p className="text-gray-600 mb-6">
            Join students who are already using AI to plan smarter graduation timelines.
          </p>
          <Link to="/upload" className="btn-primary">
            Start Planning Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home