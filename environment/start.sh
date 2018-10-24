#!/bin/bash
#espera que arquivo .env esteja em um diretório acima (raiz projeto)
ENV_FILE=$(pwd)/../.env
# 1. Check if .env file exists
if [ -e ${ENV_FILE} ]; then
    source ${ENV_FILE}
else
    echo "Please set up your .env file before starting your enviornment."
    exit 1
fi

# 2. Check if proxy is running

INSTALLED_DOCKER=$(which docker)
INSTALLED_DOCKER_COMPOSE=$(which docker-compose)
OPTION=$1
LOGIN_AS_USER=$2
COMPOSE_FILE=docker-composes/app.yml
COMPOSE_PROD_FILE=docker-composes/app-prod.yml
COMPOSE_DEV=" -f ${COMPOSE_FILE}"
COMPOSE_PROD=" -f ${COMPOSE_FILE} -f ${COMPOSE_PROD_FILE}"

CONT_NGINX_PROXY_NAME=nginx-proxy
COMPOSE_LOGGLY=docker-composes/loggly.yml
CONT_LOGGLY_NAME=loggly

# Verificar se docker está instalado, caso não esteja, instalar
if [ ! -e "$INSTALLED_DOCKER" ]; then
    echo "Docker isn't installed, must be installed first!"
    echo 'Running script installation docker...'
    sleep 2
    wget -O - https://raw.githubusercontent.com/fredericomartini/shell/master/install_docker.sh | sh
fi

# Verificar se docker-compose está instalado, caso não esteja, instalar
if [ ! -e "$INSTALLED_DOCKER_COMPOSE" ]; then
   #instalar
   INSTALLED_CURL=$(which curl)
   if [ ! -e "$INSTALLED_CURL" ]; then
       sudo apt-get update && sudo apt-get install curl -y
   fi

   sudo curl -L https://github.com/docker/compose/releases/download/1.20.1/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

   sudo chmod +x /usr/local/bin/docker-compose
fi


# Verifica se container do nginx-proxy (monitorar containers/sites e apontar p/ porta 80) está rodando
verifyWebProxy() {
  if [ ! "$(docker ps -q -f name=${CONT_NGINX_PROXY_NAME})" ]; then
    echo "Container web proxy não está rodando e é necessário"
    echo "1- Clonar repository: https://github.com/fredericomartini-docker-libraries/docker-compose-letsencrypt-nginx-proxy-companion"
    echo "2- Criar copia do .env"
    echo "cp -R .env.sample .env"
    if [ "$ENVIRONMENT" = "prod" ] && [ "$USE_HTTPS"  = "true" ]; then
        echo "Alterar IP: IP=0.0.0.0 p/ o do HOST"
    fi
    echo "3- Executar script p/ subir containers"
    echo "./start.sh"
    exit 1
  fi

}

# Verifica se container de logs (loggly) (monitorar containers/sites e enviar logs p/ loggly) está rodando
runLoggly() {
  if [ ! "$(docker ps -q -f name=${CONT_LOGGLY_NAME})" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=${CONT_LOGGLY_NAME})" ]; then
        # cleanup
        docker rm $CONT_LOGGLY_NAME
    fi
    # run your container
    docker-compose -f $COMPOSE_LOGGLY up --no-start
    docker-compose -f $COMPOSE_LOGGLY start
  fi

}

# Script automático do Loggly p/ configurar syslog no host (necessário rodar somente uma vez)
configureSyslog(){
  curl -O https://www.loggly.com/install/configure-linux.sh
  sudo bash configure-linux.sh -a ${LOGGLY_SUB_DOMAIN} -u ${LOGGLY_USERNAME} -p ${LOGGLY_PASSWORD} --force-secure
  rm -rf configure-linux.sh
}

# Exporta variáveis para ficarem disponíveis no terminal e assim serem utilizadas
function exportEnvVars() {
    export $(egrep -v '^#' $ENV_FILE | xargs)
    #exporta varíáveis que ñ estão presente no .env diretamente, mas são utilizadas
    export USER_ID=$(id -u)
    export GROUP_ID=$(id -g)
    export COMPOSE_PROJECT_NAME=${APP_NAME}
}

function confirmationYesNo(){
  read -p "Tem certeza que deseja remover container e os volumes (dados em database serão perdidos) Operação não poderá ser desfeita
 Confirma (y/n)?" choice

  case "$choice" in
    y|Y )

      ;;
    n|N )
      exit 0
      ;;
      * )
      echo "invalid"
      exit 0
    ;;
  esac
}

function compose_file(){
    # prod e usar https
    if [ "$ENVIRONMENT" = "prod" ] && [ "$USE_HTTPS"  = "true" ]; then
        COMPOSE_FILE=${COMPOSE_PROD}
    else
        COMPOSE_FILE=${COMPOSE_DEV}
    fi
}

# Verifica opção do usuário
function run() {
    case $OPTION in
            start)
                # Verificar se container proxy rodando, caso ñ rodar
                verifyWebProxy
                # Verificar se container loggly rodando, caso ñ rodar
                # runLoggly
                docker-compose ${COMPOSE_FILE} down
                docker-compose ${COMPOSE_FILE} up --no-start --build
                docker-compose ${COMPOSE_FILE} start

                #remover imagens sem name/tag
                docker rmi -f $(docker images -a  |grep "<none>") > /dev/null 2>&1
                ;;
            stop)
                docker-compose ${COMPOSE_FILE} stop
                ;;
            clear)
                docker-compose ${COMPOSE_FILE} down
                #TODO: executar rm de imagens do docker-compose
                 docker rmi ${APP_NAME}/node:${NODE_VERSION}
                ;;
            enter-db)
                docker exec -e COLUMNS="`tput cols`" -e LINES="`tput lines`" -it $(docker ps -q -f name=${APP_NAME}_db_1) bash
                ;;
            db-ip)
                    
                ;;
            enter-web)
                # User default (logado) ou usuários especificado 'root'
                docker exec -e COLUMNS="`tput cols`" -e LINES="`tput lines`" -it --user=${LOGIN_AS_USER:-$USER} $(docker ps -q -f name=${APP_NAME}_web_1) sh

                ;;
            clearAndDeleteAll)
                # Validar se usuário tem certeza que deseja deseja remover tudo.
                confirmationYesNo
                docker-compose ${COMPOSE_FILE} down --volumes
                #TODO: executar rm de imagens do docker-compose
                docker rmi -f ${APP_NAME}/node:${NODE_VERSION}
                ;;
            *) echo "USAGE: (star | stop | clear | enter-db | enter-web)
  start     :: Build and Start the stack
  stop      :: Stop the stack
  clear     :: Remove the stack and clear images that are builded
  clearAndDeleteAll :: Remove the stack, clear the images and remove volumes, WARNING (ALL DATA WILL BE LOST)
  enter-db  :: Get into the database container to run commands like (mysql -v, mysql -u)
  db-ip     :: Show the database IPAddress
  enter-web :: Get into the web container to run commands like (node -v, composer install)"

    esac
}

exportEnvVars
#seta env_file p/ prod ou dev
compose_file
#configureSyslog #rodar somente uma vez e em produção
run
