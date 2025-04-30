// Jenkinsfile for KubeSphere DevOps - Nuxt 3 App
// Uses direct K8s variable injection via Pod Template (envFrom)
// Configured for GitHub Container Registry (ghcr.io)
// Agent defined at top level for better KubeSphere UI compatibility
// Installs git, docker-cli, kubectl in agent; Mounts docker socket.
// Uses temp file for commit hash propagation.

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
    # Mount the host's Docker socket to enable Docker-outside-of-Docker
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  # Define the volume pointing to the host's Docker socket
  volumes:
  - hostPath:
      path: /var/run/docker.sock
      # type: Socket # Type check removed for compatibility, ensure path is correct on node
    name: docker-sock
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
        // Initialize image vars - will be set in the first stage
        // Note: These might not reflect the final value if viewed outside the pipeline run itself
        IMAGE_TAG = ''
        DOCKER_IMAGE_NAME = ''
        DOCKER_IMAGE_LATEST = ''
    }

    // Define the stages of the pipeline
    stages {
        // Stage 1: Prepare Workspace, Install Tools & Get Commit Hash
        // Jenkins performs checkout before this stage automatically
        stage('Prepare Workspace, Install Tools & Get Commit Hash') {
            steps {
                // Steps run inside the 'node' container
                container('node') {
                    // Install required tools (git, docker client, kubectl)
                    sh 'apk update && apk add --no-cache git docker-cli kubectl'
                    // Add the workspace directory to git's safe directories
                    sh 'git config --global --add safe.directory ${WORKSPACE}'

                    // Add debugging steps
                    sh 'echo "--- Listing workspace ---"'
                    sh 'ls -la'
                    sh 'echo "--- Checking .git directory ---"'
                    sh 'ls -la .git || echo ".git directory not found"' // Check if .git exists
                    sh 'echo "--- Git status ---"'
                    sh 'git status || echo "Failed to get git status"' // Check git status

                    // Get git commit hash and write to a file
                    script {
                        try {
                            // Get the commit hash directly. sh step will fail if git command fails.
                            def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true)?.trim()
                            echo "Git rev-parse raw output: '${commitHash}'"

                            if (!commitHash) {
                                error "Failed to get git commit hash: Command returned empty output."
                            }
                            // Store the hash in a temporary file
                            writeFile file: 'commit_hash.txt', text: commitHash
                        } catch (e) {
                            error "Error getting git commit hash: ${e.message}"
                        }
                    } // End first script block

                    // Read the hash from the file and assign to environment variables
                    script {
                        def commitHashFromFile = readFile('commit_hash.txt').trim()
                        if (commitHashFromFile) {
                            env.IMAGE_TAG = commitHashFromFile
                            env.DOCKER_IMAGE_NAME = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:${env.IMAGE_TAG}"
                            env.DOCKER_IMAGE_LATEST = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:latest"

                            echo "Assigned IMAGE_TAG from file: ${env.IMAGE_TAG}"
                            echo "Assigned DOCKER_IMAGE_NAME: ${env.DOCKER_IMAGE_NAME}"
                        } else {
                            error "Failed to read commit hash from file."
                        }

                        // Final check before exiting stage
                        if (!env.IMAGE_TAG || !env.DOCKER_IMAGE_NAME) {
                           error "Failed to set image environment variables correctly after reading from file."
                        }
                    } // End second script block
                } // End container block
            } // End steps
        } // End stage 1

        // Stage 2: Setup, Install & Build
        // Uses the top-level Kubernetes agent (inherits injected env vars)
        stage('Setup, Install & Build') {
            steps {
                // Steps run inside the 'node' container defined in the top-level agent
                container('node') {
                    echo "Setting up Node.js ${env.NODE_VERSION} environment..."
                    sh 'node -v'
                    // Using npm ci (Clean Install) - Requires package-lock.json
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
        // Uses the top-level Kubernetes agent (node container now has docker client via socket mount)
        stage('Build & Push Docker Image') {
            // No specific agent needed, inherits from top-level
            steps {
                 container('node') {
                    // Ensure IMAGE_TAG is set before proceeding
                    script {
                        // Check environment variables at the start of this stage's steps
                        echo "Verifying env vars in Build Stage: IMAGE_TAG=${env.IMAGE_TAG}, DOCKER_IMAGE_NAME=${env.DOCKER_IMAGE_NAME}"
                        if (!env.IMAGE_TAG || !env.DOCKER_IMAGE_NAME || !env.DOCKER_IMAGE_LATEST) {
                            error "Docker image environment variables (IMAGE_TAG, DOCKER_IMAGE_NAME, DOCKER_IMAGE_LATEST) are not set correctly at start of Build Stage. Cannot build Docker image."
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
            }
            post {
                always {
                    // This runs in the 'node' container context
                    container('node') {
                        echo "Logging out from Docker registry..."
                        sh "docker logout ${env.DOCKER_REGISTRY}"
                    }
                }
            }
        }

        // Stage 4: Deploy to Kubernetes
        // Uses the top-level Kubernetes agent (node container now has kubectl)
        stage('Deploy to Kubernetes') {
            // Inherits the top-level agent definition
            steps {
                container('node') {
                    // Ensure IMAGE_TAG is set before proceeding
                    script {
                         // Check environment variables at the start of this stage's steps
                        echo "Verifying env vars in Deploy Stage: IMAGE_TAG=${env.IMAGE_TAG}, DOCKER_IMAGE_NAME=${env.DOCKER_IMAGE_NAME}"
                        if (!env.IMAGE_TAG || !env.DOCKER_IMAGE_NAME) {
                            error "Docker image environment variables (IMAGE_TAG, DOCKER_IMAGE_NAME) are not set correctly at start of Deploy Stage. Cannot deploy."
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
            }
            post {
                always {
                    // Clean up workspace including kubeconfig.yaml
                    // This runs in the 'node' container context
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
