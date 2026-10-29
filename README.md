# AI-Powered Personal Digital Diary 📝🤖

A full-stack web application that helps users maintain a personal diary, organize daily tasks, and reflect on their experiences with AI-powered assistance.

Built using **Java, Spring Boot, React.js, MySQL, and the Groq API**, the application combines diary management, authentication, and AI features in one place.

## ✨ Features

- **User Authentication:** Registration and login using Spring Security and JWT-based authentication.
- **Diary Management:** Create, view, update, and manage personal diary entries.
- **AI-Powered Assistance:** Get AI-generated assistance and summaries using the Groq API.
- **Task Management:** Organize daily activities with a built-in to-do list.
- **Profile Management:** Manage user profile information and account settings.
- **PIN Protection:** Additional PIN-based protection for supported diary features.
- **Calendar View:** Browse diary entries by date.
- **Rich Text Editing:** Write and format diary entries.
- **Doodle Canvas:** Express thoughts creatively through drawing.
- **Trash Management:** Manage deleted diary entries.
- **Responsive Interface:** React-based frontend for interacting with the application.

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Java 17, Spring Boot |
| API | REST APIs |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Security | Spring Security, JWT |
| AI Integration | Groq API |
| Build Tool | Maven |
| Version Control | Git, GitHub |

## 📁 Project Structure

```text
AI-Powered-Personal-Digital-Diary/
│
├── diary-backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/diary/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   ├── entity/
│   │       │   ├── repository/
│   │       │   ├── security/
│   │       │   └── service/
│   │       └── resources/
│   │           └── application.example.properties
│   ├── Dockerfile
│   ├── render.yaml
│   ├── DEPLOYMENT.md
│   └── pom.xml
│
├── diary-frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the application:

- Java 17 or a compatible configured JDK
- Maven
- Node.js and npm
- MySQL Server
- A Groq API key for AI functionality

### 1. Clone the repository

```bash
git clone https://github.com/BhavanaChennu/AI-Powered-Personal-Digital-Diary.git
cd AI-Powered-Personal-Digital-Diary
```

### 2. Configure the database

Create a MySQL database:

```sql
CREATE DATABASE diary_db;
```

### 3. Configure the backend

Navigate to:

`diary-backend/src/main/resources/`

Create a file named `application.properties` using `application.example.properties` as your reference.

Configure your local database credentials and the following application settings:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `app.jwt.secret`
- `app.groq.api-key`
- `app.cors.allowed-origin`

Use your own credentials and a securely generated JWT secret. Keep real credentials and API keys out of GitHub.

### 4. Run the backend

Open a terminal in the `diary-backend` directory and run:

```bash
mvn spring-boot:run
```

The backend uses the configured server port. The example configuration defaults to port `8081`, unless the `PORT` environment variable overrides it.

### 5. Configure and run the frontend

Open another terminal from the project root:

```bash
cd diary-frontend
npm install
npm start
```

The React development server typically opens at:

`http://localhost:3000`

Ensure the frontend API configuration points to the running backend and that the backend CORS configuration permits the frontend origin.

## 🔐 Security

- Authentication using Spring Security and JWT.
- Password hashing with BCrypt.
- Protected API endpoints.
- Environment-based configuration for sensitive credentials.
- PIN-based protection for supported features.

**Security note:** Keep database passwords, JWT secrets, and Groq API keys private. Never commit your local `application.properties` file or real `.env` files.

## ☁️ Deployment

Deployment configuration files are included in the backend directory:

- `Dockerfile`
- `render.yaml`
- `DEPLOYMENT.md`

Refer to `diary-backend/DEPLOYMENT.md` for deployment instructions. A deployed application also requires appropriately configured environment variables, a reachable database, and the correct frontend API URL and CORS origin.

## 🎯 Project Objective

The goal of this project is to combine full-stack web development, secure user authentication, database integration, and AI-assisted functionality to create a practical personal journaling application.

## 👩‍💻 Author

**Bhavana Chennu**

- GitHub: [BhavanaChennu](https://github.com/BhavanaChennu)
- Project Repository: [AI-Powered Personal Digital Diary](https://github.com/BhavanaChennu/AI-Powered-Personal-Digital-Diary)
