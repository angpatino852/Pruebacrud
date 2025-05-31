pipeline {
    agent any

    environment {
        IMAGE_NAME_BACKEND = 'backend-app:localbuild-1'
        IMAGE_NAME_FRONTEND = 'frontend-app:localbuild-1'
        // KUBECONFIG ya no se define aquí globalmente
    }

    stages {
        stage('Clonar repositorio') {
            steps {
                git branch: 'main', url: 'https://github.com/angpatino852/Pruebacrud.git'
                // Si tu secret.yaml no está en el repo, créalo aquí o asegúrate que esté
                // Por ejemplo, si el secret.yaml que me mostraste está en la raíz del repo, ya estaría.
                // Si no, puedes hacer:
                // writeFile file: 'secret.yaml', text: '''
                // apiVersion: v1
                // kind: Secret
                // metadata:
                //   name: my-secret-from-files
                // type: Opaque
                // stringData:
                //   username: "angie"
                //   password: "1234"
                // '''
            }
        }

        stage('Operaciones con Minikube y Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'minikube-kubeconfig-file', variable: 'KUBECONFIG_PATH')]) {
                    bat '''
                        @echo off
                        echo Estableciendo KUBECONFIG para esta sesion...
                        set KUBECONFIG=%KUBECONFIG_PATH%

                        echo Verificando conexion con Minikube...
                        kubectl config current-context
                        kubectl get nodes

                        echo.
                        echo --- Configurando Docker para usar Minikube ---
                        call minikube -p minikube docker-env --shell=cmd > minikube_env.bat
                        call minikube_env.bat
                        echo Variables de entorno de Docker de Minikube configuradas.

                        echo.
                        echo --- Construyendo imagen Backend ---
                        docker build -t %IMAGE_NAME_BACKEND% ./client/Backend

                        echo.
                        echo --- Construyendo imagen Frontend ---
                        docker build -t %IMAGE_NAME_FRONTEND% ./client/frontend

                        echo.
                        echo --- Eliminando recursos anteriores (si existen) ---
                        kubectl delete -f client/db/deployment-mongo.yaml --ignore-not-found
                        kubectl delete -f client/db/service-mongo.yaml --ignore-not-found
                        kubectl delete -f client/Backend/backend-deploy.yaml --ignore-not-found
                        kubectl delete -f client/Backend/backend-service.yaml --ignore-not-found
                        kubectl delete -f client/frontend/front-deploy.yaml --ignore-not-found
                        kubectl delete -f client/frontend/front-service.yaml --ignore-not-found
                        rem Asegúrate de que estos archivos existan en el workspace o ajusta la ruta
                        rem Si secret.yaml y service.yaml están en la raíz del repo:
                        kubectl delete -f secret.yaml --ignore-not-found
                        kubectl delete -f service.yaml --ignore-not-found

                        echo.
                        echo --- Desplegando recursos Kubernetes ---
                        rem Aplicando el Secret primero si otros recursos dependen de él
                        rem Asumiendo que secret.yaml está en la raíz del workspace
                        kubectl apply -f secret.yaml 
                        rem Asumiendo que service.yaml está en la raíz del workspace (¿qué es este service.yaml?)
                        kubectl apply -f service.yaml 

                        kubectl apply -f client/db/deployment-mongo.yaml
                        kubectl apply -f client/db/service-mongo.yaml
                        kubectl apply -f client/Backend/backend-deploy.yaml
                        kubectl apply -f client/Backend/backend-service.yaml
                        kubectl apply -f client/frontend/front-deploy.yaml
                        kubectl apply -f client/frontend/front-service.yaml
                        
                        echo.
                        echo --- Verificando despliegues ---
                        kubectl rollout status deployment/backend-app -n default --timeout=300s
                        kubectl rollout status deployment/frontend-app -n default --timeout=300s

                        echo Limpiando KUBECONFIG para este paso
                        set KUBECONFIG=
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Limpiando el entorno de Docker de Minikube (si es necesario y se sabe cómo hacerlo de forma segura)...'
            // Podrías intentar unsetear las variables de DOCKER_HOST, etc.
            // o simplemente dejar que terminen con la sesión del bat.
            // bat 'del minikube_env.bat'
        }
        failure {
            echo '❌ Falló el pipeline. Revisa los logs de Jenkins.'
        }
        success {
            echo '✅ Despliegue exitoso en Minikube.'
        }
    }
}