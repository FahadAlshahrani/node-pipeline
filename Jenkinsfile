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
        stage('Quality Gates') {
            when {
                expression { params.RUN_TESTS == true || params.SKIP_QUALITY == false }
            }
            failFast true
            parallel {
                stage('Lint') {
                    when {
                        expression { params.SKIP_QUALITY == false }
                    }
                    steps {
                        script {
                            try {
                                sh 'npm run lint'
                                echo '✅ Lint passed'
                            } catch (Exception e) {
                                echo "⚠️ Lint issues found"
                                currentBuild.results = 'UNSTABLE'
                            }
                        }
                    }
                }
                stage('Unit Test') {
                    when {
                        expression {params.RUN_TESTS == true}
                    }
                    steps {
                        script {
                            try {
                                sh 'npm run test:unit'
                                echo '✅ Unit tests passed'
                            } catch (Exception e) {
                                echo "❌ Unit tests failed"
                                currentBuild.result = 'FAILURE'
                                error "Unit tests failed"
                            }
                        }
                    }
                }
                stage('Integration Tests') {
                    when {
                        allOf {
                            expression { params.RUN_TESTS == true }
                            expression { params.ENVIRONMENT != 'dev'}
                        }
                    }
                    steps {
                        script {
                            try {
                                sh 'npm run test:integration'
                                echo '✅ Integration tests passed'
                            } catch (Exception e) {
                                echo "❌ Integration tests failed"
                                currentBuild.result = 'FAILURE'
                                error "Integration tests failed"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                echo "Building ${APP_NAME} with label ${env.BUILD_LABEL}..."
                sh 'npm run build'

                stash(
                    name: 'built-app',
                    includes:'dist/**, package.json'
                )
                echo "✅ Build artifacts stashed"
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
                unstash('built-app')
                echo "Deploying ${env.BUILD_LABEL} to STAGING..."
                sh 'ls -la dist/'
                sh 'cat dist/build-info.json'
                sh 'echo Staging deploy complete!'
            }
        }
        stage('Deploy to production') {
            when {
                
                    expression { params.ENVIRONMENT == 'production' }
                   
               
            }
            steps {
                unstash 'built-app'
                echo "Deploying ${env.BUILD_LABEL} to PRODUCTION..."
                sh 'ls -la dist/'
                sh 'cat dist/build-info.json'
                sh 'echo Production deploy complete!'
            }
        }
        stage('Archive Artifacts') {
            steps {
                archiveArtifacts(
                    artifacts: 'dist/**',
                    fingerprint: true
                )
                echo "✅ Artifacts archived to Jenkins"
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