# Specify
Specify is a modern Spring Boot-based web app for software requirements analysis, where users can create projects, define use cases and CRC cards, build workflows and generate UML diagram scripts.

## Prerequisites

Before setting up the application, make sure you have the following installed on your machine:

1. **Node.js** (version 18.x or higher)
2. **npm** (version 9.x or higher)
3. **MySQL Server** (version 8.0 or higher)

## Local Setup

Follow these steps to configure and run the application on your computer:

### Step 1: Install Frontend Dependencies
Open your command line interface in the `client` directory and run:
```bash
npm install
```

### Step 2: Configure Backend Environment Variables
Create a `.env` file in the `server/config` directory and configure your server port and MySQL details. You can copy the template file to start:
```bash
cp .env.example .env
```

Modify the `.env` file with your own values:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=specify_db
DB_PORT=3306
SERVER_PORT=8080
```

### Step 3: Database Setup (Optional)
If you are planning to use the default MySQL database schema, import the setup file to create the tables:
```bash
mysql -u root -p < mysql-schema.sql
```

## Running the Application

### Frontend
1. Enter the `client` directory.
2. Start development mode with hot-reloading:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Backend
The entire controller, routing, and database persistency layer has been implemented using Java Spring Boot under the `server` directory, mapped and configured via the `pom.xml`:

1. **Prerequisites:** Ensure you have **Java JDK 17** (or higher) and **Maven** installed.
2. Enter the `server` directory.
3. **Build the JAR Package:**
   ```bash
   mvn clean package
   ```
4. **Execute the Spring Boot Application:**
   ```bash
   mvn spring-boot:run
   ```
   Configured `port` for Spring Boot server is set to `8080`.
