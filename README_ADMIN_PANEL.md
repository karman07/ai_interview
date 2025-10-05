# Analytics Admin Panel

A professional React-based admin panel for analytics management with real API integration.

## Features

### 🚀 **Complete Admin Dashboard**
- **Overview Page**: Dashboard with key metrics and system status
- **Analytics Page**: Detailed analytics with time series data and charts
- **Real-time Page**: Live analytics with auto-refresh functionality
- **Visitors Page**: Detailed visitor information with pagination
- **Settings Page**: System configuration and API endpoint management

### 🔐 **Authentication System**
- JWT-based authentication with real API integration
- Secure login/logout functionality
- Session persistence with localStorage
- Protected routes with proper redirection

### 📊 **API Integration**
- Full integration with analytics API endpoints
- Real-time data fetching with error handling
- Loading states and error boundaries
- Automatic token management and refresh

### 🎨 **Professional UI**
- Clean, modern design with black text for light mode
- Responsive layout that works on all devices
- Smooth animations and transitions
- Professional color scheme with blue accents

## Integrated API Endpoints

The admin panel integrates with the following API endpoints:

### Analytics Endpoints
- `GET /analytics/stats` - Get analytics statistics for date range
- `GET /analytics/pages/top` - Get top pages by views
- `GET /analytics/realtime` - Get real-time analytics statistics
- `GET /analytics/timeseries` - Get time series data (daily/hourly)
- `GET /analytics/dashboard` - Get complete dashboard data
- `GET /analytics/visitors/me` - Get visitors for authenticated user (paginated)
- `GET /analytics/visitors/me/stats` - Get visitor statistics for authenticated user

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/google` - Google OAuth login
- `GET /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### Health Check Endpoints
- `GET /analytics/health` - Health check (no auth required)
- `GET /analytics/db-check` - Database connection check (no auth required)

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM 7.9.2
- **Styling**: Tailwind CSS 3.4.3
- **HTTP Client**: Axios
- **Build Tool**: Vite 5.2.11
- **Authentication**: JWT tokens with automatic management

## Project Structure

```
src/
├── components/
│   ├── pages/
│   │   ├── Overview.tsx      # Dashboard overview page
│   │   ├── Analytics.tsx     # Detailed analytics page
│   │   ├── RealTime.tsx      # Real-time analytics page
│   │   ├── Visitors.tsx      # Visitors management page
│   │   └── Settings.tsx      # Settings and configuration
│   ├── DashboardNew.tsx      # Main dashboard layout
│   ├── Login.tsx             # Login page component
│   └── ProtectedRoute.tsx    # Route protection component
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── services/
│   └── api.ts                # API service layer
└── constants/
    └── colors.ts             # Color constants
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open http://localhost:5173/
   - Login page will be displayed first
   - Use your API credentials to authenticate

## API Configuration

The admin panel is configured to connect to:
- **Base URL**: `http://localhost:3000`
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Automatic retry and user feedback

## Authentication Flow

1. **Login**: User enters credentials, receives JWT token
2. **Token Storage**: Token stored in localStorage
3. **API Requests**: Token automatically included in all API calls
4. **Token Refresh**: Automatic token refresh on expiration
5. **Logout**: Token removed and user redirected to login

## Features by Page

### Overview Page
- Key performance metrics cards
- System status indicators
- Top pages summary
- Performance metrics display

### Analytics Page
- Time series charts (daily/hourly intervals)
- Date range selection (7, 30, 90 days)
- Detailed performance metrics
- Visual data representation

### Real-time Page
- Live visitor count with auto-refresh
- Active pages monitoring
- Recent activity feed
- System status indicators with live updates

### Visitors Page
- Paginated visitor list
- Visitor statistics (total, unique, returning, new)
- Geographic and session information
- Search and filtering capabilities

### Settings Page
- User profile information
- System health monitoring
- API configuration display
- Available endpoints documentation

## Error Handling

- **Network Errors**: Proper error messages and retry options
- **Authentication Errors**: Automatic redirect to login
- **API Errors**: User-friendly error displays
- **Loading States**: Spinner animations during data fetching

## Security Features

- JWT token authentication
- Automatic token expiration handling
- Protected routes with authentication checks
- Secure token storage
- CORS support for API communication

## Development Notes

- TypeScript for type safety
- Modular component architecture
- Reusable API service layer
- Consistent error handling patterns
- Professional UI/UX design patterns

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your web server

3. Configure environment variables for production API endpoints

## Support

This admin panel provides a complete solution for analytics management with professional UI/UX and robust API integration. All endpoints from your analytics API are fully integrated and functional.