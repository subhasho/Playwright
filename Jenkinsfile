// Jenkins Pipeline for Playwright tests
// Uses node/npm from the agent's PATH (no Node.js plugin required).
// On Windows agents, change "sh" to "bat" in each step.

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
        sh 'node --version'
        sh 'npm --version'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Install Playwright Browsers') {
      steps {
        sh 'npx playwright install --with-deps chromium'
      }
    }

    stage('Run Playwright Tests') {
      steps {
        sh 'npm run test'
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
