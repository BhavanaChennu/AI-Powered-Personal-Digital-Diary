# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Copy the pom first so dependencies are cached between builds
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Run stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Free tiers are memory-tight; cap the heap so the JVM doesn't get OOM-killed.
ENV JAVA_OPTS="-Xmx400m -Xms128m"

EXPOSE 8082
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
