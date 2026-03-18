// Jenkins Pipeline for Playwright tests
// Works on both Windows (bat) and Linux (sh) agents.

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
        script {
          if (isUnix()) {
            sh 'node --version'
            sh 'npm --version'
          } else {
            bat 'node --version'
            bat 'npm --version'
          }
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Install Playwright Browsers') {
      steps {
        script {
          if (isUnix()) {
            sh 'npx playwright install --with-deps chromium'
          } else {
            bat 'npx playwright install --with-deps chromium'
          }
        }
      }
    }

    stage('Run Playwright Tests') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run test'
          } else {
            bat 'npm run test'
          }
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
