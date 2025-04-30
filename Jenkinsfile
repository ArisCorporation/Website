// Jenkinsfile for KubeSphere DevOps - Nuxt 3 App
// Uses direct K8s variable injection via Pod Template (envFrom)
// Configured for GitHub Container Registry (ghcr.io)
// Agent defined at top level for better KubeSphere UI compatibility
// Added git installation and safe directory config to checkout stage
// Switched to npm ci and improved git hash retrieval logic

// Define global pipeline options
pipeline {
    // Define the primary agent for the pipeline using Kubernetes plugin
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:18-alpine # Use the desired Node.js version
    command:
    - cat
    tty: true
    envFrom:
    - configMapRef:
        name: ariscorp-devops-test-2-config # Your ConfigMap name
        optional: false
    - secretRef:
        name: ariscorp-devops-test-2 # Your Secret name
        optional: false
  # Add other necessary containers (e.g., docker, kubectl) or ensure the base image/Jenkins config provides them
'''
        }
    }

    // Environment variables used throughout the pipeline
    environment {
        NODE_VERSION = '18'
        APP_NAME = 'devops-test'
        DOCKER_REGISTRY = 'ghcr.io/ariscorporation'
        DOCKER_CREDENTIALS_ID = 'github'
        KUBERNETES_CREDENTIALS_ID = 'kubernetes-credentials'
        KUBERNETES_NAMESPACE = 'ariscorp-devops-test-2'
        KUBERNETES_DEPLOYMENT_FILE = 'kubernetes/deployment.yaml'
        KUBERNETES_SERVICE_FILE = 'kubernetes/service.yaml'
        IMAGE_TAG = ''
        DOCKER_IMAGE_NAME = ''
        DOCKER_IMAGE_LATEST = ''
    }

    // Define the stages of the pipeline
    stages {
        // Stage 1: Prepare Workspace & Get Commit Hash
        // Jenkins performs checkout before this stage automatically
        stage('Prepare Workspace & Get Commit Hash') {
            steps {
                // Steps run inside the 'node' container
                container('node') {
                    // Install git in the alpine container first
                    sh 'apk add --no-cache git'
                    // Add the workspace directory to git's safe directories
                    // Use ${WORKSPACE} which Jenkins provides, pointing to the checkout directory
                    sh 'git config --global --add safe.directory ${WORKSPACE}'

                    // Add debugging steps
                    sh 'echo "--- Listing workspace ---"'
                    sh 'ls -la'
                    sh 'echo "--- Checking .git directory ---"'
                    sh 'ls -la .git || echo ".git directory not found"' // Check if .git exists
                    sh 'echo "--- Git status ---"'
                    sh 'git status || echo "Failed to get git status"' // Check git status

                    // Get git commit hash (runs after Jenkins checkout)
                    script {
                        // Use returnStatus: true to get exit code and stdout
                        def commitHashResult = sh(script: 'git rev-parse --short HEAD', returnStatus: true, returnStdout: true)
                        echo "Git rev-parse status: ${commitHashResult.status}"
                        echo "Git rev-parse output: '${commitHashResult.stdout?.trim()}'" // Log the raw output

                        // Check if the command succeeded (status 0) and output is not empty
                        if (commitHashResult.status == 0 && commitHashResult.stdout?.trim()) {
                            env.IMAGE_TAG = commitHashResult.stdout.trim()
                            // Construct the full Docker image name
                            env.DOCKER_IMAGE_NAME = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.IMAGE_TAG}"
                            // Also tag with 'latest'
                            env.DOCKER_IMAGE_LATEST = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:latest"
                            echo "Using Git commit hash for image tag: ${env.IMAGE_TAG}"
                            echo "Full image name: ${env.DOCKER_IMAGE_NAME}"
                        } else {
                            // Provide a more detailed error message
                            error "Failed to get git commit hash. Status: ${commitHashResult.status}, Output: '${commitHashResult.stdout?.trim()}'"
                        }
                    }
                }
            }
        }

        // Stage 2: Setup, Install & Build
        // Uses the top-level Kubernetes agent (inherits injected env vars)
        stage('Setup, Install & Build') {
            steps {
                // Steps run inside the 'node' container defined in the top-level agent
                container('node') {
                    echo "Setting up Node.js ${env.NODE_VERSION} environment..."
                    sh 'node -v'
                    // Using npm ci (Clean Install) - Requires package-lock.json
                    // Ensure 'three' is listed as a dependency in your package.json
                    // and package-lock.json is committed to your repository.
                    echo "Running npm ci..."
                    sh 'npm ci --legacy-peer-deps'
                    echo "Dependencies installed."

                    echo "Building Nuxt 3 application for production..."
                    // All environment variables from the ConfigMap/Secret are available
                    echo "All variables from ConfigMap/Secret are available via envFrom."

                    // Standard build command
                    sh 'npm run build'

                    echo "Nuxt 3 application built successfully."
                    sh 'ls -la .output'
                }
            }
        }

        // Stage 3: Build & Push Docker Image
        stage('Build & Push Docker Image') {
            // Using agent any assumes a separate agent with Docker capabilities.
            // Remove this 'agent any' if your top-level K8s agent handles Docker.
            agent any
            steps {
                // Ensure IMAGE_TAG is set before proceeding
                script {
                    if (!env.IMAGE_TAG) {
                        error "IMAGE_TAG environment variable is not set. Cannot build Docker image."
                    }
                }
                echo "Building Docker image: ${env.DOCKER_IMAGE_NAME}"
                withCredentials([string(credentialsId: env.DOCKER_CREDENTIALS_ID, variable: 'DOCKER_HUB_PASSWORD'), usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD_UNUSED')]) {
                    sh "echo $DOCKER_HUB_PASSWORD | docker login ${env.DOCKER_REGISTRY} -u ${DOCKER_HUB_USERNAME} --password-stdin"
                }
                sh "docker build -t ${env.DOCKER_IMAGE_NAME} -t ${env.DOCKER_IMAGE_LATEST} ."
                echo "Pushing Docker image to ${env.DOCKER_REGISTRY}..."
                sh "docker push ${env.DOCKER_IMAGE_NAME}"
                sh "docker push ${env.DOCKER_IMAGE_LATEST}"
                echo "Docker image pushed successfully."
            }
            post {
                always {
                    echo "Logging out from Docker registry..."
                    sh "docker logout ${env.DOCKER_REGISTRY}"
                }
            }
        }

        // Stage 4: Deploy to Kubernetes
        stage('Deploy to Kubernetes') {
            // Using agent any assumes a separate agent with kubectl.
            // Remove this 'agent any' if your top-level K8s agent handles kubectl.
            agent any
            steps {
                 // Ensure IMAGE_TAG is set before proceeding
                script {
                    if (!env.IMAGE_TAG) {
                        error "IMAGE_TAG environment variable is not set. Cannot deploy."
                    }
                }
                echo "Deploying application to Kubernetes namespace: ${env.KUBERNETES_NAMESPACE}"
                withCredentials([kubeconfigContent(credentialsId: env.KUBERNETES_CREDENTIALS_ID, variable: 'KUBECONFIG_CONTENT')]) {
                    sh 'echo "$KUBECONFIG_CONTENT" > ./kubeconfig.yaml'
                    withEnv(['KUBECONFIG=./kubeconfig.yaml']) {
                        sh "sed -i 's|IMAGE_PLACEHOLDER|${env.DOCKER_IMAGE_NAME}|g' ${env.KUBERNETES_DEPLOYMENT_FILE}"
                        echo "Updated image in ${env.KUBERNETES_DEPLOYMENT_FILE} to ${env.DOCKER_IMAGE_NAME}"
                        sh "kubectl apply -f ${env.KUBERNETES_DEPLOYMENT_FILE} --namespace ${env.KUBERNETES_NAMESPACE}"
                        script {
                            if (fileExists(env.KUBERNETES_SERVICE_FILE)) {
                                echo "Applying Service: ${env.KUBERNETES_SERVICE_FILE}"
                                sh "kubectl apply -f ${env.KUBERNETES_SERVICE_FILE} --namespace ${env.KUBERNETES_NAMESPACE}"
                            } else {
                                echo "Service file ${env.KUBERNETES_SERVICE_FILE} not found, skipping."
                            }
                        }
                        echo "Waiting for deployment rollout to finish..."
                        sh "kubectl rollout status deployment/${env.APP_NAME} --namespace ${env.KUBERNETES_NAMESPACE} --timeout=300s"
                        echo "Deployment successful."
                    }
                }
            }
            post {
                always {
                    deleteDir()
                }
            }
        }
    }

    // Post-build actions
    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
