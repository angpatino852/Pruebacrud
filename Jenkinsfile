pipeline {
    agent any
    environment {
        DOCKER_IMAGE_BACKEND = "tu-usuario-docker/backend-app"
        DOCKER_IMAGE_FRONTEND = "tu-usuario-docker/frontend-app"
        DOCKER_TAG = "${BUILD_NUMBER}"
        K8S_NAMESPACE = "default"
        APP_NAME_BACKEND = "backend-app"
        APP_NAME_FRONTEND = "frontend-app"
        KUBECONFIG = "/home/jenkins/.kube/config" // Ajusta esta ruta si es distinta
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Clonando repositorio público..."
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'CloneOption', depth: 1, shallow: true]
                    ],
                    userRemoteConfigs: [[
                        url: 'https://github.com/angatino852/Pruebacrud.git'
                    ]]
                ])
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        echo "Construyendo imagen Backend..."
                        sh "cd client/Backend && docker build -t ${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG} ."
                    }
                }
                stage('Build Frontend') {
                    steps {
                        echo "Construyendo imagen Frontend..."
                        sh "cd client/frontend && docker build -t ${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG} ."
                    }
                }
            }
        }

        stage('Push to Docker Hub (sin auth)') {
            steps {
                echo "PUSH de imágenes sin autenticación (solo funcionará si el repositorio Docker es público y Jenkins está logueado)..."
                sh """
                    docker push ${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG} || echo '⚠️ No se pudo hacer push. Asegúrate de haber hecho login o de que el repositorio sea público.'
                    docker push ${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG} || echo '⚠️ No se pudo hacer push. Asegúrate de haber hecho login o de que el repositorio sea público.'
                """

                script {
                    if (env.GIT_BRANCH?.replaceFirst(/^origin\\//, '') == 'main') {
                        echo "Etiquetando imágenes como latest..."
                        sh """
                            docker tag ${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG} ${DOCKER_IMAGE_BACKEND}:latest
                            docker tag ${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG} ${DOCKER_IMAGE_FRONTEND}:latest
                            docker push ${DOCKER_IMAGE_BACKEND}:latest || echo '⚠️ Push latest falló.'
                            docker push ${DOCKER_IMAGE_FRONTEND}:latest || echo '⚠️ Push latest falló.'
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "Aplicando archivos de Kubernetes..."
                sh """
                    export KUBECONFIG=${KUBECONFIG}

                    kubectl apply -f client/db/deployment-mongo.yaml -n ${K8S_NAMESPACE}
                    kubectl apply -f client/Backend/backend-deploy.yaml -n ${K8S_NAMESPACE}
                    kubectl apply -f client/frontend/front-deploy.yaml -n ${K8S_NAMESPACE}

                    kubectl set image deployment/${APP_NAME_BACKEND} ${APP_NAME_BACKEND}=${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG} -n ${K8S_NAMESPACE}
                    kubectl rollout status deployment/${APP_NAME_BACKEND} -n ${K8S_NAMESPACE} --timeout=300s

                    kubectl set image deployment/${APP_NAME_FRONTEND} ${APP_NAME_FRONTEND}=${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG} -n ${K8S_NAMESPACE}
                    kubectl rollout status deployment/${APP_NAME_FRONTEND} -n ${K8S_NAMESPACE} --timeout=300s
                """
            }
        }
    }
}