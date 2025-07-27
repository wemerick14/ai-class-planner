import { GoogleGenerativeAI } from '@google/generative-ai'
import DocumentPreprocessor from './documentPreprocessor.js'

class ChunkedGeminiService {
  constructor() {
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

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async parseTranscriptChunked(documentText, progressCallback) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please provide API key.')
    }

    // Preprocess and chunk the document
    const preprocessed = DocumentPreprocessor.preprocessDocument(documentText, 'transcript')
    const chunks = DocumentPreprocessor.chunkDocument(preprocessed, 7000, 400)

    if (progressCallback) {
      progressCallback(`Processing transcript in ${chunks.length} chunks...`, 10)
    }

    const allCourses = []
    let studentInfo = null
    let summary = { totalCourses: 0, totalCredits: 0, gpa: null, lastSemester: null }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      if (progressCallback) {
        const progress = 10 + (i / chunks.length) * 60
        progressCallback(`Analyzing transcript chunk ${i + 1} of ${chunks.length}...`, progress)
      }

      try {
        const chunkResult = await this.parseTranscriptChunk(chunk.text, i === 0)
        
        // Merge results
        if (chunkResult.studentInfo && !studentInfo) {
          studentInfo = chunkResult.studentInfo
        }
        
        if (chunkResult.completedCourses) {
          allCourses.push(...chunkResult.completedCourses)
        }

        // Update summary
        if (chunkResult.summary) {
          summary.totalCourses += chunkResult.summary.totalCourses || 0
          summary.totalCredits += chunkResult.summary.totalCredits || 0
          if (chunkResult.summary.gpa && !summary.gpa) {
            summary.gpa = chunkResult.summary.gpa
          }
          if (chunkResult.summary.lastSemester) {
            summary.lastSemester = chunkResult.summary.lastSemester
          }
        }

        // Rate limiting: wait between requests to avoid hitting limits
        if (i < chunks.length - 1) {
          await this.sleep(2000) // 2 second delay between chunks
        }

      } catch (error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          // Rate limit hit, wait longer and retry
          console.warn(`Rate limit hit on chunk ${i + 1}, waiting 60 seconds...`)
          if (progressCallback) {
            progressCallback(`Rate limit reached, waiting 60 seconds before continuing...`, progress)
          }
          await this.sleep(60000) // Wait 1 minute
          i-- // Retry this chunk
          continue
        }
        throw error
      }
    }

    // Deduplicate courses (in case of overlap between chunks)
    const uniqueCourses = this.deduplicateCourses(allCourses)

    return {
      studentInfo,
      completedCourses: uniqueCourses,
      summary: {
        totalCourses: uniqueCourses.length,
        totalCredits: uniqueCourses.reduce((sum, course) => sum + (course.credits || 0), 0),
        gpa: summary.gpa || this.calculateGPA(uniqueCourses),
        lastSemester: summary.lastSemester
      }
    }
  }

  async parseTranscriptChunk(chunkText, includeStudentInfo = false) {
    const prompt = `
    Analyze this transcript chunk and extract course information in JSON format:

    ${includeStudentInfo ? `
    {
      "studentInfo": {
        "name": "Student Name (if available)",
        "studentId": "ID (if available)",
        "gpa": "Overall GPA (if available)",
        "totalCredits": "Total credits (if available)"
      },
      "completedCourses": [
    ` : '{ "completedCourses": ['}
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
        "totalCourses": 5,
        "totalCredits": 15,
        "gpa": 3.67,
        "lastSemester": "Spring 2024"
      }
    }

    Document chunk:
    ${chunkText}

    Extract only courses with clear grades. Use null for missing information.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not extract valid JSON from response')
      }
    } catch (error) {
      console.error('Error parsing transcript chunk:', error)
      throw new Error(`Failed to parse transcript chunk: ${error.message}`)
    }
  }

  async parseDegreeAuditChunked(documentText, progressCallback) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please provide API key.')
    }

    // Preprocess and chunk the document
    const preprocessed = DocumentPreprocessor.preprocessDocument(documentText, 'degreeAudit')
    const chunks = DocumentPreprocessor.chunkDocument(preprocessed, 7000, 400)

    if (progressCallback) {
      progressCallback(`Processing degree audit in ${chunks.length} chunks...`, 40)
    }

    const allRequirements = {
      majorRequirements: { totalRequired: 0, completed: 0, remaining: [] },
      minorRequirements: { totalRequired: 0, completed: 0, remaining: [] },
      generalEducation: { totalRequired: 0, completed: 0, remaining: [] },
      electives: { totalRequired: 0, completed: 0, remaining: 0, description: "" }
    }
    let degreeInfo = null

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      if (progressCallback) {
        const progress = 40 + (i / chunks.length) * 30
        progressCallback(`Analyzing degree audit chunk ${i + 1} of ${chunks.length}...`, progress)
      }

      try {
        const chunkResult = await this.parseDegreeAuditChunk(chunk.text, i === 0)
        
        // Merge results
        if (chunkResult.degreeInfo && !degreeInfo) {
          degreeInfo = chunkResult.degreeInfo
        }
        
        if (chunkResult.requirements) {
          this.mergeRequirements(allRequirements, chunkResult.requirements)
        }

        // Rate limiting
        if (i < chunks.length - 1) {
          await this.sleep(2000)
        }

      } catch (error) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          console.warn(`Rate limit hit on chunk ${i + 1}, waiting 60 seconds...`)
          if (progressCallback) {
            progressCallback(`Rate limit reached, waiting 60 seconds before continuing...`, progress)
          }
          await this.sleep(60000)
          i--
          continue
        }
        throw error
      }
    }

    // Calculate summary
    const totalRequired = Object.values(allRequirements).reduce((sum, req) => sum + (req.totalRequired || 0), 0)
    const totalCompleted = Object.values(allRequirements).reduce((sum, req) => sum + (req.completed || 0), 0)

    return {
      degreeInfo,
      requirements: allRequirements,
      summary: {
        totalCreditsRequired: totalRequired,
        totalCreditsCompleted: totalCompleted,
        totalCreditsRemaining: totalRequired - totalCompleted,
        estimatedSemesters: Math.ceil((totalRequired - totalCompleted) / 15)
      }
    }
  }

  async parseDegreeAuditChunk(chunkText, includeDegreeInfo = false) {
    const prompt = `
    Analyze this degree audit chunk and extract requirements in JSON format:

    ${includeDegreeInfo ? `
    {
      "degreeInfo": {
        "degreeName": "Bachelor of Business Administration",
        "major": "Finance",
        "minor": "Data Analytics (if applicable)",
        "expectedGraduation": "Spring 2026"
      },
      "requirements": {
    ` : '{ "requirements": {'}
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
        }
      }
    }

    Document chunk:
    ${chunkText}

    Focus on remaining requirements. Use null for missing information.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not extract valid JSON from response')
      }
    } catch (error) {
      console.error('Error parsing degree audit chunk:', error)
      throw new Error(`Failed to parse degree audit chunk: ${error.message}`)
    }
  }

  async generateGraduationTimeline(transcriptData, degreeAuditData, preferences, progressCallback) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured. Please provide API key.')
    }

    if (progressCallback) {
      progressCallback('Generating graduation timeline scenarios...', 75)
    }

    // Use a more concise prompt to reduce token usage
    const prompt = `
    Create 3 graduation scenarios based on this data:

    COMPLETED CREDITS: ${transcriptData?.summary?.totalCredits || 0}
    REMAINING CREDITS: ${degreeAuditData?.summary?.totalCreditsRemaining || 33}
    TARGET GRADUATION: ${preferences?.graduationDate?.semester} ${preferences?.graduationDate?.year}
    MAX CREDITS/SEMESTER: ${preferences?.maxCreditsPerSemester || 15}
    SUMMER SESSIONS: ${preferences?.summerSessions ? 'Yes' : 'No'}
    WINTER SESSIONS: ${preferences?.winterSessions ? 'Yes' : 'No'}

    JSON format:
    {
      "scenarios": [
        {
          "name": "Standard Timeline",
          "graduationDate": "Spring 2026",
          "totalSemesters": 3,
          "summerCourses": 0,
          "avgCreditsPerSemester": 15
        }
      ]
    }
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not extract valid JSON from response')
      }
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('quota')) {
        // If rate limited on timeline generation, provide a fallback
        return this.generateFallbackTimeline(transcriptData, degreeAuditData, preferences)
      }
      throw error
    }
  }

  generateFallbackTimeline(transcriptData, degreeAuditData, preferences) {
    const remainingCredits = degreeAuditData?.summary?.totalCreditsRemaining || 33
    const maxCredits = preferences?.maxCreditsPerSemester || 15
    const standardSemesters = Math.ceil(remainingCredits / maxCredits)

    return {
      scenarios: [
        {
          name: "Standard Timeline",
          graduationDate: `${preferences?.graduationDate?.semester || 'Spring'} ${(preferences?.graduationDate?.year || 2026)}`,
          totalSemesters: standardSemesters,
          summerCourses: 0,
          avgCreditsPerSemester: maxCredits
        },
        {
          name: "Accelerated Timeline", 
          graduationDate: `Fall ${(preferences?.graduationDate?.year || 2026) - 1}`,
          totalSemesters: Math.ceil(remainingCredits / 18),
          summerCourses: preferences?.summerSessions ? 6 : 0,
          avgCreditsPerSemester: 18
        },
        {
          name: "Relaxed Timeline",
          graduationDate: `Fall ${(preferences?.graduationDate?.year || 2026) + 1}`,
          totalSemesters: Math.ceil(remainingCredits / 12),
          summerCourses: 0,
          avgCreditsPerSemester: 12
        }
      ]
    }
  }

  deduplicateCourses(courses) {
    const seen = new Set()
    return courses.filter(course => {
      const key = `${course.courseCode}-${course.semester}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  mergeRequirements(target, source) {
    for (const [key, value] of Object.entries(source)) {
      if (target[key]) {
        target[key].totalRequired += value.totalRequired || 0
        target[key].completed += value.completed || 0
        if (value.remaining) {
          target[key].remaining.push(...value.remaining)
        }
      }
    }
  }

  calculateGPA(courses) {
    const gradePoints = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 }
    let totalPoints = 0
    let totalCredits = 0

    courses.forEach(course => {
      if (course.grade && course.credits) {
        const points = gradePoints[course.grade.charAt(0)]
        if (points !== undefined) {
          totalPoints += points * course.credits
          totalCredits += course.credits
        }
      }
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : null
  }
}

export default new ChunkedGeminiService()