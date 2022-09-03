aws ecr-public get-login-password --region us-east-1 --profile defiplaza | docker login --username AWS --password-stdin public.ecr.aws/m8q3l0g8
docker build -t feed-telegram-bot -f ./Dockerfile ..
docker tag feed-telegram-bot:latest public.ecr.aws/m8q3l0g8/feed-telegram-bot:latest 
docker push public.ecr.aws/m8q3l0g8/feed-telegram-bot:latest