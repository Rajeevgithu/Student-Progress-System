require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/student-progress',
  
  // Email configuration
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@studentprogress.com'
  },

  // Cron job schedule (default: daily at 2 AM)
  cron: {
    schedule: process.env.CRON_SCHEDULE || '0 2 * * *'
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },

  // Codeforces API configuration
  codeforces: {
    baseUrl: 'https://codeforces.com/api',
    apiKey: process.env.CF_API_KEY,
    secret: process.env.CF_SECRET
  }
}; 