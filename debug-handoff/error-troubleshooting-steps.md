# Dashboard Debug Troubleshooting Guide

## Immediate Debug Commands

### 1. Check Browser Console Errors
```javascript
// Open browser DevTools (F12) and check Console tab for errors
// Look for JavaScript errors, React warnings, or network failures
```

### 2. Inspect localStorage Data
```javascript
// In browser console, run these commands:
console.log('Analysis Results:', JSON.parse(localStorage.getItem('analysisResults') || '{}'))
console.log('Transcript Data:', JSON.parse(localStorage.getItem('transcriptData') || '{}'))
console.log('Degree Audit Data:', JSON.parse(localStorage.getItem('degreeAuditData') || '{}'))
console.log('Timeline Data:', JSON.parse(localStorage.getItem('timelineData') || '{}'))
console.log('Uploaded Files:', JSON.parse(localStorage.getItem('uploadedFiles') || '{}'))
console.log('Student Preferences:', JSON.parse(localStorage.getItem('studentPreferences') || '{}'))
```

### 3. Test Dashboard with Mock Data
Add this to Dashboard.jsx line 27 to force mock data display:
```javascript
// Force mock data for testing
const data = mockData
```

### 4. Add Debug Logging
Add these console.log statements in Dashboard.jsx:
```javascript
// After line 8:
console.log('Dashboard - analysisResults:', analysisResults)
console.log('Dashboard - uploadedFiles:', uploadedFiles)
console.log('Dashboard - preferences:', preferences)

// After line 41:
console.log('Dashboard - final data object:', data)
```

## Common Issues and Solutions

### Issue 1: CSS Not Loading (Blank White Screen)
- Check if Tailwind CSS classes are working
- Look for missing CSS files in Network tab
- Try adding inline styles for testing

### Issue 2: JavaScript Errors Breaking Render
- Check console for React errors
- Look for undefined property access
- Verify all imports are working

### Issue 3: Data Structure Mismatches
- AI response format doesn't match expected structure
- Missing required properties causing crashes
- JSON parsing failures

### Issue 4: React Router Issues
- Dashboard component not mounting
- Navigation not working properly
- Path conflicts

## Quick Fix Code Snippets

### Add Error Boundary to Dashboard
```javascript
// Wrap Dashboard content in try-catch for debugging
try {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* existing content */}
    </div>
  )
} catch (error) {
  console.error('Dashboard render error:', error)
  return <div>Dashboard Error: {error.message}</div>
}
```

### Add Loading State Debug
```javascript
// Add after line 25 in Dashboard.jsx
if (!analysisResults) {
  return <div>No analysis results found</div>
}

if (Object.keys(analysisResults).length === 0) {
  return <div>Analysis results empty</div>
}
```

### Force Visible Content Test
```javascript
// Replace entire Dashboard return with this simple test:
return (
  <div style={{padding: '20px', backgroundColor: 'red', color: 'white'}}>
    <h1>Dashboard Test - Can You See This?</h1>
    <p>Analysis Results: {JSON.stringify(analysisResults)}</p>
  </div>
)
```