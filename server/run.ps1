# Run the Java 24 Spring Boot backend
$mvnBin = "$env:LOCALAPPDATA\Programs\maven\bin"
if (Test-Path "$mvnBin\mvn.cmd") {
    $env:Path = "$mvnBin;" + $env:Path
}
mvn spring-boot:run
