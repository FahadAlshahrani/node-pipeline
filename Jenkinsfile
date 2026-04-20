pipeline {
    agent any

    parameters {

        string(
            name: 'APP_VERSION',
            defaultValue: '1.0.0',
            description: 'Version number to build'
        )
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run test suite'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production']
            description: 'Target deployment environment'
        )
    }

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
                echo "Installing dependencies for ${APP_NAME} v${params.APP_VERSION}..."
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
                 echo "Building ${APP_NAME} v${params.APP_VERSION} for ${params.ENVIRONMENT}..."
                 sh 'echo Build complete for version $(node -e "console.log(require(./package.json).version)")'
            }
        }
        stage('Deploy') {
            steps {
                echo "Deploying v${params.APP_VERSION} to ${params.ENVIRONMENT} environment...."
                sh 'echo Deploying now...'
            }
        }
    }

    post {
        success {
            echo "✅ ${APP_NAME} v${params.APP_VERSION} deployed to ${params.ENVIRONMENT} successfully!"
        }
        failure {
            echo "❌ Pipeline failed for v${params.APP_VERSION} targeting ${params.ENVIRONMENT}."
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}