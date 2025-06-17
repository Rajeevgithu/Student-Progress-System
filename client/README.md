# Student Progress System - Frontend

A React-based frontend for the Student Progress System, featuring a modern UI with Material-UI components and responsive design.

## Features

- Student management with CRUD operations
- Detailed student profiles with contest history and problem-solving statistics
- Interactive charts for visualizing progress
- Settings management for system configuration
- Dark/Light mode support
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Components

### StudentTable
- Displays a list of all students in a table format
- Features:
  - Add new students
  - Edit existing student information
  - Delete students
  - Download student data as CSV
  - View detailed student profiles

### StudentProfile
- Shows detailed information about a specific student
- Features:
  - Contest history with rating changes
  - Problem-solving statistics
  - Interactive charts for data visualization
  - Time-based filtering (30/90/365 days)

### Settings
- System configuration management
- Features:
  - Cron job timing configuration
  - Email notification preferences
  - System-wide settings

## API Integration

The frontend communicates with the backend through the following endpoints:

- `/api/students` - Student management
- `/api/students/:id` - Individual student operations
- `/api/students/:id/contests` - Contest history
- `/api/students/:id/problems` - Problem-solving data
- `/api/settings` - System settings

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

### Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── StudentTable.jsx
│   │   ├── StudentProfile.jsx
│   │   └── Settings.jsx
│   ├── App.jsx
│   └── index.js
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.