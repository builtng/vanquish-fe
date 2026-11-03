import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import ReactDOMServer from "react-dom/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function loadComponent(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const compiled = ts.transpileModule(code, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;

  const mockRequire = (id) => {
    if (id === "react") return React;
    if (id === "react/jsx-runtime") return jsxRuntime;
    if (id === "next/link") {
      return {
        __esModule: true,
        default: ({ href, children, ...props }) =>
          React.createElement("a", { href, ...props }, children),
      };
    }
    if (id === "next/navigation") {
      return {
        __esModule: true,
        useParams: () => ({ id: "101" }),
        useRouter: () => ({ push: () => {} }),
      };
    }
    if (id === "react-toastify") {
      return { __esModule: true, toast: { error: () => {} } };
    }
    if (id === "@/components/DashboardLayout") {
      return {
        __esModule: true,
        default: ({ children }) => React.createElement("div", { id: "layout" }, children),
      };
    }
    if (id === "@/components/DashboardHeader") {
      return {
        __esModule: true,
        default: ({ title, subtitle }) =>
          React.createElement("header", {}, React.createElement("h1", {}, title)),
      };
    }
    if (id === "@/components/PageGuard") {
      return {
        __esModule: true,
        default: ({ children }) => React.createElement("div", { id: "guard" }, children),
      };
    }
    if (id === "@/lib/api") {
      return {
        __esModule: true,
        default: {
          get: async () => ({}),
          getStorageUrl: (p) => (p ? `https://storage.test/${p}` : null),
        },
      };
    }
    if (id === "lucide-react") {
      return new Proxy(
        {},
        {
          get: (_, prop) => (props) =>
            React.createElement("svg", { "data-icon": prop }),
        }
      );
    }
    return {};
  };

  const moduleObj = { exports: {} };
  const fn = new Function("require", "module", "exports", compiled);
  fn(mockRequire, moduleObj, moduleObj.exports);
  return moduleObj.exports;
}

test("QC Application Detail: resolveApplicationData supports direct object and wrapped responses", () => {
  const detailPagePath = path.join(
    rootDir,
    "app/dashboard/qualified-applications/[id]/page.jsx"
  );
  const { resolveApplicationData } = loadComponent(detailPagePath);

  const directResponse = {
    id: 101,
    name: "Dr. Jane Smith",
    email: "jane.smith@example.com",
    phone: "07123456789",
    status: "New Application",
  };

  // Direct response (no .data property)
  const resolvedDirect = resolveApplicationData(directResponse);
  assert.equal(resolvedDirect, directResponse);
  assert.equal(resolvedDirect.name, "Dr. Jane Smith");

  // Wrapped response ({ data: ... })
  const wrappedResponse = { data: directResponse };
  const resolvedWrapped = resolveApplicationData(wrappedResponse);
  assert.equal(resolvedWrapped, directResponse);
  assert.equal(resolvedWrapped.name, "Dr. Jane Smith");

  // Null response
  assert.equal(resolveApplicationData(null), null);
});

test("QC Application Detail: Renders the page with a direct object response without showing 'Application not found'", () => {
  const detailPagePath = path.join(
    rootDir,
    "app/dashboard/qualified-applications/[id]/page.jsx"
  );
  const { default: QualifiedApplicationDetailPage, QualifiedApplicationDetailView } =
    loadComponent(detailPagePath);

  const directApp = {
    id: 101,
    name: "Dr. Jane Smith",
    email: "jane.smith@example.com",
    phone: "07123456789",
    status: "New Application",
    previous_vanquish_work: "Yes, as a placement counsellor in 2024",
    areas_to_improve: "Developing deeper expertise in perinatal mental health",
    answers: {
      registered_address: "123 High Street",
      registered_city: "London",
      registered_postcode: "SW1A 1AA",
      modalities: ["Integrative", "Person Centred"],
      experience_areas: ["Anxiety", "Depression"],
    },
  };

  // 1. Render QualifiedApplicationDetailView with direct object
  const viewHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(QualifiedApplicationDetailView, { app: directApp })
  );

  assert.ok(
    viewHtml.includes("Dr. Jane Smith"),
    "Rendered view must display applicant name"
  );
  assert.ok(
    viewHtml.includes("QC-APP-0101"),
    "Rendered view must display formatted application reference"
  );
  assert.ok(
    viewHtml.includes("jane.smith@example.com"),
    "Rendered view must display applicant email"
  );
  assert.ok(
    viewHtml.includes("Yes, as a placement counsellor in 2024"),
    "Rendered view must display previously worked details"
  );
  assert.ok(
    viewHtml.includes("Developing deeper expertise in perinatal mental health"),
    "Rendered view must display areas to improve"
  );
  assert.ok(
    !viewHtml.includes("Application not found"),
    "Rendered view must not show 'Application not found' with direct object response"
  );

  // 2. Render QualifiedApplicationDetailPage with direct object
  const pageHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(QualifiedApplicationDetailPage, { initialApp: directApp })
  );

  assert.ok(
    pageHtml.includes("Dr. Jane Smith"),
    "Rendered page must display applicant name"
  );
  assert.ok(
    pageHtml.includes("QC-APP-0101"),
    "Rendered page must display formatted application reference"
  );
  assert.ok(
    !pageHtml.includes("Application not found"),
    "Rendered page must not show 'Application not found' with direct object response"
  );

  // 3. When app is missing/null, renders 'Application not found'
  const notFoundHtml = ReactDOMServer.renderToStaticMarkup(
    React.createElement(QualifiedApplicationDetailView, { app: null })
  );
  assert.ok(
    notFoundHtml.includes("Application not found"),
    "Rendered view must show 'Application not found' when app is null"
  );
});

test("QC Applications List: View button links directly to /dashboard/qualified-applications/${app.id}", () => {
  const listPagePath = path.join(
    rootDir,
    "app/dashboard/qualified-applications/page.jsx"
  );
  const content = fs.readFileSync(listPagePath, "utf8");

  // Check that the View button is a Link to /dashboard/qualified-applications/${app.id}
  assert.match(
    content,
    /<Link\s+href=\{`\/dashboard\/qualified-applications\/\$\{app\.id\}`\}[^>]*>\s*View\s*<\/Link>/,
    "List page View button must link to /dashboard/qualified-applications/${app.id}"
  );
});

test("QC Application Detail: shows the same journey stages and Next Stage button as the trainee page", () => {
  const { QualifiedApplicationDetailView } = loadComponent(
    path.join(rootDir, "app/dashboard/qualified-applications/[id]/page.jsx")
  );

  const render = (status) =>
    ReactDOMServer.renderToStaticMarkup(
      React.createElement(QualifiedApplicationDetailView, {
        app: { id: 7, name: "Jane Doe", email: "jane@example.com", status },
      })
    );

  const html = render("Interview Attended");
  assert.ok(html.includes("Qualified Counsellor Journey"));
  for (const label of [
    "Application",
    "Assessment",
    "Interview Booked",
    "Interview Attended",
    "Accepted",
    "Onboarding",
    "Active Placement",
  ]) {
    assert.ok(html.includes(`>${label}</p>`), `Journey must show the ${label} stage`);
  }
  assert.ok(html.includes("Next Stage: Accepted"));
  assert.ok(html.includes("width:57.14285714285714%"), "Progress line must reach the current stage");

  assert.ok(render("Submitted").includes("Next Stage: Stage 1 Complete"));
  assert.ok(!render("Active Placement").includes("Next Stage:"));
  assert.ok(render("Rejected").includes("width:0%"));
});

test("QC Application Detail: offers Grant Portal Access from acceptance onwards, like trainee applications", () => {
  const { QualifiedApplicationDetailView } = loadComponent(
    path.join(rootDir, "app/dashboard/qualified-applications/[id]/page.jsx")
  );
  const render = (app) =>
    ReactDOMServer.renderToStaticMarkup(
      React.createElement(QualifiedApplicationDetailView, {
        app: { id: 9, name: "Ross Geller", email: "ross@example.com", ...app },
      })
    );

  assert.ok(!render({ status: "Interview Attended" }).includes("Grant Portal Access"));

  const accepted = render({ status: "Induction Attended" });
  assert.ok(accepted.includes("Grant Portal Access"));
  assert.ok(accepted.includes("Finalize: Make Active Placement"));

  const granted = render({
    status: "Onboarding",
    onboarding_data: { portal_access_granted: true, portal_invite_sent_at: "2026-11-03T10:00:00Z" },
  });
  assert.ok(granted.includes("Portal Access Granted"));
  assert.ok(!granted.includes("Grant Portal Access</button>"));
});

test("Admin Users: role picker offers Trainee Counsellor and Qualified Counsellor", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/dashboard/users/page.jsx"), "utf8");
  assert.ok(content.includes("{ value: 'trainee_counsellor', label: 'Trainee Counsellor' }"));
  assert.ok(content.includes("{ value: 'qualified_counsellor', label: 'Qualified Counsellor' }"));
  assert.ok(content.includes("role: user.role_choice || user.role"), "Editing must preselect the counsellor type");
});

test("API: QC portal invite and finalise endpoints are wired", () => {
  const content = fs.readFileSync(path.join(rootDir, "lib/api.js"), "utf8");
  assert.ok(content.includes("/qc-applications/${id}/portal-invite"));
  assert.ok(content.includes("/qc-applications/${id}/finalize"));
});
