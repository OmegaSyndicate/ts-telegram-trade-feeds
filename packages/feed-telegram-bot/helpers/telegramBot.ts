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
        if(!message) return;
        await new Promise(resolve => setTimeout(resolve, 3100 * this.amountPubs));
        try {
            await this.bot.sendMessage(this.channel, message, {parse_mode: this.markdownEnable ?  "markdown" : undefined, disable_web_page_preview: true})
        } catch(err) {
            this.logger.error(err);
            console.error(err);
            return new Error("The message was not sent");
        }
        return 0;
    }
}