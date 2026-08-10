FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY gradlew gradlew.bat settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
RUN chmod +x gradlew
COPY src src
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S sprint && adduser -S sprint -G sprint
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar app.jar
USER sprint
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75","-jar","/app/app.jar"]
