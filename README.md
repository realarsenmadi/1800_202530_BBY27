# SureSpot

## Overview
SureSpot is a client-side JavaScript web application that helps users find and visualize parking availability. The app integrates MapLibre GL JS and MapTiler APIs to display an interactive map centered on BCIT Burnaby Campus. Users can search for places, view their current location, and explore nearby parking areas with a responsive, mobile-friendly interface.

Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile methodology, and demonstrates integration with Firebase backend services for authentication, hosting, and storing user data.

---

## Features
- **Interactive Map**: MapLibre map centered on BCIT Burnaby Campus with custom markers
- **Location Search**: Powered by MapTiler's Geocoding API with real-time search results
- **My Location**: GPS-based positioning to find and zoom to user's current location
- **User Profiles**: Personalized user profiles with customizable settings
- **Favourites**: Save and manage favorite parking locations
- **FAQ Section**: Help documentation for common questions
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Last Updated Indicator**: Real-time timestamp showing when parking data was last refreshed

---

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Mapping**: [MapLibre GL JS](https://maplibre.org/) v3.6.2
- **Geocoding API**: [MapTiler](https://www.maptiler.com/)
- **Backend & Hosting**: [Firebase](https://firebase.google.com/)
  - Firebase Authentication
  - Cloud Firestore (Database)
  - Firebase Hosting
- **Version Control**: Git & GitHub
- **Fonts**: Custom "Super Joyful" font

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/realarsenmadi/SureSpot.git
   cd SureSpot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the project root
   - Add your API keys (never commit this file!):
   ```env
   VITE_MAPTILER_KEY=your_maptiler_key_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Visit `http://localhost:5173` (or the port shown in terminal)

---

## Usage
1. **Main Map View**: The map automatically centers on BCIT Burnaby Campus with a red marker
2. **Search for Locations**: Click the search icon, type an address or place name, and select from results
3. **Find Your Location**: Click "My Location" button to center the map on your GPS position
4. **Navigate**: Use the home icon to return to BCIT campus view
5. **Favorites**: Save frequently visited parking spots (accessible via bottom navigation)
6. **Profile Settings**: Customize your experience and toggle dark mode
7. **Help**: Access the FAQ page for assistance

---

## Project Structure
```
SureSpot/
├── fonts/                      # Custom font files
│   └── SuperJoyful.ttf
├── images/                     # UI icons and images
│   ├── home_icon.png
│   ├── Filters.png
│   ├── Location.png
│   ├── Search.png
│   ├── Profile.png
│   ├── Favourites.png
│   └── Help.png
├── src/                        # JavaScript source files
│   ├── main.js                 # Main map and interaction logic
│   └── firebaseAPIConfig.js    # Firebase initialization
├── styles/                     # CSS stylesheets
│   └── style.css               # Main styles
├── index.html                  # Landing page
├── main.html                   # Main map interface
├── profile.html                # User profile page
├── favourites.html             # Saved locations page
├── faq.html                    # Help/FAQ page
├── login.html                  # Authentication page
├── map.html                    # Alternative map view
├── .env                        # Environment variables (NOT in Git)
├── .gitignore                  # Git ignore rules
├── package.json                # Node dependencies
└── README.md                   # This file
```

---

## Environment Variables
This project uses Vite's environment variable system. All variables must be prefixed with `VITE_` to be exposed to the client.

**Required variables:**
- `VITE_MAPTILER_KEY` - MapTiler API key for map tiles and geocoding
- `VITE_FIREBASE_API_KEY` - Firebase project API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase authentication domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

**Security Note:** Never commit the `.env` file to version control. It's already included in `.gitignore`.

---

## Contributors
- **Salahuddin Yunus** - BCIT CST Student with a passion for fitness and cybersecurity. Fun fact: Has 3 kitty cats. :3
- **Kenny Fok** - BCIT CST Student with a passion for creating things. Fun fact: Has been to 10+ countries.
- **Arsen Madi** - BCIT CST Student with a passion for learning new things. Fun Fact: I speak 4 languages
- **Avery Robillo** - Former High School student, now attending BCIT under the CST program. Fun fact: Former Tetris Competitive Player (2022 - 2024).

---

## Acknowledgments
- Map and geocoding features powered by [MapLibre GL JS](https://maplibre.org/) and [MapTiler API](https://www.maptiler.com/)
- Code snippets adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/)
- Icons and images sourced from [FontAwesome](https://fontawesome.com/) and [Unsplash](https://unsplash.com/)
- COMP 1800 course materials and starter code from BCIT

---

## Limitations and Future Work

### Current Limitations
- Parking data currently static (no live availability updates)
- Filter functionality not yet implemented
- Limited accessibility features (keyboard navigation, screen reader support)
- No offline mode support
- Search limited to MapTiler's geocoding coverage

### Planned Features
- **Real-time Data**: Integrate live parking availability using sensors or crowdsourcing
- **Advanced Filters**: Filter by parking type, price, availability, accessibility features
- **User Authentication**: Full login system with email verification
- **Notifications**: Alerts for parking spot availability
- **Crowdsourcing**: Allow users to report parking availability in real-time
- **Route Planning**: Navigate from current location to selected parking spot
- **Payment Integration**: Reserve and pay for parking spots
- **Accessibility**: Enhanced keyboard navigation and ARIA labels
- **PWA Support**: Install as a mobile app with offline capabilities
- **Multi-language Support**: Interface in multiple languages

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
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
This project is licensed under the BCIT License for educational purposes. See the LICENSE file for details.

---

## Contact & Support
For questions, issues, or contributions, please open an issue on the [GitHub repository](https://github.com/realarsenmadi/SureSpot) or contact the development team through BCIT channels.

**Last Updated:** November 20
