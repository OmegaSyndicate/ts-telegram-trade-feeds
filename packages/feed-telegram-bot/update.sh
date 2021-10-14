export $(grep -v '^#' .env | xargs)

ssh-keygen -F bitbucket.org || ssh-keyscan bitbucket.org >>~/.ssh/known_host

git pull

docker build -t feed-telegram-bot -f ./Dockerfile ..
docker service update --image feed-telegram-bot:latest feed-telegram-bot-worker --force
docker rmi $(docker images -f "dangling=true" -q)