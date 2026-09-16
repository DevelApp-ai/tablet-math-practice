# Security Policy

## Supported Versions

Only the latest release on `main` receives security fixes. We do not backport fixes to older versions.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| other   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, use [private vulnerability reporting](https://github.com/DevelApp-ai/tablet-math-practice/security/advisories/new) for this repository, so the report reaches the maintainers directly and disclosure can be coordinated.

Please include as much of the following as you can:

- The type of issue (e.g. cross-site scripting, injection, unsafe dependency)
- The affected file(s) and their location (branch/commit or URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions or a proof of concept
- The impact, including how an attacker might exploit it

We aim to acknowledge reports within a few days and will keep you informed while a fix is prepared.

## Project-Specific Considerations

This is a **client-side only** learning app for children:

- There is no backend. Practice data (profiles, streaks, badges, stats) is stored in the browser's `localStorage` and never leaves the device.
- No personal data is collected; the app contains no analytics, ads, or third-party tracking.
- The app is deployed as a static site on GitHub Pages. Reports about the GitHub Pages platform itself are out of scope.
- Vulnerabilities in third-party dependencies are in scope and will be assessed for a pinned upgrade or mitigation.
