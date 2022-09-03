import { createMessageFromTemplate, MessageData } from "../helpers/message";

export function createMessage(message, config, logger) {
	const symbols = config.token.split('_');

	let data: MessageData = {
		platform: 'Ascendex',
		platformIcon: '🏔',
		platformUrl: `https://ascendex.com/en/cashtrade-spottrading/${config.token.replace('_', '/')}/`,
		type: message.bm == true ? 'Bought' : 'Sold',
		baseSymbol: symbols[0].toUpperCase(),
		baseAmount: message.q,
		quoteSymbol: symbols[1].toUpperCase(),
		quoteAmount: message.q * message.p,
		usdValue: message.q * message.p,
		address: null,
		transactionId: null,
		tracker: null,
		trackerUrl: null
	}

	return createMessageFromTemplate(data, config, logger);
}