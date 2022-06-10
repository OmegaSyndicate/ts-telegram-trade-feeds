import { createMessageFromTemplate, MessageData } from "../helpers/message";



export function createMessage(message, config) {
	const symbols = config.token.split('_'); 

	let data:MessageData = {
		platform: 'MEXC',
		platformIcon: '▲',
		platformUrl: `https://www.mexc.com/exchange/${config.token}`,
		type: message.trade_type == 'BID' ? 'Bought' : 'Sold',
		baseSymbol: symbols[0],
		baseAmount: message.trade_quantity,
		quoteSymbol: symbols[1],
		quoteAmount: message.trade_price * message.trade_quantity,
		usdValue: message.trade_price * message.trade_quantity,
		address: null,
		transactionId: null,
		tracker: null,
		trackerUrl: null
	}
	return createMessageFromTemplate(data, config);
}