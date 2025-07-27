import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Set up PDF.js worker - use reliable CDN approach
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

class DocumentProcessor {
  async extractTextFromFile(file) {
    const fileType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.extractTextFromPDF(file)
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        return await this.extractTextFromDOCX(file)
      } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
        return await this.extractTextFromDOC(file)
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.extractTextFromTXT(file)
      } else {
        throw new Error(`Unsupported file type: ${fileType}`)
      }
    } catch (error) {
      console.error('Error extracting text from file:', error)
      throw new Error(`Failed to process ${file.name}: ${error.message}`)
    }
  }

  async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      }).promise
      
      let fullText = ''

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + '\n'
      }

      return this.cleanExtractedText(fullText)
    } catch (error) {
      console.error('PDF.js extraction failed:', error)
      // Fallback: try to read as text (some PDFs have embedded text)
      try {
        const text = await file.text()
        if (text && text.length > 50) {
          return this.cleanExtractedText(text)
        }
      } catch (textError) {
        console.error('Text fallback also failed:', textError)
      }
      
      throw new Error(`Unable to extract text from PDF: ${error.message}. Please try converting to TXT format.`)
    }
  }

  async extractTextFromDOCX(file) {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return this.cleanExtractedText(result.value)
  }

  async extractTextFromDOC(file) {
    // For older .doc files, we'll try to read as text
    // This is a simplified approach - for production, consider using a more robust library
    const text = await file.text()
    return this.cleanExtractedText(text)
  }

  async extractTextFromTXT(file) {
    const text = await file.text()
    return this.cleanExtractedText(text)
  }

  cleanExtractedText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim()
  }

  // Helper method to validate document content
  validateDocumentContent(text, documentType) {
    const minLength = 100 // Minimum expected characters
    
    if (!text || text.length < minLength) {
      throw new Error(`Document appears to be empty or too short (${text?.length || 0} characters)`)
    }

    // Basic validation based on document type
    if (documentType === 'transcript') {
      const transcriptKeywords = ['gpa', 'credit', 'grade', 'semester', 'course', 'transcript']
      const hasTranscriptContent = transcriptKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      )
      
      if (!hasTranscriptContent) {
        console.warn('Document may not be a transcript - no typical transcript keywords found')
      }
    } else if (documentType === 'degreeAudit') {
      const auditKeywords = ['degree', 'requirement', 'major', 'minor', 'audit', 'graduation']
      const hasAuditContent = auditKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      )
      
      if (!hasAuditContent) {
        console.warn('Document may not be a degree audit - no typical audit keywords found')
      }
    }

    return text
  }

  // Method to extract metadata from documents
  extractDocumentMetadata(file) {
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: new Date(file.lastModified),
      processedAt: new Date()
    }
  }

  // Method to handle multiple file processing
  async processDocuments(files) {
    const results = []
    
    for (const file of files) {
      try {
        const text = await this.extractTextFromFile(file)
        const metadata = this.extractDocumentMetadata(file)
        
        results.push({
          success: true,
          file: file.name,
          text,
          metadata,
          error: null
        })
      } catch (error) {
        results.push({
          success: false,
          file: file.name,
          text: null,
          metadata: null,
          error: error.message
        })
      }
    }
    
    return results
  }
}

export default new DocumentProcessor()