# SureSpot


## Overview
SureSpot is a client-side JavaScript web application that helps users find and visualize parking availability.
The app integrates MapLibre GL JS and MapTiler APIs to display an interactive map centered on BCIT Burnaby Campus.
Users can search for places, view their current location, and explore nearby parking areas with a responsive, mobile-friendly interface.

Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile methodology, and demonstrates integration with Firebase backend services for hosting and storing user data.

---


## Features

- Interactive MapLibre map centered on BCIT Burnaby Campus
- Search functionality powered by MapTiler’s Geocoding API
- My Location button to find and zoom to the user’s position
- Filter icon placeholder for future filtering features
- Responsive layout for both desktop and mobile devices

---


## Technologies Used

Example:
- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting
- **Database**: Firestore

---


## Usage

1. Open your browser and visit http://localhost:8000 or your Firebase-hosted URL.
2. The map will autofocus on BCIT Burnaby Campus.
3. Click the Search icon to find any location or address.
4. Use the My Location button to center the map on your current position.
5. Use the Filter icon (feature in progress) to view specific parking data in the future.

---


## Project Structure

```
SureSpot/
├── src/
│   ├── main.js
├── styles/
│   └── style.css
├── public/
├── images/
├── index.html
├── package.json
├── README.md
```

---


## Contributors
- **Salahuddin Yunus** - BCIT CST Student with a passion for fitness and cybersecurity. Fun fact: Has 3 kitty cats. :3
- **Kenny Fok** - BCIT CST Student with a passion for creating things. Fun fact: Has been to 10+ countries.
- **Arsen Madi** - BCIT CST Student with a passion for learning new things. Fun Fact: I speak 4 languages
- **Avery Robillo** - Former High School student, now attending BCIT under the CST program. Fun fact:
Former Tetris Competitive Player (2022 - 2024).

---


## Acknowledgments

- Map and geocoding features powered by MapLibre GL JS and MapTiler API.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [FontAwesome](https://fontawesome.com/) and images from [Unsplash](https://unsplash.com/).

---


## Limitations and Future Work
### Limitations

- Parking data currently static (no live availability updates).
- Accessibility and dark mode features can be further improved.

### Future Work

- Crowdsourcing
- Integrate real-time parking availability data.
- Add filter and sorting options for parking lots.
- Implement user authentication and personalized settings.
- Add dark mode and more accessibility improvements.

---


## License

This project is licensed under the BCIT License. See the LICENSE file for details.
