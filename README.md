# SureSpot

> A smart parking finder app for BCIT Burnaby Campus and beyond

---

## Overview

SureSpot is a client-side JavaScript web application that helps users find and visualize parking availability around BCIT Burnaby Campus. Built with modern web technologies, it features an interactive map interface, location search, and personalized user profiles—all wrapped in a responsive, mobile-friendly design.

**Developed for:** COMP 1800 (BCIT)  
**Methodology:** Agile development with User-Centred Design practices

---

## Features

- **Interactive Map** - MapLibre-powered map centered on BCIT with custom markers
- **Smart Search** - Real-time location search powered by MapTiler Geocoding API
- **GPS Location** - Find and navigate to your current position
- **User Profiles** - Personalized settings and preferences
- **Favorites** - Save and manage your go-to parking spots
- **FAQ Section** - Built-in help documentation
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Dark Mode** - Toggle between light and dark themes
- **Live Updates** - Real-time timestamp for parking data freshness

---

## Technologies

| Category | Tools |
|----------|-------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Mapping** | [MapLibre GL JS](https://maplibre.org/) v3.6.2 |
| **Geocoding** | [MapTiler API](https://www.maptiler.com/) |
| **Backend** | [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting) |
| **Version Control** | Git & GitHub |

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/realarsenmadi/1800_202530_BBY27.git
   cd 1800_202530_BBY27
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the project root:
   ```env
   VITE_MAPTILER_KEY=your_maptiler_key_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   
   ⚠️ **Never commit the `.env` file!** It's already in `.gitignore`.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit `http://localhost:5173` (or the port shown in your terminal)

---

## Usage Guide

1. **Main Map View** - Opens centered on BCIT Burnaby Campus with a red marker
2. **Search** - Click the search icon, enter an address or place name, select from results
3. **My Location** - Click to center the map on your current GPS position
4. **Home** - Use the home icon to return to BCIT campus view
5. **Favorites** - Save frequently visited parking spots (bottom navigation)
6. **Profile** - Customize settings and toggle dark mode
7. **Help** - Access the FAQ page for assistance

---

## Project Structure

```
SureSpot/
├── fonts/                      # Custom typography
│   └── SuperJoyful.ttf
│   └── Inter.ttf
│   └── Inter-Italic.ttf
├── images/                     # UI assets
│   ├── home_icon.png
│   ├── Filters.png
│   ├── Location.png
│   ├── Search.png
│   ├── Profile.png
│   ├── Favourites.png
│   ├── Help.png
│   ├── Session.png
│   └── placeholder.jpg
├── src/                        # JavaScript modules
│   ├── main.js                 # Core map logic
│   ├── authentication.js       # Firebase authentication
│   ├── firebaseConfig.js       # Firebase initialization
│   ├── loginSignup.js          # Login/signup functionality
│   ├── index.js                # Index page logic
│   └── profile.js              # Profile page logic
├── styles/                     # Stylesheets
│   └── style.css
├── index.html                  # Landing page
├── main.html                   # Map interface
├── profile.html                # User profile
├── favourites.html             # Saved locations
├── faq.html                    # Help center
├── login.html                  # Authentication
├── map.html                    # Alternative map view
├── .env                        # Environment config (gitignored)
├── .gitignore
├── package.json
└── README.md
```

---

## Environment Variables

All environment variables must be prefixed with `VITE_` for Vite to expose them to the client.

**Required:**
- `VITE_MAPTILER_KEY` - MapTiler API key
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

---

## Team

| Name | Role | Fun Fact |
|------|------|----------|
| **Salahuddin Yunus** | Developer | Has 3 kitty cats! |
| **Kenny Fok** | Developer | Has visited 10+ countries |
| **Arsen Madi** | Developer | Speaks 4 languages |
| **Avery Robillo** | Developer | Former Tetris competitive player (2022-2024) |

---

## Acknowledgments

- Maps powered by [MapLibre GL JS](https://maplibre.org/) and [MapTiler API](https://www.maptiler.com/)
- Icons from [FontAwesome](https://fontawesome.com/) and [Google Fonts](https://fonts.google.com/)
- Images from [Unsplash](https://unsplash.com/)
- Code snippets adapted from [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/)
- BCIT COMP 1800 course materials

---

## Roadmap

### Current Limitations
- Limited accessibility features
- No offline mode
- Search coverage dependent on MapTiler
- Parking lots limited to BCIT

### Planned Features
- **Real-time Data** - Live parking availability via sensors/crowdsourcing with more parking lots
- **Advanced Filters** - Sort by type, price, availability, accessibility
- **Full Authentication** - Email verification and user accounts
- **Notifications** - Parking spot availability alerts
- **Crowdsourcing** - User-reported parking status
- **Route Planning** - Navigate to parking spots
- **Payment Integration** - Reserve and pay for spots
- **Enhanced Accessibility** - Keyboard navigation and ARIA support
- **PWA Support** - Installable mobile app with offline mode
- **Multi-language** - Internationalization support

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## License

Licensed under the BCIT License for educational purposes. See LICENSE file for details.

---

## Contact & Support

- **Issues:** [GitHub Issues](https://github.com/realarsenmadi/1800_202530_BBY27/issues)
- **Questions:** Contact the team through BCIT channels
- **Contribute:** Pull requests welcome!

---

**Last Updated:** December 2025
