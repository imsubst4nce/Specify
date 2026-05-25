# Specify
Specify is a modern Spring Boot-based web app for software requirements analysis, where users can create projects, define use cases and CRC cards, build workflows and generate UML diagram scripts.

## Prerequisites

Before setting up the application, make sure you have the following installed on your machine:

1. **Node.js** (version 18.x or higher)
2. **npm** (version 9.x or higher)
3. **MySQL Server** (version 8.0 or higher) - Optional, as the app will fallback to a local JSON file if MySQL is not configured.

## Local Setup

Follow these steps to configure and run the application on your computer:

### Step 1: Install Dependencies
Open your command line interface in the project root directory and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory and configure your port and MySQL login details. You can copy the template file to start:
```bash
cp .env.example .env
```

Modify the `.env` file with your own values:
```env
APP_URL="http://localhost:3000"

# MySQL Database connection details
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=specify_db
DB_PORT=3306
```

### Step 3: Database Setup (Optional)
If you are planning to use a MySQL database, import the setup file to create the tables:
```bash
mysql -u root -p < mysql-setup.sql
```
*Note: If no MySQL database details are provided or the database is unreachable, the app automatically falls back to a clean local JSON file (`database.json`) to keep all screens and features fully operational.*

## Running the Application

### Real-Time Live Preview (Express & React)
For local development and testing inside the live preview container, the app uses a dual-engine architecture where Vite serves React assets and Express handles endpoints on port 3000:

1. Start development mode with hot-reloading:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Java Spring Boot Backend Server
The entire controller, routing, and database persistency layer has been migrated to Java Spring Boot under the `server` directory, mapped and configured via the root-level `pom.xml`:

1. **Prerequisites:** Ensure you have **Java JDK 17** (or higher) and **Maven** installed.
2. **Build the JAR Package:**
   ```bash
   mvn clean package
   ```
3. **Execute the Spring Boot Application:**
   ```bash
   mvn spring-boot:run
   ```
This boots the Spring server, establishing DB tables, REST endpoints, security filters, and UML compilation services directly on the configured Spring port.

### Production Production Build
To wrap up and compile the Express wrapper and client assets:

1. Compile the code:
   ```bash
   npm run build
   ```
2. Start the compiled app:
   ```bash
   npm start
   ```
