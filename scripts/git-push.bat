@echo off
setlocal enabledelayedexpansion

:: Git Push Tool - Windows Batch Version
:: A streamlined script for git operations in the current directory
:: Version: 2.1.0 (Batch)

:: Initialize variables
set "SCRIPT_VERSION=2.1.0"
set "SCRIPT_NAME=Git Push Tool - Windows Batch"
set "COMMIT_MESSAGE="
set "BRANCH="
set "SKIP_PROMPTS=false"
set "DRY_RUN=false"
set "VERBOSE=false"
set "SKIP_PULL=false"
set "FORCE_PUSH=false"
set "SHOW_HELP=false"

:: Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="-h" set "SHOW_HELP=true" & shift & goto :parse_args
if /i "%~1"=="--help" set "SHOW_HELP=true" & shift & goto :parse_args
if /i "%~1"=="-m" set "COMMIT_MESSAGE=%~2" & shift & shift & goto :parse_args
if /i "%~1"=="--message" set "COMMIT_MESSAGE=%~2" & shift & shift & goto :parse_args
if /i "%~1"=="-b" set "BRANCH=%~2" & shift & shift & goto :parse_args
if /i "%~1"=="--branch" set "BRANCH=%~2" & shift & shift & goto :parse_args
if /i "%~1"=="-s" set "SKIP_PROMPTS=true" & shift & goto :parse_args
if /i "%~1"=="--skip-prompts" set "SKIP_PROMPTS=true" & shift & goto :parse_args
if /i "%~1"=="-d" set "DRY_RUN=true" & shift & goto :parse_args
if /i "%~1"=="--dry-run" set "DRY_RUN=true" & shift & goto :parse_args
if /i "%~1"=="-v" set "VERBOSE=true" & shift & goto :parse_args
if /i "%~1"=="--verbose" set "VERBOSE=true" & shift & goto :parse_args
if /i "%~1"=="--skip-pull" set "SKIP_PULL=true" & shift & goto :parse_args
if /i "%~1"=="-f" set "FORCE_PUSH=true" & shift & goto :parse_args
if /i "%~1"=="--force" set "FORCE_PUSH=true" & shift & goto :parse_args
shift
goto :parse_args

:args_done

:: Show help if requested
if "%SHOW_HELP%"=="true" goto :show_help

:: Main execution
echo.
echo %SCRIPT_NAME% v%SCRIPT_VERSION%
echo ============================================================

call :log_info "Working directory: %CD%"

:: Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Git is not installed or not in PATH"
    exit /b 1
)

:: Check if it's a git repository
if not exist ".git" (
    call :log_info "Not a git repository. Initializing..."
    if "%DRY_RUN%"=="false" (
        git init
        if errorlevel 1 (
            call :log_error "Failed to initialize git repository"
            exit /b 1
        )
    ) else (
        call :log_warning "DRY RUN: Would initialize git repository"
    )
)

:: Get current branch
if "%DRY_RUN%"=="false" (
    for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
    if "!CURRENT_BRANCH!"=="" set "CURRENT_BRANCH=main"
) else (
    set "CURRENT_BRANCH=main"
)

:: Switch to specified branch if provided
if not "%BRANCH%"=="" (
    call :log_info "Switching to branch: %BRANCH%"
    if "%DRY_RUN%"=="false" (
        git checkout -b %BRANCH% 2>nul
        if errorlevel 1 (
            git checkout %BRANCH% 2>nul
            if errorlevel 1 (
                call :log_error "Failed to switch to branch: %BRANCH%"
                exit /b 1
            )
        )
    ) else (
        call :log_warning "DRY RUN: Would switch to branch %BRANCH%"
    )
    set "CURRENT_BRANCH=%BRANCH%"
)

call :log_info "Current branch: !CURRENT_BRANCH!"

:: Check for remote
set "HAS_REMOTE=false"
if "%DRY_RUN%"=="false" (
    git remote get-url origin >nul 2>&1
    if not errorlevel 1 (
        set "HAS_REMOTE=true"
        for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do (
            call :log_info "Remote origin: %%i"
        )
    ) else (
        call :log_warning "No remote origin configured"
    )
)

:: Fetch and pull if enabled and has remote
if "%HAS_REMOTE%"=="true" if "%SKIP_PULL%"=="false" (
    call :log_info "Fetching from remote..."
    if "%DRY_RUN%"=="false" (
        git fetch origin 2>nul
        if errorlevel 1 call :log_warning "Fetch failed"
        
        call :log_info "Pulling latest changes..."
        git pull origin !CURRENT_BRANCH! --no-edit 2>nul
        if errorlevel 1 (
            call :log_error "Pull failed - you may need to resolve conflicts"
            exit /b 1
        )
    ) else (
        call :log_warning "DRY RUN: Would fetch and pull from remote"
    )
)

:: Check status
call :log_info "Checking repository status..."
if "%DRY_RUN%"=="false" (
    git status --porcelain >nul 2>&1
    if errorlevel 1 (
        call :log_info "No changes to commit"
        goto :success
    )
    
    :: Check if there are actually changes
    for /f %%i in ('git status --porcelain 2^>nul ^| find /c /v ""') do set "CHANGE_COUNT=%%i"
    if "!CHANGE_COUNT!"=="0" (
        call :log_info "No changes to commit"
        goto :success
    )
    
    call :log_info "Changes detected:"
    git status --short
) else (
    call :log_warning "DRY RUN: Would check git status"
)

:: Ask for confirmation to proceed
if "%SKIP_PROMPTS%"=="false" if "%DRY_RUN%"=="false" (
    set /p "PROCEED=Do you want to commit and push these changes? (y/n) [y]: "
    if "!PROCEED!"=="" set "PROCEED=y"
    if /i not "!PROCEED!"=="y" (
        call :log_warning "Operation cancelled by user"
        goto :success
    )
)

:: Get commit message
if "%COMMIT_MESSAGE%"=="" (
    for /f "tokens=2 delims= " %%i in ('date /t') do set "CURRENT_DATE=%%i"
    for /f "tokens=1 delims= " %%i in ('time /t') do set "CURRENT_TIME=%%i"
    set "COMMIT_MESSAGE=Auto-commit - !CURRENT_DATE! !CURRENT_TIME!"
    
    if "%SKIP_PROMPTS%"=="false" (
        set /p "USER_MESSAGE=Enter commit message [!COMMIT_MESSAGE!]: "
        if not "!USER_MESSAGE!"=="" set "COMMIT_MESSAGE=!USER_MESSAGE!"
    ) else (
        call :log_info "Using commit message: !COMMIT_MESSAGE!"
    )
)

:: Commit changes
call :log_info "Committing changes: !COMMIT_MESSAGE!"
if "%DRY_RUN%"=="false" (
    git add .
    if errorlevel 1 (
        call :log_error "Failed to stage changes"
        exit /b 1
    )
    
    git commit -m "!COMMIT_MESSAGE!"
    if errorlevel 1 (
        call :log_error "Commit failed!"
        exit /b 1
    )
) else (
    call :log_warning "DRY RUN: Would commit with message: !COMMIT_MESSAGE!"
)

:: Push to remote
if "%HAS_REMOTE%"=="true" (
    set "PUSH_CONFIRM=y"
    if "%SKIP_PROMPTS%"=="false" if "%DRY_RUN%"=="false" (
        set /p "PUSH_CONFIRM=Push to remote repository? (y/n) [y]: "
        if "!PUSH_CONFIRM!"=="" set "PUSH_CONFIRM=y"
    ) else if "%SKIP_PROMPTS%"=="true" (
        call :log_info "Auto-pushing to remote (skip prompts enabled)"
    )
    
    if /i "!PUSH_CONFIRM!"=="y" (
        call :log_info "Pushing to remote..."
        
        if "%DRY_RUN%"=="false" (
            set "PUSH_CMD=git push origin !CURRENT_BRANCH!"
            if "%FORCE_PUSH%"=="true" set "PUSH_CMD=!PUSH_CMD! --force"
            
            !PUSH_CMD!
            if errorlevel 1 (
                call :log_error "Push failed!"
                exit /b 1
            ) else (
                call :log_success "Push successful!"
            )
        ) else (
            call :log_warning "DRY RUN: Would push to origin !CURRENT_BRANCH!"
        )
    )
) else (
    call :log_info "No remote configured - commit completed locally"
)

:success
echo.
call :log_success "SUCCESS: Git operations completed!"
exit /b 0

:: Help function
:show_help
echo.
echo %SCRIPT_NAME% v%SCRIPT_VERSION%
echo A streamlined tool for git operations in the current directory
echo.
echo USAGE:
echo   git-push.bat [OPTIONS]
echo.
echo OPTIONS:
echo   -h, --help              Show this help
echo   -m, --message ^<msg^>     Custom commit message
echo   -b, --branch ^<name^>     Target branch name
echo   -s, --skip-prompts      Skip interactive prompts
echo   --skip-pull             Skip pull before commit
echo   -f, --force             Force push (use with caution)
echo   -d, --dry-run           Show what would be done
echo   -v, --verbose           Verbose output
echo.
echo EXAMPLES:
echo   # Interactive mode
echo   git-push.bat
echo.
echo   # Quick commit and push
echo   git-push.bat -m "Fix bug" -s
echo.
echo   # Push to specific branch
echo   git-push.bat -b feature/new-feature -s
echo.
echo   # Dry run to see what would happen
echo   git-push.bat -d
exit /b 0

:: Logging functions
:log_success
echo [SUCCESS] %~1
if "%VERBOSE%"=="true" echo [%TIME%] SUCCESS: %~1
exit /b 0

:log_info
echo [INFO] %~1
if "%VERBOSE%"=="true" echo [%TIME%] INFO: %~1
exit /b 0

:log_warning
echo [WARNING] %~1
if "%VERBOSE%"=="true" echo [%TIME%] WARNING: %~1
exit /b 0

:log_error
echo [ERROR] %~1
if "%VERBOSE%"=="true" echo [%TIME%] ERROR: %~1
exit /b 0

:log_verbose
if "%VERBOSE%"=="true" echo [%TIME%] VERBOSE: %~1
exit /b 0