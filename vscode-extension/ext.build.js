import { spawn } from "child_process";
import { platform } from "os";

const isWindows = platform() === "win32";

// Helper function to run a command and return a promise
function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting: ${description}`);
    console.log("=".repeat(50));

    const child = spawn(command, args, { shell: isWindows });

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data);
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
async function buildExtension() {
  try {
    console.log("✨ Building extension...");

    // First command: vsce package
    await runCommand("vsce", ["package"], "Building VSCode extension package");

    // Second command: npm run push:ext (only runs if first succeeded)
    await runCommand("npm", ["run", "push:ext"], "Publishing extension");

    console.log("🎉 All commands completed successfully!");
  } catch (error) {
    console.error("💥 Build process failed:", error.message);
    process.exit(1);
  }
}

// Run the build process
buildExtension();
