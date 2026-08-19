@echo off
set "PATH=%LOCALAPPDATA%\Programs\maven\bin;%PATH%"
cd /d "%~dp0"
mvn spring-boot:run
