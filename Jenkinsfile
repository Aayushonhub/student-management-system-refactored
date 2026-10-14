pipeline {
    agent any

    stages {
        stage('Checkout Verification') {
            steps {
                echo 'Jenkins successfully checked out the GitHub repository.'
                sh 'pwd'
                sh 'ls -la'
            }
        }

        stage('Validate Project') {
            steps {
                sh 'test -f index.html'
                sh 'test -f Dockerfile'
                sh 'test -d js'
                echo 'All required project files exist.'
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}