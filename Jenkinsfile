pipeline {
    agent any

    environment {
        DOCKER_TAG = "localbuild-${env.BUILD_NUMBER}"
        BACKEND_IMAGE = "backend-app:${DOCKER_TAG}"
        FRONTEND_IMAGE = "frontend-app:${DOCKER_TAG}"
        KUBECONFIG = "${HOME}/.kube/config"  // Asegúrate de que Jenkins pueda acceder
        NAMESPACE = "default"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Clonando repositorio público..."
                git branch: 'main', url: 'https://github.com/angpatino852/Pruebacrud.git'
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('client/Backend') {
                            sh "docker build -t ${BACKEND_IMAGE} ."
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('client/frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE} ."
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "Desplegando en Kubernetes local..."

                    sh """
                        export KUBECONFIG=${KUBECONFIG}

                        kubectl apply -f client/db/deployment-mongo.yaml -n ${NAMESPACE}
                        kubectl apply -f client/Backend/backend-deploy.yaml -n ${NAMESPACE}
                        kubectl apply -f client/frontend/front-deploy.yaml -n ${NAMESPACE}

                        kubectl set image deployment/backend-app backend-app=${BACKEND_IMAGE} -n ${NAMESPACE}
                        kubectl rollout status deployment/backend-app -n ${NAMESPACE} --timeout=300s

                        kubectl set image deployment/frontend-app frontend-app=${FRONTEND_IMAGE} -n ${NAMESPACE}
                        kubectl rollout status deployment/frontend-app -n ${NAMESPACE} --timeout=300s
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finalizado."
        }
    }
}
