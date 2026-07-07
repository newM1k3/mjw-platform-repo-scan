<div align="center">

![MJW Design](https://mjwdesign.ca/wp-content/uploads/2024/01/mjw-design-logo.png)

**Built with [MJW Design](https://mjwdesign.ca) — AI-Powered Development**

---

</div>

# MJW Platform Repo Scan

A lightweight Netlify-hosted utility that provides a static dashboard interface backed by a serverless Netlify Function. The app delivers automated platform scanning or dashboard background update capabilities through a minimal, dependency-free frontend and a focused server-side function.

## Screenshots

| Dashboard View | Function Response State |
| :---- | :---- |
| ![MJW Platform Repo Scan dashboard interface — placeholder](screenshots/dashboard.png) | ![MJW Platform Repo Scan function response state — placeholder](screenshots/function-response.png) |

## What It Does

Unlike full application deployments, this utility is a focused single-purpose tool designed to run lightweight automation against the MJW platform. It exposes a static HTML interface served directly from the repository root and a Netlify Function that handles the core scan or background-update logic server-side.

| Layer | Purpose |
| :---- | :---- |
| **Static frontend** | `index.html` served from the repository root — no build step required. |
| **Netlify Function** | `update-dashboard-background.mjs` — server-side logic invoked via HTTP. |
| **Netlify deployment** | Zero-config publish from root; functions bundled with esbuild. |

**Key capabilities:**

- Serve a static dashboard directly from the repository root with no build pipeline.
- Invoke the `update-dashboard-background` Netlify Function to trigger server-side platform automation.
- Deploy instantly to Netlify with a single `netlify.toml` configuration file.
- Use esbuild bundling for fast, lightweight serverless function packaging.

## How to Use

Open the hosted dashboard URL to access the static interface. The page communicates with the `/.netlify/functions/update-dashboard-background` endpoint to trigger the relevant server-side operation. No login, build step, or local toolchain is required for end users — the full utility runs in the browser against the deployed Netlify Functions backend.

For local development and testing, the Netlify CLI (`netlify dev`) emulates both the static file serving and the Functions runtime locally before deploying.

## Stack

| Layer | Technology |
| :---- | :---- |
| Frontend | Static HTML (`index.html`) — no framework |
| Build tool | None — repository root served directly |
| Functions runtime | Netlify Functions (ESM `.mjs`) |
| Functions bundler | esbuild (via Netlify) |
| Hosting | Netlify |

## Local Development

Install the Netlify CLI if not already present, then start the local development server. This emulates both static file serving and the Functions runtime.

```bash
npm install -g netlify-cli

netlify dev
```

The static `index.html` and the `update-dashboard-background` function will both be available locally. The function is accessible at:

```
http://localhost:8888/.netlify/functions/update-dashboard-background
```

No environment variables are required to run the utility in a basic state. Add any API keys or secrets required by the function logic as Netlify environment variables before deploying to production.

## Available Scripts

```bash
netlify dev        # Start local dev server with Functions emulation (http://localhost:8888)
netlify deploy     # Deploy to a Netlify draft URL for preview
netlify deploy --prod  # Deploy to the production Netlify site
```

## Environment Variables

Environment variables are consumed exclusively inside the Netlify Function and are never exposed to the static frontend. Configure these in your Netlify site settings under **Site configuration → Environment variables**.

| Variable | Required? | Scope | Enables | Description |
| :---- | :---- | :---- | :---- | :---- |
| *(function-specific keys)* | Optional | Netlify Function/server only | Dashboard background update logic | Any API tokens or credentials required by `update-dashboard-background.mjs`. Set in Netlify dashboard; never commit to source. |

## Netlify Deployment

The `netlify.toml` at the project root configures static publishing from the repository root and registers the functions directory. No build command is needed.

| Setting | Value |
| :---- | :---- |
| Build command | *(none — static root publish)* |
| Publish directory | `.` (repository root) |
| Functions directory | `netlify/functions` |
| Functions bundler | esbuild |

```toml
[build]
  publish = "."
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
```

Connect the GitHub repository to a Netlify site and deploy directly. No environment variables are required for a baseline deployment. Add function-specific secrets afterwards via the Netlify dashboard before invoking the function in production.

## Project Structure

```
📄 index.html                              # Static dashboard frontend (served from root)
📄 netlify.toml                            # Netlify build + functions configuration
📄 .gitignore
📁 netlify/
  📁 functions/
    📄 update-dashboard-background.mjs     # Serverless function — core automation logic
📁 .netlify/                               # Netlify CLI local state (not committed to production)
  📁 functions/
    📄 manifest.json
    📄 update-dashboard-background.zip
  📄 netlify.toml
  📄 state.json
```

## Changelog

### v1.0.0 — Initial Deployment

- Added static `index.html` dashboard served directly from the repository root.
- Added `update-dashboard-background.mjs` Netlify Function with esbuild bundling.
- Configured `netlify.toml` for zero-build-step root publishing and functions registration.
- Added README with deployment instructions, project structure, and environment variable documentation.

---

Part of the **MJW Personal App Platform**.