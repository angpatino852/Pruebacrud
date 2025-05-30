stages {
        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'CloneOption', depth: 1, shallow: true]
                    ],
                    userRemoteConfigs: [[
                        url: 'https://github.com/angatino852/Pruebacrud.git',
                        credentialsId: 'github-creds'
                    ]]
                ])
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh "cd client/Backend && docker build -t ${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG} ."
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh "cd client/frontend && docker build -t ${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG} ."
            }
        }

        /*
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    script {
                        docker.withRegistry('https://registry.hub.docker.com', DOCKERHUB_CREDS) {
                            docker.image("${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG}").push()
                            docker.image("${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG}").push()
                            // Opcional: push 'latest' en ramas principales
                            if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                                docker.image("${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG}").push('latest')
                                docker.image("${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG}").push('latest')
                            }
                        }
                    }
                }
            }
        }
        */

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withEnv(["KUBECONFIG=${KUBECONFIG_FILE}"]) {
                        sh """
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

        // Puedes añadir una etapa de 'Smoke Test' aquí si tienes una forma de verificar la aplicación
    }

    post {
        always {
            steps {
                // Aquí puedes añadir notificaciones o limpieza
            }
        }
    }
}