# HireBridge - Job Portal

A full-stack job listing and application portal built with **Spring 2.5.7**, **MongoDB**, and a hand-crafted **Vanilla JS** frontend. Visitors can browse live job postings, search by skill or keyword, filter by experience, and submit applications. Posting new jobs is protected behind an admin login so only authorised users can create listings.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Admin Login](#admin-login)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Design System](#design-system)
- [Future Improvements](#future-improvements)

---

## Features

### Job Listings Page (`/`)
- Real-time search - queries `/posts/{text}` as you type (280 ms debounce) with a client-side fallback filter if the endpoint is unavailable
- Experience filter chips - instantly narrow cards to 0–2 yrs, 3–5 yrs, or 5+ yrs
- Responsive 3-column card grid - collapses to 2 columns on tablet and 1 column on mobile
- Shimmer skeleton loaders displayed while the API call is in flight
- Empty state and error state with a Retry button
- Live job count badge that updates as search/filter results change

### Admin Login
- "Post a Job" button triggers a login modal instead of the form directly
- Credentials are validated client-side before the Post Job modal opens
- Session stored in `sessionStorage` - persists across page refreshes within the same tab, cleared automatically when the tab closes
- A green "Admin" badge appears in the navbar while logged in, with a one-click Logout button
- Password show/hide toggle on the login form

### Post a Job (admin only)
- Modal overlay - opens on the homepage without any page navigation
- Seven validated fields: Job Title, Description, Skills, Experience, Location, Job Type, Salary Range
- On success: POSTs to the backend, closes the modal, shows a toast notification, and instantly refreshes the job grid
- On API failure: shows an inline error banner inside the modal

### Application Form Page (`/apply`)
- Pre-filled job title read from the `?title=` URL parameter
- Nine fields across four sections: Personal Details, Education, Compensation, Resume Upload
- Validates on blur and on submit - shows green checkmarks or red ✕ icons per field
- Custom styled file upload zone - accepts `.pdf`, `.doc`, `.docx` only
- On valid submit shows a success banner and redirects to the home page after 1.5 s

### Global
- Dark / Light mode toggle - persists via `localStorage` across pages and sessions
- Fixed glassmorphic navbar with backdrop blur, logo, nav links, and a hamburger menu on mobile
- Fully accessible - semantic HTML, `aria-label` on icon buttons, `aria-live` on dynamic regions, keyboard-navigable cards

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Spring Boot 2.5.7 |
| Language | Java 11 |
| Database | MongoDB |
| ODM | Spring Data MongoDB |
| Template Engine | Thymeleaf |
| API Docs | Springfox Swagger 2.9.2 |
| Build Tool | Maven |

### Frontend
| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 with custom design tokens + Tailwind CSS |
| Scripting | Vanilla JavaScript (ES2020, no frameworks) |
| Fonts | DM Sans + DM Mono via Google Fonts |
| API calls | `fetch()` to the same Spring Boot origin |

---

## Project Structure

```
hirebridge/
├── src/
│   └── main/
│       ├── java/com/hirebridge/joblisting/
│       │   ├── JoblistingApplication.java        # Entry point
│       │   ├── controller/
│       │   │   ├── PostController.java           # REST API endpoints
│       │   │   └── PageController.java           # Thymeleaf page routing
│       │   ├── model/
│       │   │   └── Post.java                     # Job post document model
│       │   └── repository/
│       │       ├── PostRepository.java           # MongoDB CRUD repository
│       │       ├── SearchRepository.java         # Search interface
│       │       └── SearchRepositoryImpl.java     # Atlas Search + regex fallback
│       └── resources/
│           ├── templates/
│           │   ├── index.html                    # Job listings + login + post job modals
│           │   └── apply.html                    # Job application form
│           ├── static/
│           │   ├── css/
│           │   │   ├── style.css                 # Full design system + all component styles
│           │   │   ├── input.css                 # Tailwind source
│           │   │   └── output.css                # Tailwind compiled output
│           │   ├── script.js                     # index.html - listings, search, modals, auth
│           │   └── apply.js                      # apply.html - form validation and submission
│           └── application.properties
├── pom.xml
├── tailwind.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Java 11 or higher
- Maven 3.6+
- MongoDB running locally on port `27017`
- Node.js (only needed to recompile Tailwind CSS)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/hirebridge.git
cd hirebridge
```

### 2. Configure MongoDB

The app connects to a local MongoDB instance by default. Update `src/main/resources/application.properties` if needed:

```properties
# Local MongoDB (default)
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=hirebridge
```

To use **MongoDB Atlas**, replace the above with a connection URI:

```properties
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster.mongodb.net/hirebridge
```

### 3. Run the application

```bash
./mvnw spring-boot:run
```

The app starts on **http://localhost:8080**

### 4. Seed sample data (optional)

Use the REST API to insert a sample job post:

```bash
curl -X POST http://localhost:8080/post \
  -H "Content-Type: application/json" \
  -d '{
    "profile": "Java Developer",
    "desc": "Build scalable REST APIs using Spring Boot and MongoDB.",
    "exp": 3,
    "techs": ["Java", "Spring Boot", "MongoDB", "REST APIs"]
  }'
```

### 5. Recompile Tailwind CSS (optional)

Only needed if you modify `input.css`:

```bash
npm install
npx tailwindcss -i ./src/main/resources/static/css/input.css \
                -o ./src/main/resources/static/css/output.css \
                --watch
```

---

## Admin Login

Job posting is restricted to administrators. When any "Post a Job" button is clicked, a login modal appears before the post form is shown.

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `hirebridge123` |

**Session behaviour:**
- The logged-in state is stored in `sessionStorage`
- It persists if you refresh the page within the same browser tab
- It is automatically cleared when the tab is closed
- While logged in, a green **Admin** badge with a **Logout** button appears in the navbar
- Clicking Logout immediately clears the session and hides the badge

> **Note:** These are hardcoded client-side credentials intended for a single-owner portfolio project. For a production deployment, replace this with server-side authentication (Spring Security + JWT or session-based auth).

---

## API Endpoints

All REST endpoints are served by `PostController.java`. Page routing is handled by `PageController.java`.

### REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/allPosts` | Returns all job posts as a JSON array |
| `GET` | `/posts/{text}` | Full-text search across `profile`, `desc`, and `techs` |
| `POST` | `/post` | Creates a new job post - accepts JSON body |

### Page Routes (Thymeleaf)

| Method | Endpoint | Template |
|---|---|---|
| `GET` | `/` | `templates/index.html` |
| `GET` | `/apply` | `templates/apply.html` |

### Job Post Schema

```json
{
  "profile": "Java Developer",
  "desc": "Build scalable REST APIs using Spring Boot and MongoDB.",
  "exp": 3,
  "techs": ["Java", "Spring Boot", "MongoDB"]
}
```

| Field | Type | Description |
|---|---|---|
| `profile` | `String` | Job title / role name |
| `desc` | `String` | Short job description |
| `exp` | `int` | Years of experience required |
| `techs` | `String[]` | Required technologies or skills |

### Search Strategy

`SearchRepositoryImpl` uses a two-tier approach:

1. **MongoDB Atlas Search** (primary) - `$search` aggregation stage for full-text relevance across `techs`, `desc`, and `profile`, sorted by experience ascending, limited to 5 results
2. **Regex fallback** (automatic) - if Atlas Search is unavailable (e.g. local MongoDB without a search index), falls back to a case-insensitive `$or` regex query across the same fields

---

## Frontend Pages

### `index.html` - Job Listings

Served at `GET /`. On load, `script.js` fetches all jobs from `/allPosts` and renders them as cards. Search calls `/posts/{text}` with a 280 ms debounce; failures fall back to client-side filtering of the cached data.

**Post a Job flow:**

```
Click "Post a Job"
       │
       ▼
  Logged in? ──No──► Login Modal ──Success──► Post Job Modal
       │
      Yes
       │
       ▼
  Post Job Modal ──Submit──► POST /post ──► Toast + Grid refresh
```

Clicking **Apply Now** on any card navigates to:

```
/apply?title=Java+Developer
```

### `apply.html` - Application Form

Served at `GET /apply`. Reads the `?title=` query parameter on load and injects it into the page heading. All nine fields are validated on blur and on submit.

| Field | Validation Rule |
|---|---|
| First / Last Name | Letters only - no numbers or symbols |
| Contact Number | Exactly 10 digits |
| Email | Standard email format |
| Education | Must select a non-default option |
| Major / Field of Study | Letters and spaces only |
| Current / Expected CTC | Valid non-negative number |
| Resume | `.pdf`, `.doc`, or `.docx` files only |

---

## Design System

All design tokens are CSS custom properties in `style.css`, automatically switching between light and dark themes via `[data-theme="dark"]`. The theme preference is persisted in `localStorage`.

| Token | Light | Dark |
|---|---|---|
| `--indigo` (primary) | `#4f46e5` | `#4f46e5` |
| `--bg` | `#f8fafc` | `#0f172a` |
| `--surface` | `#ffffff` | `#1e293b` |
| `--border` | `#e2e8f0` | `#334155` |
| `--text-primary` | `#0f172a` | `#f1f5f9` |
| `--text-secondary` | `#475569` | `#94a3b8` |

**Typography:** DM Sans (display + body) · DM Mono (skill tags)  
**Border radius:** Cards `16px` · Buttons `10px` · Badges `9999px`  
**Transitions:** `all 0.25s cubic-bezier(0.16, 1, 0.3, 1)`

---

## Future Improvements

- [ ] Replace client-side credentials with Spring Security - JWT or session-based authentication
- [ ] Persist job applications to MongoDB with a dedicated `Application` document
- [ ] Employer dashboard - view and manage applications per listing
- [ ] Resume file upload to cloud storage (AWS S3 or Cloudinary)
- [ ] Pagination or infinite scroll on the listings page for large datasets
- [ ] Email confirmation on successful application via Spring Mail
- [ ] Re-enable Swagger UI at `/swagger-ui.html` for API exploration
- [ ] Unit and integration tests for `PostController` and `SearchRepositoryImpl`

---

## License

This project is open source and available under the [MIT License](LICENSE).
