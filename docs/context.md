# AI Class Planner - Project Context

## Project Overview
A comprehensive degree planning website that allows students to upload their transcripts and degree audits, then uses AI to generate optimized graduation timelines and course schedules. The system helps students visualize their remaining requirements and plan multiple scenarios for degree completion.

**Core Value Proposition**: Transform complex degree planning into an intuitive, AI-powered experience that ensures students graduate on time with optimal course sequencing.

---

## Core Purpose & Goals

* **Primary Goal**: Help students create personalized, realistic graduation timelines based on their academic history and preferences
* **Value Proposition**: Eliminate degree planning confusion through AI-powered document analysis and intelligent course recommendations
* **Target Outcomes**: 
  - Reduced time-to-graduation through optimized course sequencing
  - Decreased student stress around degree planning
  - Better utilization of winter/summer sessions
  - Multiple scenario planning for flexible graduation paths

---

## Target Audience

* **Primary Users**: Undergraduate students planning their remaining coursework
* **Secondary Users**: Academic advisors reviewing student graduation plans
* **Technical Level**: Basic - intuitive interface requiring no technical knowledge
* **User Context**: Students juggling multiple degree requirements, prerequisites, and scheduling constraints

---

## Features & Capabilities

### Core Features
1. **Document Upload & Processing**: Upload transcripts and degree audits (PDF/text)
2. **Student Preference Onboarding**: Target graduation date, winter/summer availability, credit load preferences
3. **Remaining Requirements Analysis**: AI-powered extraction and categorization of incomplete degree requirements
4. **Multiple Scenario Planning**: Save and compare different graduation timeline options

### AI-Powered Features
1. **Transcript Parsing**: Extract completed courses, grades, and credit hours using Gemini Flash API
2. **Degree Audit Processing**: Identify remaining requirements and categorize by type (major, minor, electives)
3. **Timeline Generation**: Create semester-by-semester plans based on student preferences and constraints
4. **Course Recommendations**: Suggest optimal course sequencing based on prerequisites and scheduling

### Advanced Features
1. **Special Scheduling Dialogue**: Mark courses with constraints (spring-only, every-other-year, etc.)
2. **Drag-and-Drop Planning**: Manual semester adjustments with real-time validation
3. **Conflict Detection**: Identify scheduling issues and suggest alternatives
4. **Progress Tracking**: Update plans as semesters are completed

---

## Technical Requirements

* **Frontend Framework**: React with Vite for fast development and optimal performance
* **Styling**: Tailwind CSS for responsive, modern design
* **AI Integration**: Google Gemini Flash API for document processing and recommendations
* **Storage**: Local storage initially, migrate to Supabase for persistence and sharing
* **File Processing**: PDF.js for client-side document parsing
* **Hosting/Deployment**: Netlify for seamless CI/CD and hosting

---

## User Experience Requirements

* **Design Principles**: Clean, student-friendly interface with clear progress indicators
* **Accessibility**: WCAG 2.1 AA compliance for inclusive design
* **Mobile Support**: Fully responsive design for planning on-the-go
* **Performance**: Fast document processing and real-time plan updates
* **User Flow**: Guided onboarding → document upload → AI analysis → scenario planning

---

## Student Preference Collection

### Graduation Timeline
- Target graduation semester/year
- Flexibility for earlier/later completion
- Summer session availability (yes/no)
- Winter session availability (yes/no)

### Academic Preferences
- Maximum credits per semester (12-18+ typical range)
- Course difficulty balancing preferences
- Special scheduling considerations dialogue

### Scenario Types
- **Aggressive**: Maximum course load, all sessions
- **Standard**: Regular semester load, minimal summer
- **Relaxed**: Lower course load, extended timeline

---

## Success Metrics

* **User Engagement**: Document upload completion rate, scenario creation frequency
* **Academic Outcomes**: Accuracy of graduation timeline predictions
* **System Performance**: Document processing speed, plan generation time
* **User Satisfaction**: Plan usefulness rating, feature adoption rates

---

## Phase 1 MVP Scope

1. **Core Upload System**: Transcript and degree audit file processing
2. **Student Onboarding**: Preference collection and goal setting
3. **AI Document Analysis**: Extract academic data using Gemini Flash API
4. **Basic Timeline Generation**: Create graduation scenarios based on preferences
5. **Requirements Visualization**: Clear breakdown of completed vs. remaining coursework

---

*Created: 2025-07-26*  
*Last Updated: 2025-07-26*