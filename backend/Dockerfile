# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
COPY src src
RUN --mount=type=cache,target=/root/.gradle ./gradlew clean bootJar --no-daemon \
    && cp "$(find build/libs -maxdepth 1 -type f -name '*.jar' ! -name '*-plain.jar' | head -n 1)" /workspace/app.jar

FROM eclipse-temurin:21-jre-alpine AS runtime
LABEL org.opencontainers.image.title="Sprint Clothes API" \
      org.opencontainers.image.description="API transaccional Spring Boot con Amazon Cognito" \
      org.opencontainers.image.source="https://github.com/"
RUN addgroup -g 10001 -S sprint && adduser -u 10001 -S sprint -G sprint
WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/app.jar /app/app.jar
USER 10001:10001
EXPOSE 8080
STOPSIGNAL SIGTERM
ENTRYPOINT ["java","-jar","/app/app.jar"]
