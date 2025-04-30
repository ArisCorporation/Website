pipeline {
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
  stages {
    stage('Checkout') {
      agent none
      steps {
        container('node') {
          cleanWs()
          checkout scm
          script {
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

    stage('Setup, Install & Build') {
      steps {
        container('node') {
          echo "Setting up Node.js ${env.NODE_VERSION} environment..."
          sh 'node -v'
          sh 'npm install --legacy-peer-deps'
          echo 'Dependencies installed.'
          echo 'Building Nuxt 3 application for production...'
          echo 'All variables from ConfigMap/Secret are available via envFrom.'
          sh 'npm run build'
          echo 'Nuxt 3 application built successfully.'
          sh 'ls -la .output'
        }

      }
    }

    stage('Build & Push Docker Image') {
      agent any
      post {
        always {
          echo 'Logging out from Docker registry...'
          sh "docker logout ${env.DOCKER_REGISTRY}"
        }

      }
      steps {
        echo "Building Docker image: ${env.DOCKER_IMAGE_NAME}"
        withCredentials([string(credentialsId: env.DOCKER_CREDENTIALS_ID, variable: 'DOCKER_HUB_PASSWORD'), usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD_UNUSED')]) {
          sh "echo $DOCKER_HUB_PASSWORD | docker login ${env.DOCKER_REGISTRY} -u ${DOCKER_HUB_USERNAME} --password-stdin"
        }

        sh "docker build -t ${env.DOCKER_IMAGE_NAME} -t ${env.DOCKER_IMAGE_LATEST} ."
        echo "Pushing Docker image to ${env.DOCKER_REGISTRY}..."
        sh "docker push ${env.DOCKER_IMAGE_NAME}"
        sh "docker push ${env.DOCKER_IMAGE_LATEST}"
        echo 'Docker image pushed successfully.'
      }
    }

    stage('Deploy to Kubernetes') {
      agent any
      post {
        always {
          deleteDir()
        }

      }
      steps {
        echo "Deploying application to Kubernetes namespace: ${env.KUBERNETES_NAMESPACE}"
        withCredentials([kubeconfigContent(credentialsId: env.KUBERNETES_CREDENTIALS_ID, variable: 'KUBECONFIG_CONTENT')]) {
          sh 'echo "$KUBECONFIG_CONTENT" > ./kubeconfig.yaml'
          withEnv(['KUBECONFIG=./kubeconfig.yaml']) {
            sh "sed -i 's|IMAGE_PLACEHOLDER|${env.DOCKER_IMAGE_NAME}|g' ${env.KUBERNETES_DEPLOYMENT_FILE}"
            echo "Updated image in ${env.KUBERNETES_DEPLOYMENT_FILE} to ${env.DOCKER_IMAGE_NAME}"
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

            echo 'Waiting for deployment rollout to finish...'
            sh "kubectl rollout status deployment/${env.APP_NAME} --namespace ${env.KUBERNETES_NAMESPACE} --timeout=300s"
            echo 'Deployment successful.'
          }

        }

      }
    }

  }
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
