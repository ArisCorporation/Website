// Jenkinsfile for KubeSphere DevOps - Nuxt 3 App
// Uses direct K8s variable injection via Pod Template (envFrom)
// Configured for GitHub Container Registry (ghcr.io)
// Agent defined at top level for better KubeSphere UI compatibility
// Installs git, docker-cli, kubectl in agent; Mounts docker socket.
// Uses stash/unstash for passing image tag and names between stages.
// Corrected withCredentials binding for docker login.

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
        DOCKER_CREDENTIALS_ID = 'github' // ID for Username/Password credential for GHCR
        KUBERNETES_CREDENTIALS_ID = 'kubernetes-credentials'
        KUBERNETES_NAMESPACE = 'ariscorp-devops-test-2'
        KUBERNETES_DEPLOYMENT_FILE = 'kubernetes/deployment.yaml'
        KUBERNETES_SERVICE_FILE = 'kubernetes/service.yaml'
        // Image vars are no longer initialized here, they will be stashed/unstashed
    }

    // Define the stages of the pipeline
    stages {
        // Stage 1: Prepare Workspace, Install Tools & Stash Build Info
        // Jenkins performs checkout before this stage automatically
        stage('Prepare Workspace, Install Tools & Stash Build Info') {
            steps {
                // Steps run inside the 'node' container
                container('node') {
                    // Install required tools (git, docker client, kubectl)
                    sh 'apk update && apk add --no-cache git docker-cli kubectl'
                    // Add the workspace directory to git's safe directories
                    sh 'git config --global --add safe.directory ${WORKSPACE}'

                    // Get git commit hash and prepare build info
                    script {
                        def commitHash = ''
                        def dockerImageName = ''
                        def dockerImageLatest = ''
                        try {
                            commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true)?.trim()
                            echo "Git rev-parse raw output: '${commitHash}'"

                            if (!commitHash) {
                                error "Failed to get git commit hash: Command returned empty output."
                            }

                            // Construct image names locally
                            dockerImageName = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:${commitHash}"
                            dockerImageLatest = "${env.DOCKER_REGISTRY}/${env.APP_NAME}:latest"

                            // Write values to files
                            writeFile file: 'image_tag.txt', text: commitHash
                            writeFile file: 'docker_image_name.txt', text: dockerImageName
                            writeFile file: 'docker_image_latest.txt', text: dockerImageLatest

                            echo "Prepared IMAGE_TAG: ${commitHash}"
                            echo "Prepared DOCKER_IMAGE_NAME: ${dockerImageName}"

                        } catch (e) {
                            error "Error preparing build info: ${e.message}"
                        }
                    } // End script block

                    // Stash the files containing the build info
                    stash includes: 'image_tag.txt, docker_image_name.txt, docker_image_latest.txt', name: 'buildInfo'

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
                    // Retrieve the stashed build info
                    unstash 'buildInfo'

                    // Read values from the unstashed files
                    script {
                        def imageTag = readFile('image_tag.txt').trim()
                        def dockerImageName = readFile('docker_image_name.txt').trim()
                        def dockerImageLatest = readFile('docker_image_latest.txt').trim()

                        echo "Using unstashed IMAGE_TAG: ${imageTag}"
                        echo "Using unstashed DOCKER_IMAGE_NAME: ${dockerImageName}"

                        if (!imageTag || !dockerImageName || !dockerImageLatest) {
                            error "Failed to read required values from unstashed files."
                        }

                        // Use the read values directly
                        echo "Building Docker image: ${dockerImageName}"
                        // Corrected withCredentials block: Only use usernamePassword binding
                        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            // Use the variables provided by usernamePassword binding
                            sh "echo $DOCKER_PASSWORD | docker login ${env.DOCKER_REGISTRY} -u ${DOCKER_USERNAME} --password-stdin"
                        }
                        // Use the variables read from files for docker commands
                        sh "docker build -t ${dockerImageName} -t ${dockerImageLatest} ."
                        echo "Pushing Docker image to ${env.DOCKER_REGISTRY}..."
                        sh "docker push ${dockerImageName}"
                        sh "docker push ${dockerImageLatest}"
                        echo "Docker image pushed successfully."
                    }
                 }
            }
            post {
                always {
                    // This runs in the 'node' container context
                    container('node') {
                        echo "Logging out from Docker registry..."
                        sh "docker logout ${env.DOCKER_REGISTRY}"
                        // Clean up unstashed files if necessary (optional, workspace is usually cleaned)
                        sh 'rm -f image_tag.txt docker_image_name.txt docker_image_latest.txt'
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
                    // Retrieve the stashed build info again
                    unstash 'buildInfo'

                    // Read the required value(s)
                    script {
                        def dockerImageNameToDeploy = readFile('docker_image_name.txt').trim()
                        echo "Using unstashed DOCKER_IMAGE_NAME for deploy: ${dockerImageNameToDeploy}"

                        if (!dockerImageNameToDeploy) {
                            error "Failed to read docker_image_name.txt from unstashed files for deployment."
                        }

                        // Use the read value directly
                        echo "Deploying application to Kubernetes namespace: ${env.KUBERNETES_NAMESPACE}"
                        withCredentials([kubeconfigContent(credentialsId: env.KUBERNETES_CREDENTIALS_ID, variable: 'KUBECONFIG_CONTENT')]) {
                            sh 'echo "$KUBECONFIG_CONTENT" > ./kubeconfig.yaml'
                            withEnv(['KUBECONFIG=./kubeconfig.yaml']) {
                                // Use the variable read from file in sed command
                                sh "sed -i 's|IMAGE_PLACEHOLDER|${dockerImageNameToDeploy}|g' ${env.KUBERNETES_DEPLOYMENT_FILE}"
                                echo "Updated image in ${env.KUBERNETES_DEPLOYMENT_FILE} to ${dockerImageNameToDeploy}"
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
            }
            post {
                always {
                    // Clean up workspace including kubeconfig.yaml and unstashed files
                    container('node') {
                         sh 'rm -f image_tag.txt docker_image_name.txt docker_image_latest.txt kubeconfig.yaml'
                         // deleteDir() // Use deleteDir() if you want to wipe the whole workspace
                    }
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
