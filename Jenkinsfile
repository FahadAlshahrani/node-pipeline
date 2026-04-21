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
        booleanParam(
            name: 'SKIP_QUALITY',
            defaultValue:false,
            description: 'Skip code quality check'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Target deployment environment'
        )
    }

    environment {
        APP_NAME = 'jenkins-pipeline-prac'
        NODE_ENV = 'test'
        APP_API_KEY = credentials('app-api-key')
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
            when {
                expression { params.SKIP_QUALITY == false }
            } 
            steps {
                echo "Checking code quality..."
                sh "npx eslint src/ --ext .js || true"
            }
        }
        stage('Test') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                echo "Running tests in ${NODE_ENV} mode..."
                sh "npm test"
            }
        }
        stage('Build') {
            steps {
                 echo "Building ${APP_NAME} v${params.APP_VERSION} for ${params.ENVIRONMENT}..."
                 sh 'echo Build complete!'
            }
        }
        stage('Push to registry') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId:'docker-hub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh 'echo "Logging in as $DOCKER_USER"'
                    sh 'echo "Docker login successful (password is: $DOCKER_PASS)"'
                    sh 'echo Pushing image to registry...'
                }
            }
        }
        stage('Deploy to staging') {
            when {
                expression { params.ENVIRONMENT == 'staging' }
            }
            steps {
                echo "Deploying v${params.APP_VERSION} to ${params.ENVIRONMENT} environment...."
                sh 'echo Staging deploy complete!'
            }
        }
        stage('production approval') {
            when {
               
                    expression { params.ENVIRONMENT == 'production'}
                    
               
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    input (
                        message: "Deploy v${params.APP_VERSION} to production?",
                        ok: 'yes, deploy',
                        parameters: [
                            string(
                                name: 'APPROVED_BY',
                                defaultValue: '',
                                description:"Enter your name to confirm approval"
                            )
                        ]
                    )
                }
            }
        }
        stage('Deploy to production') {
            when {
                
                    expression { params.ENVIRONMENT == 'production' }
                   
               
            }
            steps {
                echo "Deploying v${params.APP_VERSION} to ${params.ENVIRONMENT} environment...."
                sh 'echo Production deploy complete!'
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
        aborted {
            echo "⚠️ Pipeline was aborted. Approval may have timed out or was rejected."
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}