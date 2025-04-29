
# 🏊‍♀️ マスターズ級チェッカー (Masters Level Checker)

A React-based web application that helps swimmers check their competition level based on their performance times.

## 📁 Project Structure

```
├── public/
│   ├── all_records.json     # Swimming records database
│   └── favicon.svg         # Application favicon
├── src/
│   ├── App.tsx            # Main application component
│   ├── App.css            # Styles for the application
│   └── index.tsx          # Application entry point
├── index.html             # HTML template
└── package.json           # Project dependencies and scripts
```

## 🔧 Core Components

### Application Components

- **App.tsx**: Main React component containing:
  - Form handling for user input
  - Time calculation logic
  - Level determination algorithm
  - Debug logging system
  - Responsive UI components

- **App.css**: Styling including:
  - Responsive design for mobile devices
  - Custom number input controls
  - Time input field styling
  - Results display formatting

### Data Management

- **all_records.json**: Contains swimming records with:
  - Age categories
  - Gender classifications
  - Swimming styles
  - Distance records
  - Time standards for each level

## ✨ Features

1. **User Input**
   - Age selection (18+)
   - Gender selection
   - Swimming style selection
   - Distance selection
   - Time input (minutes, seconds, milliseconds)

2. **Time Controls**
   - Increment/decrement buttons
   - Continuous increment/decrement with long press
   - Input validation
   - Mobile-friendly number inputs

3. **Results Display**
   - Current achievement level
   - Next level target time
   - Time difference to next level
   - Detailed debug logs

4. **Responsive Design**
   - Mobile-optimized layout
   - Touch-friendly controls
   - Adaptive time input fields

## 🚀 Development

The application uses:
- React with TypeScript
- Vite for fast development
- CSS for styling
- JSON for data storage

To run the development server:
1. Click the "Run" button in Replit
2. The application will start in development mode
3. Changes will hot-reload automatically
