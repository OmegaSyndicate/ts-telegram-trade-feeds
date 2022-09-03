import * as TelegramBot from 'node-telegram-bot-api';

export class telegramBot {
    bot: TelegramBot;
    channel: string | number;
    logger;
    markdownEnable: boolean;
    amountPubs: number;
    constructor(botToken, channel, logger, amountPubs, markdownEnable = true) {
        this.channel = channel;
        this.bot = new TelegramBot(botToken);
        this.markdownEnable = markdownEnable;
        this.logger = logger;
        this.amountPubs = amountPubs ? amountPubs : 1;
    }
    async sendMessage(message: string) {
        if (!message) return;

        // if (this.channel == '@feedlogs') {
        //     return;
        // }

        try {
            if(message.length > 4096) { // Telegram limitation on message length
                let parts = message.length / 4096;
                for(let i = 0; i <= parts; i++) {
                    await this.sendMessage(message.slice(i * 4096, (i+1) * 4096));
                }
            } else {
                await this.bot.sendMessage(this.channel, message, {parse_mode: this.markdownEnable ?  "markdown" : undefined, disable_web_page_preview: true})
            }
        } catch(err) {
            if(err.response.statusCode == 429) { // Too many requests (We went beyond the telegram limit)
                console.log(err.response.body.parameters.retry_after);
                await new Promise((resolve) => setTimeout(resolve, err.response.body.parameters.retry_after * 1e3));
                await this.bot.sendMessage(this.channel, message, {parse_mode: this.markdownEnable ?  "markdown" : undefined, disable_web_page_preview: true}); // retry
            } else {
                // this.logger.error(err + "\n\n" + message);
                // console.error(err);
                return new Error("The message was not sent");
            }
        }
        return 0;
    }
}