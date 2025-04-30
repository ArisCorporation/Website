// Jenkinsfile for KubeSphere DevOps - Nuxt 3 App
// Uses direct K8s variable injection via Pod Template (envFrom)
// Configured for GitHub Container Registry (ghcr.io)
// Agent defined at top level for better KubeSphere UI compatibility
// Added git installation and safe directory config to checkout stage

// Define global pipeline options
pipeline {
    // Define the primary agent for the pipeline using Kubernetes plugin
    // This pod will have environment variables injected from ConfigMap and Secret
    agent {
        kubernetes {
            // Optional: Specify a cloud configuration if needed
            // cloud 'kubernetes'
            // Define the pod template
            // Removed dynamic label for better UI compatibility
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
  # Example for Docker-outside-of-Docker (DooD) if configured:
  # volumes:
  # - name: docker-sock
  #   hostPath:
  #     path: /var/run/docker.sock
  # containers:
  # - name: node
  #   ... # (as above)
  # - name: docker # Add docker client if needed and not in base image
  #   image: docker:latest
  #   command: ['cat']
  #   tty: true
  #   volumeMounts:
  #   - name: docker-sock
  #     mountPath: /var/run/docker.sock
'''
        }
    }

    // Environment variables used throughout the pipeline
    environment {
        // Node.js version (should match agent image if possible)
        NODE_VERSION = '18'
        // Name of your application
        APP_NAME = 'devops-test'
        // Docker registry URL
        DOCKER_REGISTRY = 'ghcr.io/ariscorporation'
        // Credentials ID for your Docker registry (GHCR)
        DOCKER_CREDENTIALS_ID = 'github'
        // Credentials ID for your Kubernetes cluster
        KUBERNETES_CREDENTIALS_ID = 'kubernetes-credentials'
        // Target Kubernetes namespace
        KUBERNETES_NAMESPACE = 'ariscorp-devops-test-2'
        // Path to your Kubernetes deployment manifest file
        KUBERNETES_DEPLOYMENT_FILE = 'kubernetes/deployment.yaml'
        // Path to your Kubernetes service manifest file (optional)
        KUBERNETES_SERVICE_FILE = 'kubernetes/service.yaml'

        // Dynamically set image tag and name later
        IMAGE_TAG = ''
        DOCKER_IMAGE_NAME = ''
        DOCKER_IMAGE_LATEST = ''
    }

    // Define the stages of the pipeline
    stages {
        // Stage 1: Checkout Source Code
        // Uses the top-level Kubernetes agent
        stage('Checkout') {
            steps {
                // Checkout runs inside the 'node' container by default if it's the first defined
                container('node') {
                    // Install git in the alpine container first
                    sh 'apk add --no-cache git'
                    // Add the workspace directory to git's safe directories
                    // Use ${WORKSPACE} which Jenkins provides, pointing to the checkout directory
                    sh 'git config --global --add safe.directory ${WORKSPACE}'
                    // Now checkout and other git commands should work
                    cleanWs()
                    checkout scm
                    // Get git commit hash
                    script {
                        // Get the short Git commit hash
                        env.IMAGE_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        // Construct the full Docker image name
                        env.DOCKER_IMAGE_NAME = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.IMAGE_TAG}"
                        // Also tag with 'latest'
                        env.DOCKER_IMAGE_LATEST = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:latest"
                    }
                    echo "Code checked out. Image tag will be: ${env.IMAGE_TAG}"
                    echo "Full image name: ${env.DOCKER_IMAGE_NAME}"
                }
            }
        }

        // Stage 2: Setup & Install Dependencies (and Build)
        // Uses the top-level Kubernetes agent (inherits injected env vars)
        stage('Setup, Install & Build') {
            steps {
                // Steps run inside the 'node' container defined in the top-level agent
                container('node') {
                    echo "Setting up Node.js ${env.NODE_VERSION} environment..."
                    sh 'node -v'
                    // Using npm:
                    sh 'npm install --legacy-peer-deps'
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
        // This stage needs docker commands.
        // Option A: If the top-level agent pod is configured with Docker access (e.g., DooD)
        // Option B: Use a different agent specifically for Docker builds
        stage('Build & Push Docker Image') {
            // Using agent any assumes a separate agent with Docker capabilities.
            // Remove this 'agent any' if your top-level K8s agent handles Docker.
            agent any
            steps {
                echo "Building Docker image: ${env.DOCKER_IMAGE_NAME}"
                // Docker login uses credentials stored in Jenkins/KubeSphere
                withCredentials([string(credentialsId: env.DOCKER_CREDENTIALS_ID, variable: 'DOCKER_HUB_PASSWORD'), usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD_UNUSED')]) {
                    // Login to GHCR
                    sh "echo $DOCKER_HUB_PASSWORD | docker login ${env.DOCKER_REGISTRY} -u ${DOCKER_HUB_USERNAME} --password-stdin"
                }
                // Build the image
                sh "docker build -t ${env.DOCKER_IMAGE_NAME} -t ${env.DOCKER_IMAGE_LATEST} ."
                echo "Pushing Docker image to ${env.DOCKER_REGISTRY}..."
                // Push the images
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
        // This stage needs kubectl commands.
        // Option A: If the top-level agent pod has kubectl
        // Option B: Use a different agent
        stage('Deploy to Kubernetes') {
            // Using agent any assumes a separate agent with kubectl.
            // Remove this 'agent any' if your top-level K8s agent handles kubectl.
            agent any
            steps {
                echo "Deploying application to Kubernetes namespace: ${env.KUBERNETES_NAMESPACE}"
                // Use Kubernetes credentials configured in KubeSphere/Jenkins
                withCredentials([kubeconfigContent(credentialsId: env.KUBERNETES_CREDENTIALS_ID, variable: 'KUBECONFIG_CONTENT')]) {
                    // Write the kubeconfig content to a temporary file
                    sh 'echo "$KUBECONFIG_CONTENT" > ./kubeconfig.yaml'
                    // Set KUBECONFIG environment variable for kubectl
                    withEnv(['KUBECONFIG=./kubeconfig.yaml']) {
                        // Update image placeholder in deployment manifest
                        sh "sed -i 's|IMAGE_PLACEHOLDER|${env.DOCKER_IMAGE_NAME}|g' ${env.KUBERNETES_DEPLOYMENT_FILE}"
                        echo "Updated image in ${env.KUBERNETES_DEPLOYMENT_FILE} to ${env.DOCKER_IMAGE_NAME}"

                        // Apply manifests
                        echo "Applying Deployment: ${env.KUBERNETES_DEPLOYMENT_FILE}"
                        sh "kubectl apply -f ${env.KUBERNETES_DEPLOYMENT_FILE} --namespace ${env.KUBERNETES_NAMESPACE}"
                        script {
                            if (fileExists(env.KUBERNETES_SERVICE_FILE)) {
                                echo "Applying Service: ${env.KUBERNETES_SERVICE_FILE}"
                                sh "kubectl apply -f ${env.KUBERNETES_SERVICE_FILE} --namespace ${env.KUBERNETES_NAMESPACE}"
                            } else {
                                echo "Service file ${env.KUBERNETES_SERVICE_FILE} not found, skipping."
                            }
                        }

                        // Wait for rollout
                        echo "Waiting for deployment rollout to finish..."
                        sh "kubectl rollout status deployment/${env.APP_NAME} --namespace ${env.KUBERNETES_NAMESPACE} --timeout=300s"
                        echo "Deployment successful."
                    }
                }
            }
            post {
                always {
                    // Clean up workspace including kubeconfig.yaml
                    deleteDir()
                }
            }
        }
    }

    // Post-build actions
    post {
        always {
            echo 'Pipeline finished.'
            // cleanWs() // Clean workspace might need to run on the specific agent if stages used different ones
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
