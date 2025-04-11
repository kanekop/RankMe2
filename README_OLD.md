# 🏊‍♀️ 水泳マスターズ級チェッカー (Swimming Masters Level Checker)

A Streamlit-based web application that helps swimmers check their competition level based on their performance times.

## 🎯 Features

- Age and gender-based classification
- Multiple swimming styles support
- Various distance options
- Real-time level calculation
- Progress tracking towards next level
- Responsive design

## 🛠 Technical Stack

- Python 3.10
- Streamlit 1.27.2
- Pandas 2.2.3
- JSON for data storage

## 📁 Project Structure

```
├── main.py              # Main application file
├── all_records.json     # Swimming records database
├── pyproject.toml       # Poetry dependencies
└── .streamlit/         
    └── config.toml      # Streamlit configuration
```

## 🔧 Core Components

1. **Data Management**
   - Records stored in `all_records.json`
   - Pandas DataFrame for efficient data processing
   - Caching implemented for performance optimization

2. **User Interface**
   - Clean, responsive design
   - Custom CSS styling
   - Intuitive input controls
   - Real-time feedback

3. **Time Processing**
   - Conversion of time formats
   - Precise calculations
   - Multiple time unit handling (minutes, seconds, milliseconds)

## 💻 Development Setup

1. Ensure you have Python 3.10 installed
2. Install dependencies:
   ```bash
   pip install streamlit pandas
   ```
3. Run the application:
   ```bash
   streamlit run main.py
   ```

## 🔄 Core Functions

- `load_data()`: Loads and processes swimming records
- `get_age_category()`: Determines age category for classification
- `parse_time_to_seconds()`: Converts time strings to seconds
- `find_level()`: Calculates swimming level
- `time_to_next_level()`: Computes time needed for next level

## 🚀 Future Enhancement Possibilities

1. **Data Management**
   - Implement database backend
   - Add real-time data updates
   - Include historical tracking

2. **User Experience**
   - Add user accounts
   - Implement progress tracking
   - Include visualization features

3. **Performance**
   - Optimize data processing
   - Implement better caching strategies

4. **Features**
   - Add multi-language support
   - Include training recommendations
   - Add competition scheduling

## 📝 Notes for Developers

- The application uses Streamlit's caching mechanism for performance
- Time calculations are precise to two decimal places
- Age categories are dynamically generated from the data
- The UI is fully responsive and mobile-friendly

## 🤝 Contributing

To contribute to this project:

1. Review the existing code structure
2. Maintain consistent code formatting
3. Add comments for complex logic
4. Test thoroughly before submitting changes
5. Document any new features or changes

## 📄 License

This project is open for use within Replit's environment.