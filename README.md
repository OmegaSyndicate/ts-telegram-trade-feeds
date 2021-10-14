# Quick start

## Installing Apache Kafka

First, download the kafka binaries to the server. From [here](https://kafka.apache.org/downloads)

Example
```bash
wget https://dlcdn.apache.org/kafka/3.0.0/kafka_2.13-3.0.0.tgz
tar xvf kafka_2.13-3.0.0.tgz
```

### Starting kafka

```bash
cd kafka_2.13-3.0.0
./bin/zookeeper-server-start.sh config/zookeeper.properties
./bin/kafka-server-start.sh config/server.properties
```

> Note: Apache kafka acts as a link between the parser and the telegram bot. It is desirable to have a single apache kafka image so that there are no conflicts. Each module does not store the state, the state and offsets are stored in the kafka, so keep an eye on that.

## Settings

- Add a token for telegram bot
- Add the address before apache kafka
- Add username or channelid to the channel with logs
- Add the required token
- Set up publishers by example

Read the "for the user" manual for more details.
## Launch

> Note: When changing config and using docker, you need to rebuild the docker image.

### feed parser
Change to directory with feed-parser
```bash
docker build -t feed-parser -f ./Dockerfile ..
docker run feed-parser -d
```

### feed-telegram-bot
Change to directory with feed-telegram-bot
> Note: If you specified "no synchronization" in the publishers settings, and you want to embed this bot into your old channel, then wait until the parser is fully synchronized by logs in the docker, usually it takes 2-3 minutes, depending on the Internet, then run this publisher and stop your old bot immediately. This is necessary so that there are no repeated transactions and none of them are missed.

```bash
docker build -t feed-telegram-bot -f ./Dockerfile ..
docker run -d feed-telegram-bot
```

# For the user

## feed parser module
**token** - Token name, must be unique for a particular parser type

**type** - The type of parser to run. Each one has different settings

**synchronizeIntervalMs** - The time after which there will be a repeated call to the api for synchronization.

**publishers** - This module is ignored and not used.

The rest of the settings depend on the type of parser

## feed telegram bot module
**token**, **type** - Used to find the topic the parser writes to.

Publisher settings

**channel** - Channel username or channel ID. It is there that the bot will write the telegram, it is also used for registering offsets, it is considered a unique value.

**withSync** - Turn sync on or off. It matters only when you turn it on for the first time, after which an offset is registered from which this publisher will continue to read it.

> Typically, the type of validator, message parser and message creator is selected by the token type, but you can also specify custom ones.

**validator** - File name for custom validator

**parser** - File name for custom message parser

**messageCreator** - File name for custom message creator

The rest of the settings depend on the used validator, message parser and message creator



<!-- # For the developer
## feed parser module
# feed telegram bot module -->