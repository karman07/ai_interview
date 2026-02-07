# Fix GitHub Secret Scanning Block

## Problem
AWS credentials in `Job_BOT_accessKeys.csv` are committed in git history, blocking push.

## Solution

### Option 1: Allow Secret on GitHub (Quick Fix)
1. Visit: https://github.com/karman07/ai_interview/security/secret-scanning/unblock-secret/39KFcj2dWEoIgdVQkapbKqOET3r
2. Click "Allow secret"
3. Visit: https://github.com/karman07/ai_interview/security/secret-scanning/unblock-secret/39KFciXLuLTZ7eR0ejRCsUJ9nN9
4. Click "Allow secret"
5. Push again

### Option 2: Remove from History (Recommended)
```bash
cd /Users/karmansingh/Desktop/work

# Stash current changes
git stash

# Remove credential files from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch ai_interview/backend/Job_BOT_accessKeys.csv ai_interview/backend/Job_BOT_credentials.csv" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all

# Restore changes
git stash pop
```

### Option 3: Create New Branch (Easiest)
```bash
cd /Users/karmansingh/Desktop/work/ai_interview

# Create new branch without credential files
git checkout -b dev/backend_clean

# Add .gitignore changes
git add backend/.gitignore

# Commit
git commit -m "Add credential files to gitignore"

# Push new branch
git push origin dev/backend_clean
```

## Important: Rotate AWS Credentials
Since credentials were exposed, you should:
1. Login to AWS Console
2. Go to IAM > Users > Job_BOT
3. Delete old access keys
4. Create new access keys
5. Update `.env` file with new credentials

## Prevention
The `.gitignore` has been updated to prevent this in future:
- `*.csv`
- `*credentials*.csv`
- `*accessKeys*.csv`
- `Job_BOT*`
- `*.pem`
- `*.key`
