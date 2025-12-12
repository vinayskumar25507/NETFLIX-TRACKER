# Netflix Focus Tracker 📺

A vanilla JavaScript web application that allows users to discover popular Netflix series, search for specific TV shows, and track their watching progress. The app uses **Local Storage** to save your library and progress, meaning your data persists without needing a backend server.

## 🌟 Features

* **Discover Series:** Automatically fetches and displays popular TV shows available on Netflix upon loading.
* **Search Functionality:** Search for any TV series using The Movie Database (TMDB) API.
* **Library Management:** Organize shows into three categories:
    * **Watching:** Shows you are currently following.
    * **Completed:** Shows you have finished.
    * **Plan to Watch:** Shows added to your backlog.
* **Progress Tracking:**
    * Visual progress bars for every show in your library.
    * Episode counters (e.g., 5 / 10 EP).
    * "Watch Again" feature for completed series to reset progress.
* **Persistent Data:** All data is saved to the browser's `localStorage`, so you don't lose your list when you refresh or close the browser.
* **Responsive Design:** Fully responsive grid layout that works on desktop and mobile.

## 🛠️ Tech Stack

* **HTML5** - Structure and semantics.
* **CSS3** - Custom styling, Flexbox, CSS Grid, and responsive media queries.
* **JavaScript (ES6+)** - Async/Await for API calls, DOM manipulation, and LocalStorage logic.
* **API** - [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api) for fetching TV show metadata and images.

## 📂 Project Structure

```text
├── index.html      # Main HTML structure
├── style.css       # Styling for dark mode, cards, and modal
├── script.js       # Application logic, API handling, and state management
└── README.md       # Project documentation
