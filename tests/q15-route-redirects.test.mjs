import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("FIX Q15: next.config.js must not exist alongside next.config.mjs", () => {
  const nextConfigJsPath = path.join(rootDir, "next.config.js");
  const nextConfigMjsPath = path.join(rootDir, "next.config.mjs");

  assert.ok(
    fs.existsSync(nextConfigMjsPath),
    "next.config.mjs must exist as the primary configuration file"
  );
  assert.ok(
    !fs.existsSync(nextConfigJsPath),
    "next.config.js must NOT exist alongside next.config.mjs (causes Next.js to ignore redirects in next.config.mjs)"
  );
});

test("FIX Q15: Permanent redirects in next.config.mjs and deleted page folders", async () => {
  const nextConfigModule = await import(path.join(rootDir, "next.config.mjs"));
  const nextConfig = nextConfigModule.default;

  assert.ok(typeof nextConfig.redirects === "function", "next.config.mjs must define redirects()");
  const redirects = await nextConfig.redirects();

  const requiredRedirects = [
    { source: "/coaching", destination: "/mid-range-intake?service=coaching", permanent: true },
    { source: "/clform", destination: "/low-cost-intake", permanent: true },
    { source: "/tcform", destination: "/counsellor", permanent: true },
    { source: "/trainee-application", destination: "/counsellor", permanent: true },
    { source: "/ish", destination: "/mid-range-intake?service=coaching", permanent: true },
    { source: "/low-cost", destination: "/low-cost-intake", permanent: true },
  ];

  for (const req of requiredRedirects) {
    const found = redirects.find((r) => r.source === req.source);
    assert.ok(found, `Redirect for ${req.source} must exist in next.config.mjs`);
    assert.equal(
      found.destination,
      req.destination,
      `Redirect for ${req.source} must point to ${req.destination}`
    );
    assert.equal(found.permanent, true, `Redirect for ${req.source} must be permanent (308)`);
  }

  // /therapy-form must NOT be in redirects so it serves 200
  const therapyRedirect = redirects.find((r) => r.source === "/therapy-form");
  assert.ok(!therapyRedirect, "/therapy-form must not be redirected so it returns 200");
  assert.ok(
    fs.existsSync(path.join(rootDir, "app/therapy-form/page.jsx")),
    "app/therapy-form/page.jsx must exist to return 200"
  );

  // Verify the four page folders are deleted
  const deletedFolders = [
    "app/coaching",
    "app/clform",
    "app/tcform",
    "app/trainee-application",
  ];

  for (const folder of deletedFolders) {
    assert.ok(
      !fs.existsSync(path.join(rootDir, folder)),
      `Folder ${folder} must be deleted`
    );
  }
});

test("FIX Q15: No link in app/ points to the four removed addresses", () => {
  const appDir = path.join(rootDir, "app");
  const removedAddresses = ["/coaching", "/clform", "/tcform", "/trainee-application"];

  function scanDir(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(scanDir(fullPath));
      } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const files = scanDir(appDir);

  for (const file of files) {
    const relPath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, "utf8");

    for (const address of removedAddresses) {
      // Check href="...", href='...', redirect("..."), redirect('...')
      const hrefRegex = new RegExp(`href=["']${address}["']`, "g");
      const redirectRegex = new RegExp(`redirect\\(["']${address}["']\\)`, "g");
      const routerRegex = new RegExp(`router\\.push\\(["']${address}["']\\)`, "g");

      assert.ok(
        !hrefRegex.test(content),
        `File ${relPath} contains href link pointing to removed address ${address}`
      );
      assert.ok(
        !redirectRegex.test(content),
        `File ${relPath} contains redirect pointing to removed address ${address}`
      );
      assert.ok(
        !routerRegex.test(content),
        `File ${relPath} contains router.push pointing to removed address ${address}`
      );
    }
  }
});

test("FIX Q15: sitemap.js removes redirected addresses and therapy-form", async () => {
  const sitemapModule = await import(path.join(rootDir, "app/sitemap.js"));
  const sitemapFn = sitemapModule.default;
  const entries = sitemapFn();

  const urls = entries.map((e) => e.url);

  for (const url of urls) {
    assert.ok(!url.endsWith("/clform"), `sitemap.js must not include /clform: ${url}`);
    assert.ok(!url.endsWith("/tcform"), `sitemap.js must not include /tcform: ${url}`);
    assert.ok(!url.endsWith("/coaching"), `sitemap.js must not include /coaching: ${url}`);
    assert.ok(!url.endsWith("/trainee-application"), `sitemap.js must not include /trainee-application: ${url}`);
    assert.ok(!url.endsWith("/therapy-form"), `sitemap.js must not include /therapy-form: ${url}`);
  }
});

test("FIX Q15: Admin Trainee Applications 'View Public Form' button points to /counsellor", () => {
  const pagePath = path.join(rootDir, "app/dashboard/trainee-applications/page.jsx");
  const content = fs.readFileSync(pagePath, "utf8");

  assert.ok(
    content.includes('href="/counsellor"'),
    "View Public Form button must point to /counsellor"
  );
  assert.ok(
    !content.includes('href="/trainee-application"'),
    "View Public Form button must not point to /trainee-application"
  );
});
