#!/bin/bash

# Git Push Tool - Unix/Linux Shell Script Version
# A streamlined script for git operations in the current directory
# Version: 2.1.0 (Shell)

# Script metadata
SCRIPT_VERSION="2.1.0"
SCRIPT_NAME="Git Push Tool - Unix/Linux Shell Script"

# Initialize variables
COMMIT_MESSAGE=""
BRANCH=""
SKIP_PROMPTS=false
DRY_RUN=false
VERBOSE=false
SKIP_PULL=false
FORCE_PUSH=false
SHOW_HELP=false

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Logging functions
log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    [[ "$VERBOSE" == true ]] && echo -e "${GRAY}[$(date '+%H:%M:%S')] SUCCESS: $1${NC}"
}

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
    [[ "$VERBOSE" == true ]] && echo -e "${GRAY}[$(date '+%H:%M:%S')] INFO: $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    [[ "$VERBOSE" == true ]] && echo -e "${GRAY}[$(date '+%H:%M:%S')] WARNING: $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    [[ "$VERBOSE" == true ]] && echo -e "${GRAY}[$(date '+%H:%M:%S')] ERROR: $1${NC}"
}

log_verbose() {
    [[ "$VERBOSE" == true ]] && echo -e "${GRAY}[$(date '+%H:%M:%S')] VERBOSE: $1${NC}"
}

# Utility functions
print_header() {
    echo
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}$(echo "$1" | tr '[:lower:]' '[:upper:]')${NC}"
    echo -e "${CYAN}============================================================${NC}"
}

get_user_input() {
    local prompt="$1"
    local default="$2"
    local user_input
    
    if [[ "$SKIP_PROMPTS" == true && -n "$default" ]]; then
        log_info "Using default: $default"
        echo "$default"
        return
    fi
    
    if [[ -n "$default" ]]; then
        read -p "$prompt [default: $default]: " user_input
    else
        read -p "$prompt: " user_input
    fi
    
    if [[ -z "$user_input" && -n "$default" ]]; then
        echo "$default"
    else
        echo "$user_input"
    fi
}

get_yes_no() {
    local prompt="$1"
    local default="${2:-y}"
    local response
    
    if [[ "$SKIP_PROMPTS" == true ]]; then
        log_info "Using default: $default"
        [[ "$default" == "y" ]] && return 0 || return 1
    fi
    
    read -p "$prompt (y/n) [default: $default]: " response
    response=${response:-$default}
    [[ "$response" =~ ^[Yy]$ ]] && return 0 || return 1
}

# Help function
show_help() {
    echo
    echo -e "${MAGENTA}$SCRIPT_NAME v$SCRIPT_VERSION${NC}"
    echo "A streamlined tool for git operations in the current directory"
    echo
    echo -e "${MAGENTA}USAGE:${NC}"
    echo "  ./git-push.sh [OPTIONS]"
    echo
    echo -e "${MAGENTA}OPTIONS:${NC}"
    echo "  -h, --help              Show this help"
    echo "  -m, --message <msg>     Custom commit message"
    echo "  -b, --branch <name>     Target branch name"
    echo "  -s, --skip-prompts      Skip interactive prompts"
    echo "  --skip-pull             Skip pull before commit"
    echo "  -f, --force             Force push (use with caution)"
    echo "  -d, --dry-run           Show what would be done"
    echo "  -v, --verbose           Verbose output"
    echo
    echo -e "${MAGENTA}EXAMPLES:${NC}"
    echo "  # Interactive mode"
    echo "  ./git-push.sh"
    echo
    echo "  # Quick commit and push"
    echo "  ./git-push.sh -m \"Fix bug\" -s"
    echo
    echo "  # Push to specific branch"
    echo "  ./git-push.sh -b feature/new-feature -s"
    echo
    echo "  # Dry run to see what would happen"
    echo "  ./git-push.sh -d"
    echo
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            SHOW_HELP=true
            shift
            ;;
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -s|--skip-prompts)
            SKIP_PROMPTS=true
            shift
            ;;
        --skip-pull)
            SKIP_PULL=true
            shift
            ;;
        -f|--force)
            FORCE_PUSH=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Show help if requested
if [[ "$SHOW_HELP" == true ]]; then
    show_help
    exit 0
fi

# Main execution
main() {
    echo
    echo -e "${MAGENTA}$SCRIPT_NAME v$SCRIPT_VERSION${NC}"
    print_header "GIT REPOSITORY OPERATIONS"
    
    log_info "Working directory: $(pwd)"
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed or not in PATH"
        exit 1
    fi
    
    # Check if it's a git repository
    if [[ ! -d ".git" ]]; then
        log_info "Not a git repository. Initializing..."
        if [[ "$DRY_RUN" == false ]]; then
            if ! git init; then
                log_error "Failed to initialize git repository"
                exit 1
            fi
            git branch -M main 2>/dev/null || true
        else
            log_warning "DRY RUN: Would initialize git repository"
        fi
    fi
    
    # Get current branch
    if [[ "$DRY_RUN" == false ]]; then
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
        [[ -z "$CURRENT_BRANCH" ]] && CURRENT_BRANCH="main"
    else
        CURRENT_BRANCH="main"
    fi
    
    # Switch to specified branch if provided
    if [[ -n "$BRANCH" ]]; then
        log_info "Switching to branch: $BRANCH"
        if [[ "$DRY_RUN" == false ]]; then
            if ! git checkout -b "$BRANCH" 2>/dev/null; then
                if ! git checkout "$BRANCH" 2>/dev/null; then
                    log_error "Failed to switch to branch: $BRANCH"
                    exit 1
                fi
            fi
        else
            log_warning "DRY RUN: Would switch to branch $BRANCH"
        fi
        CURRENT_BRANCH="$BRANCH"
    fi
    
    log_info "Current branch: $CURRENT_BRANCH"
    
    # Check for remote
    HAS_REMOTE=false
    if [[ "$DRY_RUN" == false ]]; then
        if REMOTE_URL=$(git remote get-url origin 2>/dev/null); then
            HAS_REMOTE=true
            log_info "Remote origin: $REMOTE_URL"
        else
            log_warning "No remote origin configured"
        fi
    fi
    
    # Fetch and pull if enabled and has remote
    if [[ "$HAS_REMOTE" == true && "$SKIP_PULL" == false ]]; then
        log_info "Fetching from remote..."
        if [[ "$DRY_RUN" == false ]]; then
            if ! git fetch origin 2>/dev/null; then
                log_warning "Fetch failed"
            fi
            
            log_info "Pulling latest changes..."
            if ! git pull origin "$CURRENT_BRANCH" --no-edit 2>/dev/null; then
                log_error "Pull failed - you may need to resolve conflicts"
                exit 1
            fi
        else
            log_warning "DRY RUN: Would fetch and pull from remote"
        fi
    fi
    
    # Check status
    log_info "Checking repository status..."
    if [[ "$DRY_RUN" == false ]]; then
        if [[ -z "$(git status --porcelain 2>/dev/null)" ]]; then
            log_info "No changes to commit"
            log_success "SUCCESS: Git operations completed!"
            exit 0
        fi
        
        log_info "Changes detected:"
        git status --short
    else
        log_warning "DRY RUN: Would check git status"
    fi
    
    # Ask for confirmation to proceed
    if [[ "$SKIP_PROMPTS" == false && "$DRY_RUN" == false ]]; then
        if ! get_yes_no "Do you want to commit and push these changes?" "y"; then
            log_warning "Operation cancelled by user"
            log_success "SUCCESS: Git operations completed!"
            exit 0
        fi
    fi
    
    # Get commit message
    if [[ -z "$COMMIT_MESSAGE" ]]; then
        DEFAULT_MESSAGE="Auto-commit - $(date '+%Y-%m-%d %H:%M:%S')"
        
        if [[ "$SKIP_PROMPTS" == false ]]; then
            COMMIT_MESSAGE=$(get_user_input "Enter commit message" "$DEFAULT_MESSAGE")
        else
            COMMIT_MESSAGE="$DEFAULT_MESSAGE"
            log_info "Using commit message: $COMMIT_MESSAGE"
        fi
    fi
    
    # Commit changes
    log_info "Committing changes: $COMMIT_MESSAGE"
    if [[ "$DRY_RUN" == false ]]; then
        if ! git add .; then
            log_error "Failed to stage changes"
            exit 1
        fi
        
        if ! git commit -m "$COMMIT_MESSAGE"; then
            log_error "Commit failed!"
            exit 1
        fi
    else
        log_warning "DRY RUN: Would commit with message: $COMMIT_MESSAGE"
    fi
    
    # Push to remote
    if [[ "$HAS_REMOTE" == true ]]; then
        PUSH_CONFIRM=true
        if [[ "$SKIP_PROMPTS" == false && "$DRY_RUN" == false ]]; then
            get_yes_no "Push to remote repository?" "y"
            PUSH_CONFIRM=$?
        elif [[ "$SKIP_PROMPTS" == true ]]; then
            log_info "Auto-pushing to remote (skip prompts enabled)"
        fi
        
        if [[ $PUSH_CONFIRM -eq 0 ]]; then
            log_info "Pushing to remote..."
            
            if [[ "$DRY_RUN" == false ]]; then
                PUSH_CMD="git push origin $CURRENT_BRANCH"
                [[ "$FORCE_PUSH" == true ]] && PUSH_CMD="$PUSH_CMD --force"
                
                if eval "$PUSH_CMD"; then
                    log_success "Push successful!"
                else
                    log_error "Push failed!"
                    exit 1
                fi
            else
                log_warning "DRY RUN: Would push to origin $CURRENT_BRANCH"
            fi
        fi
    else
        log_info "No remote configured - commit completed locally"
    fi
    
    echo
    log_success "SUCCESS: Git operations completed!"
}

# Error handling
set -e
trap 'log_error "Script failed at line $LINENO"; exit 1' ERR

# Run main function
main "$@"