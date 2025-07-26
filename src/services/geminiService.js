import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  constructor() {
    // API key will need to be provided by user or set in environment
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null
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

    const prompt = `
    Analyze this academic transcript and extract the following information in JSON format:

    Extract all completed courses with the following structure:
    {
      "studentInfo": {
        "name": "Student Name (if available)",
        "studentId": "ID (if available)",
        "gpa": "Overall GPA",
        "totalCredits": "Total credits completed"
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

    Document content:
    ${documentText}

    Please extract only actual course information, ignore headers, footers, and formatting. For grades, use standard letter grades (A, B, C, D, F) or numeric equivalents. If information is not available, use null.
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
      console.error('Error parsing transcript:', error)
      throw new Error(`Failed to parse transcript: ${error.message}`)
    }
  }

  async parseDegreeAudit(documentText) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please provide API key.')
    }

    const prompt = `
    Analyze this degree audit document and extract remaining requirements in JSON format:

    Extract the following structure:
    {
      "degreeInfo": {
        "degreeName": "Bachelor of Business Administration",
        "major": "Finance",
        "minor": "Data Analytics (if applicable)",
        "expectedGraduation": "Spring 2026"
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
          "remaining": [
            {
              "courseCode": "DATA 3310",
              "courseName": "Database Management",
              "credits": 3,
              "prerequisites": ["MIS 2301"],
              "offered": ["Fall", "Spring"]
            }
          ]
        },
        "generalEducation": {
          "totalRequired": 42,
          "completed": 36,
          "remaining": [
            {
              "category": "History",
              "courseCode": "HIST 2301",
              "courseName": "Texas History",
              "credits": 3,
              "prerequisites": [],
              "offered": ["Fall", "Spring", "Summer"]
            }
          ]
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

    Document content:
    ${documentText}

    Focus on identifying specific course requirements, not completed courses. Extract course codes, names, credit hours, and any scheduling information (fall/spring/summer offerings). If information is not available, use reasonable defaults.
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
      console.error('Error parsing degree audit:', error)
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