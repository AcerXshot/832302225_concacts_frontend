# Contacts App (Frontend)

This is the frontend interface for the full-stack contacts application, built for the first software engineering assignment.

This repository contains the **frontend** part of the project, built with vanilla JavaScript, HTML5, and Pico.css.

### Project Links

* **Live App URL (Vercel):** <https://832302225-concacts-frontend.vercel.app/>
* **Live API URL (Render):** <https://eight32302225-backend.onrender.com/>
* **Backend Repository (GitHub):** <https://github.com/XcerShot/832302225_concacts_backend>

### Features

* **Modern UI:** Built with **Pico.css** for a clean, responsive, and classless design.
* **Dark Mode:** The UI is set to a sleek dark theme, similar to modern mobile apps.
* **"List-Detail" Interface:** An app-like interaction model where clicking a name opens a detailed modal with an avatar and more information.
* **Advanced Sorting:** Automatically sorts contacts by pinyin (using `pinyin-pro`), with correct alphabetical grouping for Chinese characters.
* **Real-time Search:** Instantly filters the contact list by `name`, `phone`, or `email` as the user types.
* **Pagination:** The contact list is paginated, with clean and functional "Previous" / "Next" controls.
* **Icon-based UI:** Uses SVG icons for a clean, app-like feel in all modals and buttons.

### Tech Stack

* **HTML5:** For structured and semantic content.
* **CSS3 (Pico.css):** For modern styling and layout.
* **JavaScript (ES6+):** For all application logic, API communication (`fetch`), and dynamic DOM manipulation.
* **`pinyin-pro`:** A library used to handle complex Chinese character sorting and grouping.

### How to Run Locally

1.  Clone this repository.
2.  Ensure the backend server is running (either locally at `http://127.0.0.1:5000` or the live version).
3.  If running with a local backend, update the `API_BASE_URL` constant in `script.js`.
4.  Open the `contacts.html` file in any modern web browser.
