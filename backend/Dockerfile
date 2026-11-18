# Stage 1: Build the application with Maven
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B || true
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run with lightweight JRE
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/lawfirm-app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENV SPRING_PROFILES_ACTIVE=docker
CMD ["java", "-jar", "app.jar"]
