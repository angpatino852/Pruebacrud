pipeline {
    agent any

    environment {
        IMAGE_NAME_BACKEND = 'backend-app:localbuild-1'
        IMAGE_NAME_FRONTEND = 'frontend-app:localbuild-1'
        KUBECONFIG = 'C:\\Users\\TU_USUARIO\\.kube\\config' // <--- ACTUALIZA ESTO si no estás usando SYSTEM
    }

    stages {
        stage('Clonar repositorio') {
            steps {
                git branch: 'main', url: 'https://github.com/angpatino852/Pruebacrud.git'
            }
        }

        stage('Verificar conexión con Minikube') {
            steps {
                bat '''
                echo Verificando conexión con Minikube...
                kubectl config current-context
                kubectl get nodes
                '''
            }
        }

        stage('Construir imágenes Docker en Minikube') {
            steps {
                bat '''
                rem Configurar Docker para usar Minikube
                call minikube -p minikube docker-env --shell=cmd > minikube_env.bat
                call minikube_env.bat

                rem Construir imagen Backend
                docker build -t backend-app:localbuild-1 ./client/Backend

                rem Construir imagen Frontend
                docker build -t frontend-app:localbuild-1 ./client/frontend
                '''
            }
        }

        stage('Eliminar recursos anteriores') {
            steps {
                bat '''
                kubectl delete -f client/db/deployment-mongo.yaml --ignore-not-found
                kubectl delete -f client/db/service-mongo.yaml --ignore-not-found
                kubectl delete -f client/Backend/backend-deploy.yaml --ignore-not-found
                kubectl delete -f client/Backend/backend-service.yaml --ignore-not-found
                kubectl delete -f client/frontend/front-deploy.yaml --ignore-not-found
                kubectl delete -f client/frontend/front-service.yaml --ignore-not-found
                kubectl delete -f secret.yaml --ignore-not-found
                kubectl delete -f service.yaml --ignore-not-found
                '''
            }
        }

        stage('Desplegar recursos Kubernetes') {
            steps {
                bat '''
                kubectl apply -f client/db/deployment-mongo.yaml --validate=false
                kubectl apply -f client/db/service-mongo.yaml --validate=false
                kubectl apply -f client/Backend/backend-deploy.yaml --validate=false
                kubectl apply -f client/Backend/backend-service.yaml --validate=false
                kubectl apply -f client/frontend/front-deploy.yaml --validate=false
                kubectl apply -f client/frontend/front-service.yaml --validate=false
                '''
            }
        }

        stage('Verificar despliegues') {
            steps {
                bat '''
                kubectl rollout status deployment/backend-app -n default --timeout=300s
                kubectl rollout status deployment/frontend-app -n default --timeout=300s
                '''
            }
        }
    }

    post {
        failure {
            echo '❌ Falló el pipeline. Revisa los logs de Jenkins.'
        }
        success {
            echo '✅ Despliegue exitoso en Minikube.'
        }
    }
}
