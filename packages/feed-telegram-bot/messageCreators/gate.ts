import { createMessageFromTemplate, MessageData } from "../helpers/message";

export function createMessage(message, config, logger) {
    const symbols = config.token.split('_');

    let data: MessageData = {
        platform: 'Gate.io',
        platformIcon: '🌀',
        platformUrl: `https://www.gate.io/trade/${config.token}/`,
        type: message.side == 'BID' ? 'Bought' : 'Sold',
        baseSymbol: symbols[0].toUpperCase(),
        baseAmount: message.amount,
        quoteSymbol: symbols[1].toUpperCase(),
        quoteAmount: message.amount * message.price,
        usdValue: message.amount * message.price,
        address: null,
        transactionId: null,
        tracker: null,
        trackerUrl: null
    }

    return createMessageFromTemplate(data, config, logger);
}