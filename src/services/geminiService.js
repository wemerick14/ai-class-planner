import { GoogleGenerativeAI } from '@google/generative-ai'
import DocumentPreprocessor from './documentPreprocessor.js'

class GeminiService {
  constructor() {
    // Use environment variable or stored API key
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('geminiApiKey') || null
    this.genAI = null
    this.model = null
    
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    }
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  }

  isConfigured() {
    return this.apiKey && this.genAI && this.model
  }

  async parseTranscript(documentText) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please provide API key.')
    }

    // Preprocess document to reduce token usage and improve accuracy
    const preprocessed = DocumentPreprocessor.preprocessDocument(documentText, 'transcript')
    const analysis = DocumentPreprocessor.analyzeDocument(documentText)
    
    console.log(`Transcript preprocessing: ${analysis.compressionRatio.toFixed(1)}% reduction, ~${analysis.estimatedTokens} tokens`)

    const prompt = `
Extract course information from this transcript and return ONLY valid JSON:

{
  "studentInfo": {
    "name": "Student Name or null",
    "studentId": "ID or null", 
    "gpa": "Overall GPA or null",
    "totalCredits": "Total credits or null"
  },
  "completedCourses": [
    {
      "courseCode": "MATH 1301",
      "courseName": "College Algebra",
      "credits": 3,
      "grade": "A",
      "semester": "Fall 2022",
      "gradePoints": 4.0
    }
  ],
  "summary": {
    "totalCourses": 45,
    "totalCredits": 87,
    "gpa": 3.67,
    "lastSemester": "Spring 2024"
  }
}

IMPORTANT: Return ONLY the JSON object, no other text.

Transcript content:
${preprocessed}
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      // More robust JSON extraction
      let jsonText = text
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '')
      
      // Find JSON object bounds
      const startIndex = jsonText.indexOf('{')
      const lastIndex = jsonText.lastIndexOf('}')
      
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        jsonText = jsonText.substring(startIndex, lastIndex + 1)
        return JSON.parse(jsonText)
      } else {
        throw new Error('No valid JSON object found in response')
      }
    } catch (error) {
      console.error('Error parsing transcript:', error)
      console.error('Response text:', text)
      throw new Error(`Failed to parse transcript: ${error.message}`)
    }
  }

  async parseDegreeAudit(documentText) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please provide API key.')
    }

    // Preprocess document to reduce token usage and improve accuracy
    const preprocessed = DocumentPreprocessor.preprocessDocument(documentText, 'degreeAudit')
    const analysis = DocumentPreprocessor.analyzeDocument(documentText)
    
    console.log(`Degree audit preprocessing: ${analysis.compressionRatio.toFixed(1)}% reduction, ~${analysis.estimatedTokens} tokens`)

    const prompt = `
Extract degree requirements from this audit and return ONLY valid JSON:

{
  "degreeInfo": {
    "degreeName": "Bachelor of Business Administration or null",
    "major": "Finance or null",
    "minor": "Data Analytics or null",
    "expectedGraduation": "Spring 2026 or null"
  },
  "requirements": {
    "majorRequirements": {
      "totalRequired": 36,
      "completed": 24,
      "remaining": [
        {
          "courseCode": "FIN 4350",
          "courseName": "Corporate Finance",
          "credits": 3,
          "prerequisites": ["FIN 3320"],
          "offered": ["Fall", "Spring"]
        }
      ]
    },
    "minorRequirements": {
      "totalRequired": 18,
      "completed": 12,
      "remaining": []
    },
    "generalEducation": {
      "totalRequired": 42,
      "completed": 36,
      "remaining": []
    },
    "electives": {
      "totalRequired": 24,
      "completed": 15,
      "remaining": 9,
      "description": "Any 3000+ level courses"
    }
  },
  "summary": {
    "totalCreditsRequired": 120,
    "totalCreditsCompleted": 87,
    "totalCreditsRemaining": 33,
    "estimatedSemesters": 3
  }
}

IMPORTANT: Return ONLY the JSON object, no other text.

Degree audit content:
${preprocessed}
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      // More robust JSON extraction
      let jsonText = text
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '')
      
      // Find JSON object bounds
      const startIndex = jsonText.indexOf('{')
      const lastIndex = jsonText.lastIndexOf('}')
      
      if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
        jsonText = jsonText.substring(startIndex, lastIndex + 1)
        return JSON.parse(jsonText)
      } else {
        throw new Error('No valid JSON object found in response')
      }
    } catch (error) {
      console.error('Error parsing degree audit:', error)
      console.error('Response text:', text)
      throw new Error(`Failed to parse degree audit: ${error.message}`)
    }
  }

  async generateGraduationTimeline(transcriptData, degreeAuditData, preferences) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please provide API key.')
    }

    const prompt = `
    Based on the following academic data and student preferences, create optimized graduation timeline scenarios:

    TRANSCRIPT DATA:
    ${JSON.stringify(transcriptData, null, 2)}

    DEGREE AUDIT DATA:
    ${JSON.stringify(degreeAuditData, null, 2)}

    STUDENT PREFERENCES:
    ${JSON.stringify(preferences, null, 2)}

    Create 3 graduation scenarios in this JSON format:
    {
      "scenarios": [
        {
          "name": "Standard Timeline",
          "description": "Regular course load with traditional semesters",
          "graduationDate": {
            "semester": "Spring",
            "year": 2026
          },
          "timeline": [
            {
              "semester": "Fall 2024",
              "courses": [
                {
                  "courseCode": "FIN 4350",
                  "courseName": "Corporate Finance",
                  "credits": 3,
                  "reason": "Major requirement"
                }
              ],
              "totalCredits": 15,
              "difficulty": "Moderate"
            }
          ],
          "summary": {
            "totalSemesters": 3,
            "summerCourses": 0,
            "winterCourses": 0,
            "avgCreditsPerSemester": 15,
            "estimatedCost": "$15000",
            "advantages": ["Manageable workload", "Traditional timeline"],
            "challenges": ["Longer timeline"]
          }
        }
      ],
      "recommendations": {
        "preferredScenario": "Standard Timeline",
        "reasoning": "Best balance of workload and timeline",
        "criticalPrerequisites": ["FIN 3320 before FIN 4350"],
        "schedulingAlerts": ["FIN 4360 only offered in Spring"]
      }
    }

    Consider:
    - Student's max credits per semester preference
    - Winter/summer session availability
    - Course prerequisites and scheduling constraints
    - Target graduation date
    - Create realistic scenarios (accelerated, standard, relaxed)
    - Include specific course recommendations for each semester
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not extract valid JSON from response')
      }
    } catch (error) {
      console.error('Error generating timeline:', error)
      throw new Error(`Failed to generate timeline: ${error.message}`)
    }
  }
}

export default new GeminiService()