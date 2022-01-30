// import { discordToken } from '../../config.json'
import * as Discord from "discord.js";


// (async () => {
//     const client = new Discord.Client({
//         intents: [Discord.Intents.FLAGS.GUILDS]
//     });

//     console.log(await client.login(discordToken));

//     await new Promise(r => client.once('ready', r));

//     // let channel = await client.guilds.channels.cache.get("937131976677294091") as Discord.TextChannel
//     let channel = client.channels.cache.get('937131976677294091') as Discord.TextChannel;
//     for(let i = 0; i < 5; i++) {
//         await channel.send("This is (test)[http://google.com] on **markdown** тест " + i);
//         await new Promise(r => setTimeout(r, 1000));
//     }


// })()


export class DiscordBot {
    bot: Discord.Client;
    channel: Promise<Discord.TextChannel>;

    logger;
    markdownEnable: boolean;
    constructor(botToken, channel, logger, amountPubs, markdownEnable = true) {
        this.bot = new Discord.Client({
            intents: [Discord.Intents.FLAGS.GUILDS]
        });
        this.bot.login(botToken);
        this.channel = new Promise(r => {
            this.bot.once('ready', () => {
                r(this.bot.channels.cache.get(channel) as Discord.TextChannel)
            })
        })

    }
    async sendMessage(message: string) {
        if(!message) return;
        (await this.channel).send(message);
        return 0;
    }
}