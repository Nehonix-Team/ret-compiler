import { spawn } from "child_process";
import { platform } from "os";

const isWindows = platform() === "win32";

// function to run a command and return a promise
function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(` 👨‍🔧👨‍💻Starting: ${description}`);
    console.log("=".repeat(50));

    const child = spawn(command, args, {
      shell: isWindows,
      stdio: "inherit", // Direct terminal access preserves colors
    });

    child.on("error", (err) => {
      console.error(`Failed to start process: ${err.message}`);
      reject(err);
    });

    child.on("close", (code) => {
      console.log(`\n${description} exited with code ${code}`);
      if (code === 0) {
        console.log(`✅ ${description} completed successfully!`);
        resolve(code);
      } else {
        console.log(`❌ ${description} failed!`);
        reject(new Error(`${description} failed with exit code ${code}`));
      }
    });
  });
}

// Main execution
async function pushCommits() {
  try {
    console.log("✨ Pushing commits...");

    // First command: vsce package
    if (isWindows) {
      await runCommand(
        "npm",
        ["run", "git:ps1"],
        "Pushing commit to the repo."
      );
    } else {
      await runCommand("npm", ["run", "git:sh"], "Pushing commit to the repo.");
    }

    // // Second command: npm run push:ext (only runs if first succeeded)
    // await runCommand("npm", ["run", "push:ext"], "Publishing extension");

    console.log("🎉 All commands completed successfully!");
  } catch (error) {
    console.error("💥 Commits process failed:", error);
    process.exit(1);
  }
}

// Run the build process
pushCommits();
