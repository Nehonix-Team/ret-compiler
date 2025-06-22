# Universal Git Sync & Push Tool
# A flexible script for syncing files and pushing to git repositories
# Author: Enhanced from original script
# Version: 2.0.0

param(
    [string]$ConfigFile = "",
    [string]$SourcePath = "",
    [string]$TargetPath = "",
    [string]$CommitMessage = "",
    [string]$Branch = "",
    [switch]$SkipPrompts = $false,
    [switch]$DryRun = $false,
    [switch]$Verbose = $false,
    [switch]$CreateConfig = $false,
    [switch]$Help = $false,
    [ValidateSet("copy", "move", "sync", "mirror")]
    [string]$SyncMode = "copy",
    [string[]]$ExcludePatterns = @(),
    [string[]]$IncludePatterns = @(),
    [switch]$PreserveTimestamps = $false,
    [switch]$BackupTarget = $false
)

# Script metadata
$ScriptVersion = "2.0.0"
$ScriptName = "Universal Git Sync & Push Tool"

# Color configuration
$Colors = @{
    Success = "Green"
    Info = "Cyan"
    Warning = "Yellow"
    Error = "Red"
    Highlight = "Magenta"
    Muted = "DarkGray"
}

# Default configuration
$DefaultConfig = @{
    syncMode = "copy"
    preserveTimestamps = $false
    backupTarget = $false
    git = @{
        autoFetch = $true
        autoPull = $true
        pushRetries = 3
        defaultBranch = "main"
    }
    excludePatterns = @("*.log", "*.tmp", "node_modules", ".git", ".vs", "bin", "obj")
    includePatterns = @()
    hooks = @{
        preSync = ""
        postSync = ""
        preCommit = ""
        postCommit = ""
        prePush = ""
        postPush = ""
    }
}

# Utility functions
function Write-ColorHost($message, $color = "White") {
    if ($color -eq "White") {
        Write-Host $message
    } else {
        Write-Host $message -ForegroundColor $color
    }
}

function Write-VerboseLog($message) {
    if ($Verbose) {
        Write-ColorHost "[VERBOSE] $message" $Colors.Muted
    }
}

function Write-Header($title) {
    Write-ColorHost "`n$('=' * 60)" $Colors.Info
    Write-ColorHost $title.ToUpper() $Colors.Info
    Write-ColorHost $('=' * 60) $Colors.Info
}

function Get-UserInput($prompt, $default = "") {
    if ($SkipPrompts -and $default) {
        Write-ColorHost "Using default: $default" $Colors.Info
        return $default
    }
    
    if ($default) {
        $input = Read-Host "$prompt [default: $default]"
    } else {
        $input = Read-Host $prompt
    }
    
    if ([string]::IsNullOrWhiteSpace($input) -and $default) {
        return $default
    }
    return $input
}

function Get-YesNo($prompt, $default = "y") {
    if ($SkipPrompts) {
        Write-ColorHost "Using default: $default" $Colors.Info
        return $default.ToLower() -eq "y"
    }
    
    $response = Read-Host "$prompt (y/n) [default: $default]"
    if ([string]::IsNullOrWhiteSpace($response)) {
        $response = $default
    }
    return $response.ToLower() -eq "y"
}

function Show-Help {
    Write-ColorHost "`n$ScriptName v$ScriptVersion" $Colors.Highlight
    Write-ColorHost "A flexible tool for syncing files and pushing to git repositories`n" $Colors.Info
    
    Write-ColorHost "USAGE:" $Colors.Highlight
    Write-ColorHost "  .\sync-push.ps1 [OPTIONS]`n"
    
    Write-ColorHost "OPTIONS:" $Colors.Highlight
    Write-ColorHost "  -ConfigFile <path>        Use configuration file"
    Write-ColorHost "  -SourcePath <path>        Source directory path"
    Write-ColorHost "  -TargetPath <path>        Target directory path"
    Write-ColorHost "  -CommitMessage <message>  Custom commit message"
    Write-ColorHost "  -Branch <name>            Target branch name"
    Write-ColorHost "  -SyncMode <mode>          Sync mode: copy, move, sync, mirror"
    Write-ColorHost "  -ExcludePatterns <array>  Patterns to exclude"
    Write-ColorHost "  -IncludePatterns <array>  Patterns to include"
    Write-ColorHost "  -SkipPrompts              Skip interactive prompts"
    Write-ColorHost "  -DryRun                   Show what would be done"
    Write-ColorHost "  -Verbose                  Verbose output"
    Write-ColorHost "  -CreateConfig             Create sample config file"
    Write-ColorHost "  -PreserveTimestamps       Preserve file timestamps"
    Write-ColorHost "  -BackupTarget             Backup target before sync"
    Write-ColorHost "  -Help                     Show this help`n"
    
    Write-ColorHost "EXAMPLES:" $Colors.Highlight
    Write-ColorHost "  # Interactive mode"
    Write-ColorHost "  .\sync-push.ps1"
    Write-ColorHost ""
    Write-ColorHost "  # Use config file"
    Write-ColorHost "  .\sync-push.ps1 -ConfigFile myproject.json"
    Write-ColorHost ""
    Write-ColorHost "  # Quick sync with custom paths"
    Write-ColorHost "  .\sync-push.ps1 -SourcePath 'C:\src' -TargetPath 'C:\target' -SkipPrompts"
    Write-ColorHost ""
    Write-ColorHost "  # Dry run to see what would happen"
    Write-ColorHost "  .\sync-push.ps1 -ConfigFile myproject.json -DryRun"
    Write-ColorHost ""
    Write-ColorHost "  # Create sample configuration"
    Write-ColorHost "  .\sync-push.ps1 -CreateConfig"
}

function New-SampleConfig {
    $sampleConfig = @{
        version = "1.0"
        name = "My Project Sync"
        description = "Sync configuration for my project"
        sourcePath = "C:\source\path"
        targetPath = "C:\target\path"
        syncMode = "copy"
        preserveTimestamps = $false
        backupTarget = $false
        git = @{
            autoFetch = $true
            autoPull = $true
            pushRetries = 3
            defaultBranch = "main"
            user = @{
                name = ""
                email = ""
            }
        }
        excludePatterns = @(
            "*.log"
            "*.tmp"
            "node_modules"
            ".git"
            ".vs"
            "bin"
            "obj"
            "*.cache"
        )
        includePatterns = @()
        hooks = @{
            preSync = ""
            postSync = ""
            preCommit = ""
            postCommit = ""
            prePush = ""
            postPush = ""
        }
        notifications = @{
            success = $true
            failure = $true
            webhook = ""
        }
    }
    
    $configFile = "sync-config-sample.json"
    $sampleConfig | ConvertTo-Json -Depth 10 | Out-File $configFile -Encoding UTF8
    Write-ColorHost "Sample configuration created: $configFile" $Colors.Success
    Write-ColorHost "Edit this file and use with: -ConfigFile $configFile" $Colors.Info
}

function Read-ConfigFile($filePath) {
    if (-not (Test-Path $filePath)) {
        Write-ColorHost "Config file not found: $filePath" $Colors.Error
        return $null
    }
    
    try {
        $config = Get-Content $filePath -Raw | ConvertFrom-Json
        Write-VerboseLog "Configuration loaded from: $filePath"
        return $config
    } catch {
        Write-ColorHost "Error reading config file: $($_.Exception.Message)" $Colors.Error
        return $null
    }
}

function Test-PathPattern($path, $patterns) {
    if (-not $patterns -or $patterns.Count -eq 0) {
        return $false
    }
    
    foreach ($pattern in $patterns) {
        if ($path -like $pattern) {
            return $true
        }
    }
    return $false
}

function Sync-Files($sourceDir, $targetDir, $mode, $excludePatterns, $includePatterns) {
    Write-Header "FILE SYNCHRONIZATION"
    Write-ColorHost "Mode: $mode" $Colors.Info
    Write-ColorHost "Source: $sourceDir" $Colors.Info
    Write-ColorHost "Target: $targetDir" $Colors.Info
    
    if ($DryRun) {
        Write-ColorHost "DRY RUN MODE - No files will be modified" $Colors.Warning
    }
    
    # Validate source
    if (-not (Test-Path $sourceDir)) {
        Write-ColorHost "Source path does not exist: $sourceDir" $Colors.Error
        return $false
    }
    
    # Create target directory if needed
    if (-not (Test-Path $targetDir)) {
        Write-ColorHost "Creating target directory..." $Colors.Info
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
    }
    
    # Backup target if requested
    if ($BackupTarget -and (Test-Path $targetDir) -and (Get-ChildItem $targetDir)) {
        $backupPath = "$targetDir.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-ColorHost "Creating backup: $backupPath" $Colors.Info
        if (-not $DryRun) {
            Copy-Item -Path $targetDir -Destination $backupPath -Recurse -Force
        }
    }
    
    # Clear target for mirror mode
    if ($mode -eq "mirror" -and (Test-Path $targetDir)) {
        Write-ColorHost "Clearing target directory (mirror mode)..." $Colors.Info
        if (-not $DryRun) {
            Get-ChildItem -Path $targetDir -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        }
    }
    
    # Get files to sync
    $sourceFiles = Get-ChildItem -Path $sourceDir -Recurse -File
    $syncedCount = 0
    $skippedCount = 0
    
    foreach ($file in $sourceFiles) {
        $relativePath = $file.FullName.Substring($sourceDir.Length + 1)
        $targetFile = Join-Path $targetDir $relativePath
        
        # Check include patterns
        if ($includePatterns -and $includePatterns.Count -gt 0) {
            if (-not (Test-PathPattern $relativePath $includePatterns)) {
                Write-VerboseLog "Skipped (not in include patterns): $relativePath"
                $skippedCount++
                continue
            }
        }
        
        # Check exclude patterns
        if (Test-PathPattern $relativePath $excludePatterns) {
            Write-VerboseLog "Skipped (excluded): $relativePath"
            $skippedCount++
            continue
        }
        
        # Ensure target directory exists
        $targetFileDir = Split-Path $targetFile -Parent
        if (-not (Test-Path $targetFileDir)) {
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $targetFileDir -Force | Out-Null
            }
        }
        
        # Sync file based on mode
        $shouldSync = $true
        if ($mode -eq "sync" -and (Test-Path $targetFile)) {
            $sourceTime = $file.LastWriteTime
            $targetTime = (Get-Item $targetFile).LastWriteTime
            $shouldSync = $sourceTime -gt $targetTime
        }
        
        if ($shouldSync) {
            Write-VerboseLog "Syncing: $relativePath"
            if (-not $DryRun) {
                if ($mode -eq "move") {
                    Move-Item -Path $file.FullName -Destination $targetFile -Force
                } else {
                    Copy-Item -Path $file.FullName -Destination $targetFile -Force
                    if ($PreserveTimestamps) {
                        (Get-Item $targetFile).LastWriteTime = $file.LastWriteTime
                    }
                }
            }
            $syncedCount++
        } else {
            Write-VerboseLog "Skipped (up to date): $relativePath"
            $skippedCount++
        }
    }
    
    Write-ColorHost "Sync completed: $syncedCount files synced, $skippedCount skipped" $Colors.Success
    return $true
}

function Invoke-Hook($hookCommand, $hookName) {
    if ([string]::IsNullOrWhiteSpace($hookCommand)) {
        return $true
    }
    
    Write-ColorHost "Executing $hookName hook..." $Colors.Info
    Write-VerboseLog "Hook command: $hookCommand"
    
    if ($DryRun) {
        Write-ColorHost "DRY RUN: Would execute hook: $hookCommand" $Colors.Warning
        return $true
    }
    
    try {
        Invoke-Expression $hookCommand
        if ($LASTEXITCODE -eq 0) {
            Write-ColorHost "$hookName hook completed successfully" $Colors.Success
            return $true
        } else {
            Write-ColorHost "$hookName hook failed with exit code: $LASTEXITCODE" $Colors.Error
            return $false
        }
    } catch {
        Write-ColorHost "$hookName hook error: $($_.Exception.Message)" $Colors.Error
        return $false
    }
}

function Sync-GitRepository($targetDir, $config) {
    Write-Header "GIT REPOSITORY OPERATIONS"
    
    # Change to target directory
    $originalLocation = Get-Location
    Set-Location $targetDir
    
    try {
        # Check if it's a git repository
        if (-not (Test-Path ".git")) {
            Write-ColorHost "Not a git repository. Initializing..." $Colors.Info
            if (-not $DryRun) {
                git init
                if ($config.git.defaultBranch) {
                    git branch -M $config.git.defaultBranch
                }
            }
        }
        
        # Configure git user if specified
        if ($config.git.user.name) {
            Write-ColorHost "Setting git user: $($config.git.user.name)" $Colors.Info
            if (-not $DryRun) {
                git config user.name $config.git.user.name
                git config user.email $config.git.user.email
            }
        }
        
        # Get current branch
        $currentBranch = git branch --show-current
        if (-not $currentBranch) {
            $currentBranch = $config.git.defaultBranch
        }
        
        # Use specified branch if provided
        if ($Branch) {
            Write-ColorHost "Switching to branch: $Branch" $Colors.Info
            if (-not $DryRun) {
                git checkout -b $Branch 2>$null
                if ($LASTEXITCODE -ne 0) {
                    git checkout $Branch
                }
            }
            $currentBranch = $Branch
        }
        
        Write-ColorHost "Current branch: $currentBranch" $Colors.Info
        
        # Fetch and pull if enabled
        if ($config.git.autoFetch) {
            Write-ColorHost "Fetching from remote..." $Colors.Info
            if (-not $DryRun) {
                git fetch origin 2>$null
            }
        }
        
        if ($config.git.autoPull) {
            Write-ColorHost "Checking for remote changes..." $Colors.Info
            if (-not $DryRun) {
                $behind = git rev-list --count HEAD..origin/$currentBranch 2>$null
                if ($behind -and $behind -gt 0) {
                    Write-ColorHost "Pulling $behind commits from remote..." $Colors.Info
                    git pull origin $currentBranch --no-edit
                }
            }
        }
        
        # Check status
        $gitStatus = git status --porcelain
        if (-not $gitStatus) {
            Write-ColorHost "No changes to commit" $Colors.Info
            return $true
        }
        
        Write-ColorHost "Changes detected:" $Colors.Info
        if (-not $DryRun) {
            git status --short
        }
        
        # Pre-commit hook
        if (-not (Invoke-Hook $config.hooks.preCommit "pre-commit")) {
            return $false
        }
        
        # Commit changes
        if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $CommitMessage = "Auto-sync - $timestamp"
        }
        
        Write-ColorHost "Committing changes: $CommitMessage" $Colors.Info
        if (-not $DryRun) {
            git add .
            git commit -m $CommitMessage
            
            if ($LASTEXITCODE -ne 0) {
                Write-ColorHost "Commit failed!" $Colors.Error
                return $false
            }
        }
        
        # Post-commit hook
        Invoke-Hook $config.hooks.postCommit "post-commit"
        
        # Push with retry logic
        if (-not $DryRun) {
            $pushConfirm = Get-YesNo "Push to remote repository?" "y"
            if ($pushConfirm) {
                # Pre-push hook
                if (-not (Invoke-Hook $config.hooks.prePush "pre-push")) {
                    return $false
                }
                
                $retries = $config.git.pushRetries
                $success = $false
                
                for ($i = 1; $i -le $retries; $i++) {
                    Write-ColorHost "Pushing to remote (attempt $i/$retries)..." $Colors.Info
                    git push origin $currentBranch
                    
                    if ($LASTEXITCODE -eq 0) {
                        $success = $true
                        Write-ColorHost "Push successful!" $Colors.Success
                        break
                    } else {
                        Write-ColorHost "Push failed (attempt $i/$retries)" $Colors.Warning
                        if ($i -lt $retries) {
                            Start-Sleep -Seconds 2
                        }
                    }
                }
                
                if (-not $success) {
                    Write-ColorHost "Push failed after $retries attempts" $Colors.Error
                    return $false
                }
                
                # Post-push hook
                Invoke-Hook $config.hooks.postPush "post-push"
            }
        }
        
        return $true
        
    } finally {
        Set-Location $originalLocation
    }
}

# Main execution
try {
    Write-ColorHost "`n$ScriptName v$ScriptVersion" $Colors.Highlight
    
    if ($Help) {
        Show-Help
        exit 0
    }
    
    if ($CreateConfig) {
        New-SampleConfig
        exit 0
    }
    
    # Load configuration
    $config = $DefaultConfig.Clone()
    
    if ($ConfigFile) {
        $fileConfig = Read-ConfigFile $ConfigFile
        if ($fileConfig) {
            # Merge configurations
            foreach ($key in $fileConfig.PSObject.Properties.Name) {
                $config.$key = $fileConfig.$key
            }
        }
    }
    
    # Override with command line parameters
    if ($SourcePath) { $config.sourcePath = $SourcePath }
    if ($TargetPath) { $config.targetPath = $TargetPath }
    if ($SyncMode) { $config.syncMode = $SyncMode }
    if ($ExcludePatterns) { $config.excludePatterns = $ExcludePatterns }
    if ($IncludePatterns) { $config.includePatterns = $IncludePatterns }
    if ($PreserveTimestamps) { $config.preserveTimestamps = $PreserveTimestamps }
    if ($BackupTarget) { $config.backupTarget = $BackupTarget }
    
    # Get paths if not provided
    if (-not $config.sourcePath) {
        $config.sourcePath = Get-UserInput "Enter source path"
    }
    if (-not $config.targetPath) {
        $config.targetPath = Get-UserInput "Enter target path"
    }
    
    if (-not $config.sourcePath -or -not $config.targetPath) {
        Write-ColorHost "Source and target paths are required!" $Colors.Error
        exit 1
    }
    
    # Resolve paths
    $sourcePath = Resolve-Path $config.sourcePath -ErrorAction SilentlyContinue
    $targetPath = $config.targetPath
    
    if (-not $sourcePath) {
        Write-ColorHost "Source path does not exist: $($config.sourcePath)" $Colors.Error
        exit 1
    }
    
    # Pre-sync hook
    if (-not (Invoke-Hook $config.hooks.preSync "pre-sync")) {
        exit 1
    }
    
    # Sync files
    $syncSuccess = Sync-Files $sourcePath $targetPath $config.syncMode $config.excludePatterns $config.includePatterns
    
    if (-not $syncSuccess) {
        Write-ColorHost "File synchronization failed!" $Colors.Error
        exit 1
    }
    
    # Post-sync hook
    Invoke-Hook $config.hooks.postSync "post-sync"
    
    # Git operations
    $gitSuccess = Sync-GitRepository $targetPath $config
    
    if ($gitSuccess) {
        Write-ColorHost "`n✅ SUCCESS: All operations completed!" $Colors.Success
    } else {
        Write-ColorHost "`n❌ Git operations failed!" $Colors.Error
        exit 1
    }
    
} catch {
    Write-ColorHost "ERROR: $($_.Exception.Message)" $Colors.Error
    exit 1
}