aws ecr-public get-login-password --region us-east-1 --profile defiplaza | docker login --username AWS --password-stdin public.ecr.aws/m8q3l0g8
docker build -t feed-parser -f ./Dockerfile ..
docker tag feed-parser:latest public.ecr.aws/m8q3l0g8/feed-parser:latest 
docker push public.ecr.aws/m8q3l0g8/feed-parser:latest