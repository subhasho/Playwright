// Jenkins Pipeline for Playwright tests
// Require: Node.js plugin + a tool named "Node.js" in Jenkins (Manage Jenkins → Tools).
// Or replace nodeJSInstallationName with your configured Node.js tool name.

pipeline {
  agent any

  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup Node') {
      steps {
        nodejs(nodeJSInstallationName: 'Node.js') {
          sh 'node --version'
          sh 'npm --version'
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        nodejs(nodeJSInstallationName: 'Node.js') {
          sh 'npm ci'
        }
      }
    }

    stage('Install Playwright Browsers') {
      steps {
        nodejs(nodeJSInstallationName: 'Node.js') {
          // Chromium only for faster CI; use 'npx playwright install --with-deps' for all browsers
          sh 'npx playwright install --with-deps chromium'
        }
      }
    }

    stage('Run Playwright Tests') {
      steps {
        nodejs(nodeJSInstallationName: 'Node.js') {
          sh 'npm run test'
        }
      }
      post {
        always {
          publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Report',
            reportTitles: ''
          ])
          archiveArtifacts(
            artifacts: 'playwright-report/**',
            allowEmptyArchive: true
          )
          archiveArtifacts(
            artifacts: 'test-results/**',
            allowEmptyArchive: true
          )
        }
      }
    }
  }

  post {
    always {
      cleanWs(deleteDirs: true, patterns: [[pattern: 'node_modules', type: 'INCLUDE']])
    }
  }
}
