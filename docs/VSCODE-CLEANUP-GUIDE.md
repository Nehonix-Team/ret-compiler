# VSCode Extension Cleanup Guide

## 🚨 One-Time Cleanup Required

If you previously uninstalled the Fortify Schema VSCode extension, leftover settings may remain in your VSCode configuration. **This issue is now fixed** for future installations, but existing users need a one-time cleanup.

## 🎯 Quick Check: Do You Need This?

**Open VSCode Settings** and look for any mention of "fortify":

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type: "Preferences: Open Settings (JSON)"
3. Press Enter
4. Search for "fortify" (`Ctrl+F` / `Cmd+F`)

**If you see results** → Continue with cleanup below  
**If no results found** → You're all set! ✅

## 🛠️ Cleanup Options

### Option 1: Automated Cleanup (Recommended)

**For Windows users - fastest and safest:**

```powershell
# Download and run our cleanup script
curl -L https://github.com/Nehonix-Team/cleanup.ps1 -o cleanup.ps1
powershell -ExecutionPolicy Bypass -File cleanup.ps1
```

**What it does:**
- ✅ Automatically backs up your settings
- ✅ Removes only Fortify-related entries
- ✅ Preserves all your custom settings
- ✅ Shows you exactly what was removed

### Option 2: Manual Cleanup (All Platforms)

**Step-by-step for any operating system:**

1. **Open Settings JSON** (see Quick Check steps above)

2. **Remove Fortify Lines** - Delete any lines containing:
   - `"fortify.colorTheme"`
   - `"type.fortify."`
   - `"keyword.fortify."`
   - `"operator.fortify."`
   - `"function.fortify."`
   - `"variable.fortify."`
   - `"enumMember.fortify."`
   - `"punctuation.fortify."`
   - `"number.fortify."`
   - `"string.fortify."`

3. **Clean Empty Sections** - If removing Fortify settings leaves empty blocks like this:
   ```json
   "editor.semanticTokenColorCustomizations": {
     "rules": {
       // Empty - remove this entire block
     }
   }
   ```

4. **Save and Restart** VSCode

### Option 3: Extension Command

**If you still have the extension installed:**

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type: `Fortify: Cleanup Themes and Settings`
3. Confirm the action
4. Restart VSCode

## ✅ How to Verify Success

After cleanup, search for "fortify" in your settings again:

- **✅ Success**: No results found
- **❌ Need more cleanup**: Still see fortify-related entries

**Your personal VSCode settings remain untouched** - only Fortify-specific entries are removed.

## 🆘 Troubleshooting

### "I'm nervous about editing settings manually"
**Solution**: Use the automated script (Option 1) or create a backup first:

**Windows:**
```powershell
copy "$env:APPDATA\Code\User\settings.json" "$env:APPDATA\Code\User\settings.json.backup"
```

**macOS/Linux:**
```bash
cp ~/.config/Code/User/settings.json ~/.config/Code/User/settings.json.backup
```

### "I accidentally removed too much"
**Solution**: Restore from your backup or reset specific settings:
1. Go to VSCode Settings UI (`Ctrl+,` / `Cmd+,`)
2. Search for the setting you want to restore
3. Click the gear icon → "Reset Setting"

### "I still see Fortify colors after cleanup"
**Solution**: Make sure you completely restarted VSCode (close all windows and reopen)

### "The script doesn't work on my system"
**Solution**: Use manual cleanup (Option 2) or contact support with your specific error message

## 🔮 This Won't Happen Again

**We've fixed this issue!** Future versions will:
- Ask permission before applying themes
- Offer cleanup options when uninstalling  
- Provide automatic cleanup commands
- Never leave orphaned settings

## 📞 Need Help?

- **GitHub Issues**: [Report problems](https://github.com/Nehonix-Team/issues)
- **Documentation**: [Full guide](../README.md)
- **Community**: [Ask questions](https://github.com/Nehonix-Team/discussions)

---

## Summary

1. **Check** if you have leftover settings (search for "fortify")
2. **Choose** your cleanup method (automated recommended)
3. **Run** cleanup and restart VSCode
4. **Verify** success (no more "fortify" in settings)

**This is a one-time fix** - future installations won't have this problem.

Thanks for your patience! 🙏