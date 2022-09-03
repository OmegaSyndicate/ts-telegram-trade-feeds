import { createMessageFromTemplate, MessageData } from "../helpers/message";

export function createMessage(message, config, logger) {
	const symbols = config.token.split('_'); 

	let data: MessageData = {
		platform: 'MEXC',
		platformIcon: '▲',
		platformUrl: `https://www.mexc.com/exchange/${config.token}`,
		type: message.trade_type == 'BID' ? 'Bought' : 'Sold',
		baseSymbol: symbols[0].toUpperCase(),
		baseAmount: message.trade_quantity,
		quoteSymbol: symbols[1].toUpperCase(),
		quoteAmount: message.trade_price * message.trade_quantity,
		usdValue: message.trade_price * message.trade_quantity,
		address: null,
		transactionId: null,
		tracker: null,
		trackerUrl: null
	}

	return createMessageFromTemplate(data, config, logger);
}