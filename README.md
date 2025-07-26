# AI Class Planner

> Intelligent academic planning and scheduling powered by AI

A comprehensive degree planning website that allows students to upload their transcripts and degree audits, then uses AI to generate optimized graduation timelines and course schedules.

## 🎯 Project Status
- **Status**: Phase 2 Complete - AI Integration Ready
- **Type**: Educational AI Tool
- **Target Users**: Students, Academic Advisors, Educational Institutions

## ✨ Features

### Current Features (Phase 1 & 2)
- 📄 **Document Upload**: Drag-and-drop support for transcripts and degree audits (PDF, DOC, TXT)
- 🤖 **AI Document Analysis**: Google Gemini Flash API integration for intelligent document processing
- 📊 **Progress Visualization**: Interactive dashboards showing degree completion progress
- 📅 **Student Preferences**: Graduation timeline, winter/summer sessions, credit load preferences
- 🎯 **Multiple Scenarios**: Generate accelerated, standard, and relaxed graduation plans
- 💾 **Data Persistence**: Local storage with planned migration to Supabase

### Upcoming Features (Phase 3+)
- 🖱️ **Drag-and-Drop Planning**: Interactive semester planning grid
- ⚠️ **Conflict Detection**: Real-time schedule validation and alternative suggestions
- 🔄 **Course Recommendations**: AI-powered optimal course sequencing
- 📱 **Mobile Optimization**: Enhanced mobile experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation
```bash
# Clone and navigate to project
cd ai-class-planner

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Gemini API key to .env
VITE_GEMINI_API_KEY=your_api_key_here

# Start development server
npm run dev
```

### Usage
1. **Upload Documents**: Upload your transcript and/or degree audit
2. **Set API Key**: Provide your Google Gemini API key for AI analysis
3. **Set Preferences**: Choose graduation timeline and session preferences
4. **Review Results**: View your personalized graduation scenarios

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini Flash API
- **File Processing**: PDF.js, Mammoth.js
- **Storage**: Local Storage → Supabase (planned)
- **Deployment**: Netlify

## 📁 Project Structure
```
ai-class-planner/
├── docs/                 # Project documentation
├── memory/               # Project memory and session tracking
├── handoff/              # Session handoff documentation
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API and external services
│   └── utils/           # Utility functions
├── public/              # Static assets
└── netlify.toml         # Netlify configuration
```

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### API Integration
The app integrates with Google Gemini Flash API for:
- **Transcript Parsing**: Extract course history, grades, and credits
- **Degree Audit Processing**: Identify remaining requirements
- **Timeline Generation**: Create optimized graduation scenarios

### Data Flow
1. User uploads documents → 2. Extract text (PDF.js/Mammoth) → 3. AI analysis (Gemini) → 4. Generate timelines → 5. Display results

## 🚀 Deployment

### Netlify Deployment
```bash
# Build the project
npm run build

# Deploy to Netlify (automatic with git integration)
# Or manual deploy: drag dist/ folder to Netlify
```

### Environment Variables
Set in Netlify dashboard:
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

## 📋 Memory Management System

This project uses a comprehensive memory management system:
- **memory-bank.yaml**: Project state, decisions, and open actions
- **session-log.md**: Detailed session history and progress tracking
- **handoff.md**: Quick start guide for seamless session transitions

## 🤝 Contributing

This project follows a structured development approach with detailed documentation and memory management for seamless collaboration.

---

*Created: 2025-07-26*  
*Phase 2 Complete: Full AI integration with document processing and timeline generation*