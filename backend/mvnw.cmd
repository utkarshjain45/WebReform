@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@REM set %ENABLE_CMD_TOOL% to 1 to enable modern batch features
SET ENABLE_CMD_TOOL=1

@REM Execute a user defined script before this one
IF NOT "%MAVEN_SKIP_RC%" == "" GOTO skipRcPre
@REM [%USERPROFILE%]\mavenrc_pre.bat
IF EXIST "%USERPROFILE%\mavenrc_pre.bat" call "%USERPROFILE%\mavenrc_pre.bat"
@REM [%USERPROFILE%]\.mavenrc
IF EXIST "%USERPROFILE%\.mavenrc" call "%USERPROFILE%\.mavenrc"
:skipRcPre

@setlocal

SET ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal

@REM ==== START VALIDATION ====
SET JAVACMD=java
IF NOT "%JAVA_HOME%" == "" (
  IF EXIST "%JAVA_HOME%\bin\java.exe" (
    SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
  )
)
@REM ==== END VALIDATION ====

:init

SET MAVEN_CMD_LINE_ARGS=%*

SET MAVEN_PROJECTBASEDIR=%~dp0
IF NOT "%MAVEN_PROJECTBASEDIR:~-1%"=="" SET MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

"%JAVACMD%" %JVM_CONFIG_MAVEN_PROPS% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp %WRAPPER_JAR% %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%
IF ERRORLEVEL 1 GOTO error
GOTO end

:error
SET ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

IF NOT "%MAVEN_SKIP_RC%" == "" GOTO skipRcPost
@REM [%USERPROFILE%]\mavenrc_post.bat
IF EXIST "%USERPROFILE%\mavenrc_post.bat" call "%USERPROFILE%\mavenrc_post.bat"
:skipRcPost

exit /B %ERROR_CODE%
