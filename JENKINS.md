# Running Playwright Tests in Jenkins

## Prerequisites

1. **Node.js Plugin**  
   Install the [Node.js Plugin](https://plugins.jenkins.io/nodejs/) in Jenkins:  
   **Manage Jenkins → Manage Plugins → Available** → search "Node.js" → Install.

2. **Node.js Tool**  
   Configure a Node.js installation:  
   **Manage Jenkins → Global Tool Configuration → Node.js** → Add "Node.js"  
   - Name: `Node.js` (must match `nodeJSInstallationName` in the Jenkinsfile)  
   - Install automatically: choose a recent LTS version (e.g. 20.x).

3. **Pipeline or Multibranch**  
   Use a Pipeline or Multibranch Pipeline job so the `Jenkinsfile` in the repo is used.

## Job Setup

1. **New Item** → **Pipeline** (or **Multibranch Pipeline**).
2. **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/subhasho/Playwright.git`
   - **Branch**: `*/master` (or your default branch)
3. **Script Path**: `Jenkinsfile` (default).
4. Save and run **Build Now**.

## What the Pipeline Does

| Stage | Action |
|-------|--------|
| Checkout | Clones the repo |
| Setup Node | Verifies Node/npm |
| Install Dependencies | `npm ci` |
| Install Playwright Browsers | Installs Chromium and system deps (Linux) |
| Run Playwright Tests | `npm run test` |

After each run:

- **Playwright Report** is published as an HTML report (link on the build page).
- **playwright-report/** and **test-results/** are archived as artifacts.

## Running Only One Test File

To run a single spec in Jenkins, add a pipeline parameter or change the Run stage:

```groovy
sh 'npx playwright test valid.spec.ts'
```

Or use a String parameter `SPEC_FILE` and run:

```groovy
sh "npx playwright test ${params.SPEC_FILE}"
```

## Different Node Tool Name

If your Node.js tool in Jenkins has another name (e.g. `NodeJS-20`), update the Jenkinsfile:

```groovy
nodejs(nodeJSInstallationName: 'NodeJS-20') {
  // ...
}
```

Replace every `'Node.js'` with your tool name.

## Linux vs Windows Agents

The pipeline uses `sh` (Unix). For a **Windows** agent, use `bat` instead of `sh` in each step, for example:

```groovy
bat 'npm ci'
bat 'npx playwright install --with-deps chromium'
bat 'npm run test'
```
