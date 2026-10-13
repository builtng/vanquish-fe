import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function getCommitHash() {
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA) {
    return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD", { cwd: rootDir })
      .toString()
      .trim()
      .slice(0, 7);
  } catch {
    return "";
  }
}

const buildHash = getCommitHash();
const buildDate = new Date().toISOString().slice(0, 10);
const buildIdentifier = buildHash ? `Build ${buildDate} ${buildHash}` : "Build unknown";

const envFilePath = path.join(rootDir, ".env.production.local");
let content = "";
if (fs.existsSync(envFilePath)) {
  content = fs.readFileSync(envFilePath, "utf8");
  if (content.includes("NEXT_PUBLIC_BUILD_IDENTIFIER=")) {
    content = content.replace(
      /NEXT_PUBLIC_BUILD_IDENTIFIER=.*/g,
      `NEXT_PUBLIC_BUILD_IDENTIFIER="${buildIdentifier}"`
    );
  } else {
    content += `\nNEXT_PUBLIC_BUILD_IDENTIFIER="${buildIdentifier}"\n`;
  }
} else {
  content = `NEXT_PUBLIC_BUILD_IDENTIFIER="${buildIdentifier}"\n`;
}

fs.writeFileSync(envFilePath, content, "utf8");

// Also update .env.local if present or create it
const envLocalPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envLocalPath)) {
  let localContent = fs.readFileSync(envLocalPath, "utf8");
  if (localContent.includes("NEXT_PUBLIC_BUILD_IDENTIFIER=")) {
    localContent = localContent.replace(
      /NEXT_PUBLIC_BUILD_IDENTIFIER=.*/g,
      `NEXT_PUBLIC_BUILD_IDENTIFIER="${buildIdentifier}"`
    );
  } else {
    localContent += `\nNEXT_PUBLIC_BUILD_IDENTIFIER="${buildIdentifier}"\n`;
  }
  fs.writeFileSync(envLocalPath, localContent, "utf8");
}

console.log(`Generated build identifier: ${buildIdentifier}`);
