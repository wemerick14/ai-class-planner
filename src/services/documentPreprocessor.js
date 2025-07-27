class DocumentPreprocessor {
  // Keywords that indicate academic content we want to keep
  static COURSE_KEYWORDS = [
    'credit', 'credits', 'hrs', 'hours', 'gpa', 'grade', 'semester', 'fall', 'spring', 'summer',
    'course', 'class', 'department', 'major', 'minor', 'requirement', 'completed', 'earned',
    'transcript', 'audit', 'degree', 'bachelor', 'master', 'graduation', 'cumulative'
  ]

  // Common header/footer patterns to remove
  static REMOVE_PATTERNS = [
    /page \d+ of \d+/gi,
    /\d{1,2}\/\d{1,2}\/\d{2,4}/g, // dates in headers
    /printed on:.*$/gm,
    /student copy/gi,
    /unofficial transcript/gi,
    /degree audit/gi,
    /^.*university.*$/gm, // university headers
    /^.*college.*$/gm, // college headers
    /student id:.*$/gm,
    /ssn:.*$/gm,
    /^\s*\d+\s*$/gm, // standalone page numbers
  ]

  static preprocessDocument(text, documentType = 'transcript') {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid document text provided')
    }

    let processed = text

    // Step 1: Basic cleanup
    processed = this.basicCleanup(processed)

    // Step 2: Remove headers/footers and noise
    processed = this.removeNoise(processed)

    // Step 3: Extract relevant sections
    processed = this.extractRelevantContent(processed, documentType)

    // Step 4: Final compression
    processed = this.finalCompression(processed)

    return processed
  }

  static basicCleanup(text) {
    return text
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive whitespace
      .replace(/[ \t]+/g, ' ')
      // Remove empty lines (more than 2 consecutive newlines)
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim()
  }

  static removeNoise(text) {
    let processed = text

    // Apply removal patterns
    this.REMOVE_PATTERNS.forEach(pattern => {
      processed = processed.replace(pattern, '')
    })

    // Remove lines that are just punctuation or numbers
    processed = processed
      .split('\n')
      .filter(line => {
        const trimmed = line.trim()
        // Keep lines that have actual content
        return trimmed.length > 3 && 
               !/^[^\w]*$/.test(trimmed) && // not just punctuation
               !/^\d+$/.test(trimmed) // not just numbers
      })
      .join('\n')

    return processed
  }

  static extractRelevantContent(text, documentType) {
    const lines = text.split('\n')
    const relevantLines = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      
      // Keep lines that contain course-related keywords
      const hasRelevantKeyword = this.COURSE_KEYWORDS.some(keyword => 
        line.includes(keyword)
      )
      
      // Keep lines that look like course codes (e.g., "MATH 1301", "BIO 2401")
      const looksLikeCourse = /\b[A-Z]{2,4}\s*\d{3,4}\b/.test(lines[i])
      
      // Keep lines with grades (A, B, C, D, F followed by numbers)
      const hasGrade = /\b[ABCDF][+-]?\b|\b\d+\.\d+\b/.test(lines[i])
      
      // Keep lines with credit hours patterns
      const hasCredits = /\b\d+\s*(cr|credit|hour|hr)s?\b/i.test(lines[i])
      
      if (hasRelevantKeyword || looksLikeCourse || hasGrade || hasCredits) {
        // Include some context (previous and next line if they're short)
        if (i > 0 && lines[i-1].trim().length < 100 && !relevantLines.includes(lines[i-1])) {
          relevantLines.push(lines[i-1])
        }
        
        relevantLines.push(lines[i])
        
        if (i < lines.length - 1 && lines[i+1].trim().length < 100) {
          relevantLines.push(lines[i+1])
        }
      }
    }

    // If we filtered too aggressively and have very little content, return more
    const filteredText = relevantLines.join('\n')
    if (filteredText.length < text.length * 0.1) {
      // Keep more content if we filtered too much
      return text.substring(0, Math.min(text.length, 15000))
    }

    return filteredText
  }

  static finalCompression(text) {
    return text
      // Remove duplicate lines
      .split('\n')
      .filter((line, index, arr) => {
        const trimmed = line.trim()
        if (trimmed.length < 3) return false
        
        // Keep line if it's not a duplicate of recent lines
        for (let i = Math.max(0, index - 5); i < index; i++) {
          if (arr[i].trim() === trimmed) return false
        }
        return true
      })
      .join('\n')
      // Final whitespace cleanup
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  static chunkDocument(text, maxChunkSize = 8000, overlapSize = 500) {
    if (!text || text.length <= maxChunkSize) {
      return [{ text, index: 0, total: 1 }]
    }

    const chunks = []
    let startIndex = 0
    let chunkIndex = 0

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + maxChunkSize, text.length)
      
      // Try to break at a sentence or paragraph boundary
      if (endIndex < text.length) {
        // Look for sentence endings in the last 200 characters
        const searchStart = Math.max(endIndex - 200, startIndex)
        const searchText = text.substring(searchStart, endIndex)
        const sentenceEnd = Math.max(
          searchText.lastIndexOf('.'),
          searchText.lastIndexOf('!'),
          searchText.lastIndexOf('?'),
          searchText.lastIndexOf('\n')
        )
        
        if (sentenceEnd > 0) {
          endIndex = searchStart + sentenceEnd + 1
        }
      }

      const chunkText = text.substring(startIndex, endIndex).trim()
      
      if (chunkText.length > 0) {
        chunks.push({
          text: chunkText,
          index: chunkIndex,
          total: 0 // Will be updated after all chunks are created
        })
        chunkIndex++
      }

      // Move start index, accounting for overlap
      startIndex = Math.max(endIndex - overlapSize, startIndex + 1)
    }

    // Update total count for all chunks
    chunks.forEach(chunk => {
      chunk.total = chunks.length
    })

    return chunks
  }

  static analyzeDocument(text) {
    const originalLength = text.length
    const preprocessed = this.preprocessDocument(text)
    const chunks = this.chunkDocument(preprocessed)
    
    return {
      originalLength,
      preprocessedLength: preprocessed.length,
      compressionRatio: (1 - preprocessed.length / originalLength) * 100,
      chunkCount: chunks.length,
      estimatedTokens: Math.ceil(preprocessed.length / 4), // Rough estimate: 4 chars per token
      chunks
    }
  }
}

export default DocumentPreprocessor