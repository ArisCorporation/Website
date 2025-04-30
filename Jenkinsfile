// Jenkinsfile for KubeSphere DevOps - Nuxt 3 App
// Uses direct K8s variable injection via Pod Template (envFrom)
// Configured for GitHub Container Registry (ghcr.io)
// Agent defined at top level with separate Kaniko container for builds.
// Installs git, kubectl in agent; No Docker daemon dependency.
// Uses stash/unstash for passing image tag and names between stages.

// Define global pipeline options
pipeline {
    // Define the primary agent for the pipeline using Kubernetes plugin
    // Includes a 'node' container for general steps and a 'kaniko' container for builds
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  # IMPORTANT: Grant Kaniko permissions to push to the registry if needed via ServiceAccount
  # serviceAccountName: your-service-account-with-push-permissions # Optional: If needed for registry auth via workload identity etc.
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
    volumeMounts: # Mount workspace volume
    - name: workspace-volume
      mountPath: /home/jenkins/agent
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug # Kaniko debug image includes a shell
    command:
    - cat # Keep container running
    tty: true
    volumeMounts: # Mount workspace volume into kaniko container
    - name: workspace-volume
      mountPath: /workspace # Kaniko needs access to the build context
  volumes: # Define the shared workspace volume
  - name: workspace-volume
    emptyDir: {}
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
                    // Install required tools (git and kubectl)
                    sh 'apk update && apk add --no-cache git kubectl'
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
        // Uses the 'node' container from the top-level agent
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

        // Stage 3: Build & Push Docker Image with Kaniko
        // Runs inside the dedicated 'kaniko' container
        stage('Build & Push Docker Image (Kaniko)') {
            agent none // Specify agent none because steps run in specific container
            steps {
                 container('kaniko') {
                    // Retrieve the stashed build info
                    unstash 'buildInfo'

                    // Read values from the unstashed files and prepare Kaniko execution
                    script {
                        def imageTag = readFile('image_tag.txt').trim()
                        def dockerImageName = readFile('docker_image_name.txt').trim()
                        def dockerImageLatest = readFile('docker_image_latest.txt').trim()

                        echo "Using unstashed IMAGE_TAG: ${imageTag}"
                        echo "Using unstashed DOCKER_IMAGE_NAME: ${dockerImageName}"

                        if (!imageTag || !dockerImageName || !dockerImageLatest) {
                            error "Failed to read required values from unstashed files for Kaniko build."
                        }

                        // Create Kaniko Docker config file for GHCR authentication
                        echo "Creating Kaniko Docker config for ${env.DOCKER_REGISTRY}..."
                        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            // Note: Use single quotes for the outer shell command to prevent Groovy interpolation issues
                            // Escape special characters within the JSON string if necessary
                            def dockerConfigJson = """
                            {
                                \\"auths\\": {
                                    \\"${env.DOCKER_REGISTRY}\\": {
                                        \\"username\\": \\"${DOCKER_USERNAME}\\",
                                        \\"password\\": \\"${DOCKER_PASSWORD}\\"
                                    }
                                }
                            }
                            """.stripIndent()
                            // Write the config to the standard Kaniko location
                            // Ensure the directory exists
                            sh 'mkdir -p /kaniko/.docker/'
                            writeFile file: '/kaniko/.docker/config.json', text: dockerConfigJson
                            // Optionally verify file content (be careful not to log secrets)
                            sh 'echo "Wrote /kaniko/.docker/config.json (content hidden)"'
                            // sh 'cat /kaniko/.docker/config.json' // Uncomment for debugging only, exposes creds in logs!
                        }

                        // Execute Kaniko - context is the workspace mounted at /workspace
                        // Dockerfile path is relative to the context
                        echo "Running Kaniko build..."
                        sh """
                        /kaniko/executor --context dir:///workspace \
                                         --dockerfile /workspace/Dockerfile \
                                         --destination ${dockerImageName} \
                                         --destination ${dockerImageLatest} \
                                         --verbosity=info
                        """
                        // Kaniko automatically uses /kaniko/.docker/config.json for auth

                        echo "Kaniko build and push finished successfully."
                    }
                 }
            }
            post {
                always {
                    // Clean up Kaniko config if desired (optional)
                    container('kaniko') {
                        echo "Cleaning up Kaniko config..."
                        sh 'rm -f /kaniko/.docker/config.json'
                    }
                    // Clean up stashed files from workspace
                    container('node') {
                         sh 'rm -f image_tag.txt docker_image_name.txt docker_image_latest.txt'
                    }
                }
            }
        }

        // Stage 4: Deploy to Kubernetes
        // Uses the 'node' container which has kubectl
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
