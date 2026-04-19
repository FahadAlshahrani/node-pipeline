pipeline {
    agent any

    environment {
        APP_NAME = 'jenkins-pipeline-prac'
        NODE_ENV = 'test'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                echo "Installing dependencies for ${APP_NAME}..."
                sh "npm install"
            }
        }
        stage('Code Quality') {
            steps {
                echo "Checking code quality..."
                sh "npx eslint src/ --ext .js || true"
            }
        }
        stage('Test') {
            steps {
                echo "Running tests in ${NODE_ENV} mode..."
                sh "npm test"
            }
        }
        stage('Build') {
            steps {
                 echo "Build stage - in a real app this could be: npm run build"
                 sh 'echo Build complete for version $(node -e "console.log(require(./package.json).version)")'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline passed! Great job.'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above.'
        }
        always {
            echo 'Pipeline finished. This runs no matter what.'
        }
    }
}