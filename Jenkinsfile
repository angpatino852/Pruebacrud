pipeline {
    agent any

    environment {
        IMAGE_NAME_BACKEND = 'backend-app:localbuild-1'
        IMAGE_NAME_FRONTEND = 'frontend-app:localbuild-1'
        K8S_NAMESPACE = 'crud-ns' // Asegúrate de que esto sea exactamente 'crud-ns' (sensible a mayúsculas)
    }

    stages {
        stage('Clonar repositorio') {
            steps {
                git branch: 'main', url: 'https://github.com/angpatino852/Pruebacrud.git'
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
                        echo --- Creando Namespace %K8S_NAMESPACE% si no existe ---
                        (
                        echo apiVersion: v1
                        echo kind: Namespace
                        echo metadata:
                        echo   name: %K8S_NAMESPACE%
                        ) | kubectl apply -f -

                        echo.
                        echo --- Verificando que el Namespace %K8S_NAMESPACE% existe ---
                        kubectl get namespace %K8S_NAMESPACE%
                        IF ERRORLEVEL 1 (
                            echo ERROR: Namespace %K8S_NAMESPACE% no fue encontrado despues de intentar crearlo. Abortando.
                            exit /b 1
                        )
                        echo Namespace %K8S_NAMESPACE% existe.

                        echo.
                        echo --- Configurando Docker para usar Minikube ---
                        call minikube -p minikube docker-env --shell=cmd > minikube_env.bat
                        call minikube_env.bat
                        del minikube_env.bat
                        echo Variables de entorno de Docker de Minikube configuradas.

                        echo.
                        echo --- Construyendo imagen Backend ---
                        docker build -t %IMAGE_NAME_BACKEND% ./client/Backend

                        echo.
                        echo --- Construyendo imagen Frontend ---
                        docker build -t %IMAGE_NAME_FRONTEND% ./client/frontend
                        
                        echo.
                        echo "Contenido del workspace ANTES de eliminar/aplicar YAMLs:"
                        dir

                        echo.
                        echo --- Eliminando recursos anteriores (si existen) en namespace %K8S_NAMESPACE% ---
                        kubectl delete -f client/db/deployment-mongo.yaml -n %K8S_NAMESPACE% --ignore-not-found
                        kubectl delete -f client/db/service-mongo.yaml -n %K8S_NAMESPACE% --ignore-not-found
                        kubectl delete -f client/Backend/backend-deploy.yaml -n %K8S_NAMESPACE% --ignore-not-found
                        kubectl delete -f client/Backend/backend-service.yaml -n %K8S_NAMESPACE% --ignore-not-found
                        kubectl delete -f client/frontend/front-deploy.yaml -n %K8S_NAMESPACE% --ignore-not-found
                        kubectl delete -f client/frontend/front-service.yaml -n %K8S_NAMESPACE% --ignore-not-found
                        kubectl delete -f secret.yaml -n %K8S_NAMESPACE% --ignore-not-found
                        kubectl delete -f service.yaml -n %K8S_NAMESPACE% --ignore-not-found


                        echo.
                        echo --- Desplegando recursos Kubernetes en namespace %K8S_NAMESPACE% ---
                        echo Aplicando secret.yaml...
                        kubectl apply -f secret.yaml -n %K8S_NAMESPACE%
                        
                        echo Aplicando service.yaml...
                        kubectl apply -f service.yaml -n %K8S_NAMESPACE% 
                        
                        echo Aplicando MongoDB...
                        kubectl apply -f client/db/deployment-mongo.yaml -n %K8S_NAMESPACE%
                        kubectl apply -f client/db/service-mongo.yaml -n %K8S_NAMESPACE%
                        
                        echo Aplicando Backend...
                        kubectl apply -f client/Backend/backend-deploy.yaml -n %K8S_NAMESPACE%
                        kubectl apply -f client/Backend/backend-service.yaml -n %K8S_NAMESPACE%
                        
                        echo Aplicando Frontend...
                        kubectl apply -f client/frontend/front-deploy.yaml -n %K8S_NAMESPACE%
                        kubectl apply -f client/frontend/front-service.yaml -n %K8S_NAMESPACE%
                        
                        echo.
                        echo --- Verificando despliegues en namespace %K8S_NAMESPACE% ---
                        echo Verificando backend...
                        kubectl rollout status deployment/backend -n %K8S_NAMESPACE% --timeout=300s
                        echo Verificando frontend...
                        kubectl rollout status deployment/frontend -n %K8S_NAMESPACE% --timeout=300s

                        echo Limpiando KUBECONFIG para este paso
                        set KUBECONFIG=
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finalizado.'
        }
        failure {
            echo '❌ Falló el pipeline. Revisa los logs de Jenkins.'
        }
        success {
            echo '✅ Despliegue exitoso en Minikube.'
        }
    }
}