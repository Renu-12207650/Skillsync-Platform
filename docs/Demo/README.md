# Spring Boot Demo Project

Empty Spring Boot project with sample REST endpoints.

## Project Structure

```
Demo/
├── pom.xml                           # Maven configuration
├── README.md                         # This file
└── src/
    ├── main/
    │   ├── java/com/example/demo/
    │   │   └── DemoApplication.java  # Main class
    │   └── resources/
    │       └── application.properties # Configuration
    └── test/
        └── java/
```

## Terminal Commands to Run

### 1. Run with Maven (Development)
```bash
cd c:\SprintSkillSync\docs\Demo
mvn spring-boot:run
```

### 2. Clean and Run (After Changes)
```bash
cd c:\SprintSkillSync\docs\Demo
mvn clean spring-boot:run
```

### 3. Build JAR and Run
```bash
cd c:\SprintSkillSync\docs\Demo
mvn clean package
java -jar target\Demo-1.0.0.jar
```

### 4. Run on Different Port
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=9090"
```

### 5. Run with Debug Mode
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### 6. Run with Profile
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 7. Skip Tests
```bash
mvn spring-boot:run -DskipTests
```

## Verify Application

Once running, test these URLs:

| URL | Description |
|-----|-------------|
| http://localhost:8080 | Home page |
| http://localhost:8080/hello | Hello endpoint |
| http://localhost:8080/actuator/health | Health check |

## Stop Application

Press `Ctrl+C` in the terminal.

## Requirements

- Java 17+
- Maven 3.8+
