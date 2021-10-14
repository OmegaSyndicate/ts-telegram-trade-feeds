export $(grep -v '^#' .env | xargs)

ssh-keygen -F bitbucket.org || ssh-keyscan bitbucket.org >>~/.ssh/known_host

git pull

docker build -t feed-parser -f ./Dockerfile ..
docker service update --image feed-parser:latest feed-parser-worker --force
docker rmi $(docker images -f "dangling=true" -q)