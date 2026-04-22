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
        stage('Set Build Info') {
            steps{
                script{
                    env.GIT_COMMIT_SHORT = sh(
                        script:'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.BUILD_LABEL = "${params.APP_VERSION}-${env.GIT_COMMIT_SHORT}"

                    echo "Build label: ${env.BUILD_LABEL}"
                    echo "Targeting environment: ${params.ENVIRONMENT}"

                    if(params.ENVIRONMENT == 'production') {
                        echo "⚠️ WARNING: This pipeline will deploy to PRODUCTION"
                    }
                }
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
                script{
                    try {
                        sh "npx eslint src/ --ext .js"
                        echo '✅ Code quality passed'
                    } catch(Exception e) {
                        echo "⚠️ Code quality issues found: ${e.message}"
                        currentBuild.results = 'UNSTABLE'
                    }
                    
                }
            }
        }
        stage('Test') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                script {
                    try {
                        sh "npm test"
                        echo '✅ All tests passed'
                    } catch (Exception e) {
                        echo "❌ Tests failed: ${e.message}"
                        currentBuild.result = 'FAILURE'
                        error "Stopping pipeline due to test failure"
                    }
                }
            }
        }
        stage('Build') {
            steps {
                echo "Building ${APP_NAME} with label ${env.BUILD_LABEL}..."
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
                    sh 'echo Pushing ${APP_NAME}:${BUILD_LABEL} to registry...'
                }
            }
        }
        
        stage('production approval') {
            when {
               
                    expression { params.ENVIRONMENT == 'production'}
                    
               
            }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    input (
                        message: "Deploy ${env.BUILD_LABEL} to PRODUCTION?",
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
        stage('Deploy to staging') {
            when {
                expression { params.ENVIRONMENT == 'staging' }
            }
            steps {
                echo "Deploying ${env.BUILD_LABEL} to STAGING..."
                sh 'echo Staging deploy complete!'
            }
        }
        stage('Deploy to production') {
            when {
                
                    expression { params.ENVIRONMENT == 'production' }
                   
               
            }
            steps {
                echo "Deploying ${env.BUILD_LABEL} to PRODUCTION..."
                sh 'echo Production deploy complete!'
            }
        }
    }

    post {
        success {
            echo "✅ ${APP_NAME} ${env.BUILD_LABEL} passed!"
        }
        failure {
            echo "❌ Pipeline failed for ${env.BUILD_LABEL}."
        }
        unstable {
            echo "⚠️ Pipeline unstable — check code quality warnings."
        }
        aborted {
            echo "⚠️ Pipeline aborted."
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}