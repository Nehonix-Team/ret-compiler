# Git Push Tool - Current Directory
# A streamlined script for git operations in the current directory
# Author: Enhanced from original sync script
# Version: 2.1.0

param(
    [string]$ConfigFile = "",
    [string]$CommitMessage = "",
    [string]$Branch = "",
    [switch]$SkipPrompts = $false,
    [switch]$DryRun = $false,
    [switch]$Verbose = $false,
    [switch]$CreateConfig = $false,
    [switch]$Help = $false,
    [switch]$SkipPull = $false,
    [switch]$Force = $false
)

# Script metadata
$ScriptVersion = "2.1.0"
$ScriptName = "Git Push Tool - Current Directory"

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
    hooks = @{
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
    Write-ColorHost "A streamlined tool for git operations in the current directory`n" $Colors.Info
    
    Write-ColorHost "USAGE:" $Colors.Highlight
    Write-ColorHost "  .\git-push.ps1 [OPTIONS]`n"
    
    Write-ColorHost "OPTIONS:" $Colors.Highlight
    Write-ColorHost "  -ConfigFile <path>        Use configuration file"
    Write-ColorHost "  -CommitMessage <message>  Custom commit message"
    Write-ColorHost "  -Branch <name>            Target branch name"
    Write-ColorHost "  -SkipPrompts              Skip interactive prompts"
    Write-ColorHost "  -SkipPull                 Skip pull before commit"
    Write-ColorHost "  -Force                    Force push (use with caution)"
    Write-ColorHost "  -DryRun                   Show what would be done"
    Write-ColorHost "  -Verbose                  Verbose output"
    Write-ColorHost "  -CreateConfig             Create sample config file"
    Write-ColorHost "  -Help                     Show this help`n"
    
    Write-ColorHost "EXAMPLES:" $Colors.Highlight
    Write-ColorHost "  # Interactive mode"
    Write-ColorHost "  .\git-push.ps1"
    Write-ColorHost ""
    Write-ColorHost "  # Quick commit and push"
    Write-ColorHost "  .\git-push.ps1 -CommitMessage 'Fix bug' -SkipPrompts"
    Write-ColorHost ""
    Write-ColorHost "  # Use config file"
    Write-ColorHost "  .\git-push.ps1 -ConfigFile git-config.json"
    Write-ColorHost ""
    Write-ColorHost "  # Dry run to see what would happen"
    Write-ColorHost "  .\git-push.ps1 -DryRun"
    Write-ColorHost ""
    Write-ColorHost "  # Push to specific branch"
    Write-ColorHost "  .\git-push.ps1 -Branch feature/new-feature -SkipPrompts"
}

function New-SampleConfig {
    $sampleConfig = @{
        version = "1.0"
        name = "Git Push Configuration"
        description = "Configuration for git push operations"
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
        hooks = @{
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
        defaultCommitMessage = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    $configFile = "git-push-config.json"
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

function Send-Notification($config, $success, $message) {
    if ($success -and -not $config.notifications.success) { return }
    if (-not $success -and -not $config.notifications.failure) { return }
    
    if ($config.notifications.webhook) {
        try {
            $payload = @{
                success = $success
                message = $message
                timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
                repository = (git remote get-url origin 2>$null)
                branch = (git branch --show-current 2>$null)
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $config.notifications.webhook -Method Post -Body $payload -ContentType "application/json"
            Write-VerboseLog "Notification sent to webhook"
        } catch {
            Write-VerboseLog "Failed to send webhook notification: $($_.Exception.Message)"
        }
    }
}

function Start-GitOperations($config) {
    Write-Header "GIT REPOSITORY OPERATIONS"
    
    $currentDir = Get-Location
    Write-ColorHost "Working directory: $currentDir" $Colors.Info
    
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
            git config --global user.name $config.git.user.name
            git config --global user.email $config.git.user.email
        }
    }
    
    # Get current branch
    $currentBranch = ""
    if (-not $DryRun) {
        $currentBranch = git branch --show-current 2>$null
    }
    if (-not $currentBranch) {
        $currentBranch = $config.git.defaultBranch
    }
    
    # Use specified branch if provided
    if ($Branch) {
        Write-ColorHost "Switching to branch: $Branch" $Colors.Info
        if (-not $DryRun) {
            git checkout -b $Branch 2>$null
            if ($LASTEXITCODE -ne 0) {
                git checkout $Branch 2>$null
                if ($LASTEXITCODE -ne 0) {
                    Write-ColorHost "Failed to switch to branch: $Branch" $Colors.Error
                    return $false
                }
            }
        }
        $currentBranch = $Branch
    }
    
    Write-ColorHost "Current branch: $currentBranch" $Colors.Info
    
    # Check for remote
    $hasRemote = $false
    if (-not $DryRun) {
        $remoteUrl = git remote get-url origin 2>$null
        $hasRemote = $LASTEXITCODE -eq 0 -and $remoteUrl
        if ($hasRemote) {
            Write-ColorHost "Remote origin: $remoteUrl" $Colors.Info
        } else {
            Write-ColorHost "No remote origin configured" $Colors.Warning
        }
    }
    
    # Fetch and pull if enabled and has remote
    if ($hasRemote -and $config.git.autoFetch -and -not $SkipPull) {
        Write-ColorHost "Fetching from remote..." $Colors.Info
        if (-not $DryRun) {
            git fetch origin 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-ColorHost "Fetch failed" $Colors.Warning
            }
        }
    }
    
    if ($hasRemote -and $config.git.autoPull -and -not $SkipPull) {
        Write-ColorHost "Checking for remote changes..." $Colors.Info
        if (-not $DryRun) {
            $behind = git rev-list --count HEAD..origin/$currentBranch 2>$null
            if ($LASTEXITCODE -eq 0 -and $behind -and $behind -gt 0) {
                Write-ColorHost "Pulling $behind commits from remote..." $Colors.Info
                git pull origin $currentBranch --no-edit
                if ($LASTEXITCODE -ne 0) {
                    Write-ColorHost "Pull failed - you may need to resolve conflicts" $Colors.Error
                    return $false
                }
            }
        }
    }
    
    # Check status
    Write-ColorHost "Checking repository status..." $Colors.Info
    $gitStatus = ""
    if (-not $DryRun) {
        $gitStatus = git status --porcelain 2>$null
    }
    
    if (-not $gitStatus -and -not $DryRun) {
        Write-ColorHost "No changes to commit" $Colors.Info
        return $true
    }
    
    Write-ColorHost "Changes detected:" $Colors.Info
    if (-not $DryRun) {
        git status --short
    } else {
        Write-ColorHost "DRY RUN: Would show git status" $Colors.Warning
    }
    
    # Ask for confirmation to proceed
    if (-not $SkipPrompts -and -not $DryRun) {
        $proceedConfirm = Get-YesNo "Do you want to commit and push these changes?" "y"
        if (-not $proceedConfirm) {
            Write-ColorHost "Operation cancelled by user" $Colors.Warning
            return $true
        }
    }
    
    # Pre-commit hook
    if (-not (Invoke-Hook $config.hooks.preCommit "pre-commit")) {
        return $false
    }
    
    # Get commit message
    $finalCommitMessage = $CommitMessage
    if ([string]::IsNullOrWhiteSpace($finalCommitMessage)) {
        if ($config.defaultCommitMessage) {
            $finalCommitMessage = $ExecutionContext.InvokeCommand.ExpandString($config.defaultCommitMessage)
        } else {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $finalCommitMessage = "Auto-commit - $timestamp"
        }
        
        if (-not $SkipPrompts) {
            $userMessage = Get-UserInput "Enter commit message" $finalCommitMessage
            if ($userMessage) {
                $finalCommitMessage = $userMessage
            }
        } else {
            Write-ColorHost "Using commit message: $finalCommitMessage" $Colors.Info
        }
    }
    
    # Commit changes
    Write-ColorHost "Committing changes: $finalCommitMessage" $Colors.Info
    if (-not $DryRun) {
        git add .
        git commit -m $finalCommitMessage
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorHost "Commit failed!" $Colors.Error
            return $false
        }
    } else {
        Write-ColorHost "DRY RUN: Would commit with message: $finalCommitMessage" $Colors.Warning
    }
    
    # Post-commit hook
    Invoke-Hook $config.hooks.postCommit "post-commit"
    
    # Push with retry logic
    if ($hasRemote) {
        $pushConfirm = $SkipPrompts  # If skipping prompts, auto-confirm push
        if (-not $SkipPrompts -and -not $DryRun) {
            $pushConfirm = Get-YesNo "Push to remote repository?" "y"
        } elseif ($SkipPrompts) {
            Write-ColorHost "Auto-pushing to remote (SkipPrompts enabled)" $Colors.Info
        }
        
        if ($pushConfirm) {
            # Pre-push hook
            if (-not (Invoke-Hook $config.hooks.prePush "pre-push")) {
                return $false
            }
            
            $retries = $config.git.pushRetries
            $success = $false
            
            for ($i = 1; $i -le $retries; $i++) {
                Write-ColorHost "Pushing to remote (attempt $i/$retries)..." $Colors.Info
                
                if ($DryRun) {
                    Write-ColorHost "DRY RUN: Would push to origin $currentBranch" $Colors.Warning
                    $success = $true
                    break
                } else {
                    if ($Force) {
                        git push origin $currentBranch --force
                    } else {
                        git push origin $currentBranch
                    }
                    
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
            }
            
            if (-not $success) {
                Write-ColorHost "Push failed after $retries attempts" $Colors.Error
                Send-Notification $config $false "Push failed after $retries attempts"
                return $false
            }
            
            # Post-push hook
            Invoke-Hook $config.hooks.postPush "post-push"
            Send-Notification $config $true "Successfully pushed to $currentBranch"
        }
    } else {
        Write-ColorHost "No remote configured - commit completed locally" $Colors.Info
    }
    
    return $true
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
    
    # Start git operations
    $gitSuccess = Start-GitOperations $config
    
    if ($gitSuccess) {
        Write-ColorHost "`n✅ SUCCESS: Git operations completed!" $Colors.Success
    } else {
        Write-ColorHost "`n❌ Git operations failed!" $Colors.Error
        exit 1
    }
    
} catch {
    Write-ColorHost "ERROR: $($_.Exception.Message)" $Colors.Error
    Write-VerboseLog "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}