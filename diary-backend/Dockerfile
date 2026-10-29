
# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Run stage ----
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV JAVA_OPTS="-Xmx400m -Xms128m"

EXPOSE 8080

CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Dserver.address=0.0.0.0 -jar app.jar"]
