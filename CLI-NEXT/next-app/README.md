# ClimaPredict - Next.js Web App

This is the Next.js web version of the ClimaPredict application, converted from the Flutter mobile app.

## Features

- 🌤️ **Weather Forecasting**: 7-day and hourly weather forecasts
- 📊 **Weather Insights**: Statistics and analytics
- 👥 **Community**: Connect with farmers and share tips
- 🌾 **Crop Health Monitoring**: Track crop health and yield
- 💰 **Market Prices**: Live crop prices and trends
- 🛡️ **Insurance**: Crop insurance information and claims
- 🗺️ **Interactive Weather Map**: Leaflet.js map with OpenWeatherMap overlays
- 📡 **IoT Sensors**: Monitor soil moisture, temperature, and more
- ⚠️ **Weather Alerts**: Real-time weather warnings

## Tech Stack

- **Next.js 16.0.1**: React framework
- **React 19.2.0**: UI library
- **Tailwind CSS v4**: Styling
- **Axios**: HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
```

> Need an API key? Create one for free at [https://openweathermap.org/api](https://openweathermap.org/api). The weather map will render the base map without it, but OpenWeatherMap overlays, location search, and on-map inspections require this key.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js app directory
│   ├── alerts/          # Weather alerts page
│   ├── community/       # Community page
│   ├── forecast/        # 7-day forecast page
│   ├── insights/        # Insights page
│   ├── profile/         # Profile page
│   └── ...              # Other pages
├── components/          # React components
│   └── BottomNavigation.js
├── config/              # Configuration files
│   └── apiConfig.js
└── data/                # Static data
    └── staticData.js
```

## API Configuration

The app is configured to connect to the ClimaPredict backend API. Update the API base URL in:
- `src/config/apiConfig.js`
- `.env.local` file

Default API endpoints:
- Forecast: `/api/v1/forecast`
- Sensors: `/api/v1/sensor`
- Feedback: `/api/v1/feedback`
- Health: `/health`

## Building for Production

```bash
npm run build
npm start
```

## Features Matching Flutter App

All major features from the Flutter app have been converted:

✅ Home screen with weather card
✅ 7-day forecast
✅ Hourly forecast
✅ Weather alerts
✅ Community posts
✅ Insights and statistics
✅ Crop health monitoring
✅ Market prices
✅ Insurance information
✅ IoT sensors
✅ Weather tips
✅ News & updates
✅ Settings
✅ Profile management

## Color Scheme

The app uses the same color scheme as the Flutter app:

- Primary Black: `#0D0D0D`
- Secondary Black: `#1A1A1A`
- Card Black: `#252525`
- Accent Green: `#00D09C`
- Accent Blue: `#4D9FFF`
- Accent Purple: `#9D4EDD`
- Accent Orange: `#FF6B35`
- Accent Yellow: `#FFC857`

## License

Same license as the main ClimaPredict project.
