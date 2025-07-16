# TSA Portal (The Smith Agency Portal)

A Next.js-based web application for boutique staffing services, providing separate portals for clients and staff members with authentication, booking management, and profile management capabilities.

## 🚀 Features

- **Dual Portal System**: Separate interfaces for clients and staff
- **Authentication**: NextAuth.js with Google OAuth and email/password
- **Booking Management**: Complete booking workflow from creation to completion
- **Availability System**: Staff can manage their availability and schedules
- **Profile Management**: Both clients and staff can manage their profiles
- **Payment Integration**: Stripe integration for booking payments
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Role-based Security**: Middleware protection for different user types

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.1 with React 19
- **Authentication**: NextAuth.js with Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS with custom design system
- **Payment**: Stripe integration
- **Analytics**: Vercel Analytics

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Google OAuth app (for staff authentication)
- Stripe account (for payments)

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd tsa-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the example environment file and fill in your values:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Firebase Server Configuration (same values as above)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# NextAuth Configuration
NEXTAUTH_SECRET=generate_a_random_string_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (for staff authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication with Email/Password and Google providers
4. Add your domain to authorized domains in Authentication settings
5. Create the following Firestore collections:
   - `clients` - for client profiles
   - `staff` - for staff profiles  
   - `bookings` - for booking records
   - `availability` - for staff availability

### 5. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create credentials for OAuth 2.0 client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 6. Stripe Setup
1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Configure webhooks if needed for payment processing

## 🚀 Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Build & Deploy

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## 🔒 Security Features

- Environment variables for sensitive configuration
- Route protection with middleware
- Role-based access control
- Firebase security rules
- Error boundaries for graceful error handling
- Centralized logging system

## 📁 Project Structure

```
├── components/          # React components
│   ├── client/         # Client portal components
│   ├── staff/          # Staff portal components
│   ├── ErrorBoundary.js # Global error handling
│   └── Layout.js       # Layout wrapper
├── lib/                # Utility libraries
│   ├── firebase.js     # Firebase configuration
│   └── logger.js       # Centralized logging
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── client/        # Client portal pages
│   ├── staff/         # Staff portal pages
│   ├── _app.js        # App wrapper
│   └── index.js       # Landing page
├── styles/            # CSS styles
└── middleware.js      # Route protection
```

## 🔧 Recent Fixes & Improvements

### Security Fixes ✅
- **Fixed 7 security vulnerabilities** including critical prototype pollution
- **Updated dependencies**: Next.js 15.4.1, Firebase Admin 13.4.0
- **Moved Firebase config to environment variables** (no more exposed API keys)
- **Enhanced error handling** with proper error boundaries

### Code Quality Improvements ✅
- **Fixed all ESLint errors** (10 unescaped character issues)
- **Removed unused components** (`ProfileSection.js`)
- **Centralized logging system** with proper error categorization
- **Improved error boundaries** with user-friendly error pages

### Infrastructure Improvements ✅
- **Environment variable management** with example template
- **Build optimization** - successful production builds
- **Proper gitignore** for environment files
- **Documentation updates** with setup instructions

## 🚨 Important Notes

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Firebase Security**: Configure Firestore security rules for production
3. **Stripe Webhooks**: Set up webhook endpoints for payment processing
4. **Domain Configuration**: Update NextAuth URL for production deployment

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures**: Ensure all environment variables are set
2. **Authentication Issues**: Check Google OAuth configuration and redirect URIs
3. **Database Errors**: Verify Firebase project settings and Firestore rules
4. **Payment Issues**: Confirm Stripe API keys and webhook configuration

### Debugging:

- Check browser console for client-side errors
- Check server logs for API errors
- Use the centralized logger for debugging information
- Error boundary will catch and display React errors in development

## 📄 License

This project is private and proprietary to The Smith Agency.

## 🤝 Contributing

1. Create a feature branch
2. Make changes with proper error handling
3. Test thoroughly (including error cases)
4. Run `npm run lint` to check code quality
5. Run `npm run build` to ensure production build works
6. Submit pull request with detailed description

## 📞 Support

For technical support or questions about the TSA Portal, contact the development team.
