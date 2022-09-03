import { CerbyFinance, generateDots, ScanText } from "../messageCreators/helpers"

export type MessageData = {
	platform: string,
	platformIcon: string,
	platformUrl: string,
	type: string, 
	baseSymbol: string,
	baseAmount: number,
	quoteSymbol: string,
	quoteAmount: number,
	usdValue: number
	address: string,
	transactionId: string,
	tracker: string,
	trackerUrl: string;
}

export function createMessageFromTemplate(data: MessageData, options, logger?): string {
	let msg = `${data.type == "Bought" ? "🚀" : "👹"} *1 ${data.baseSymbol} = ${(data.usdValue/data.baseAmount).toFixed(4)} USD*
${data.type} *${(Math.floor(data.baseAmount * 1000) / 1000).toLocaleString()} ${data.baseSymbol}* for *${(Math.floor(data.quoteAmount * 1000) / 1000).toLocaleString()} ${data.quoteSymbol}`;

	// If the quote amount is not in USD, add the USD value
	if (data.usdValue !== data.quoteAmount) {
		msg += ` (${Math.ceil(data.usdValue).toLocaleString()} USD)`
	}

	// always add closing *
	msg += `*`;
	
	// Add the platform this trade happened
	msg += ` on ${ data.platform }`

	// Add dots per X USD
	msg += `\n\n${generateDots(data.usdValue, options, data.type == "Bought" ? "🟢" : "🔴")}`;
	
	// Add address if given
	if (data.address) {
		msg += `\n\nFrom address: ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.account, data.address)}`;
	}

	// Add platform
	msg += `\n\n${data.platformIcon} [${data.platform}](${data.platformUrl})`;
	
	// If transaction id is present. add link to Etherscan
	if (data.transactionId) {
		msg += ` | ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.tx, options.id)}`;
	}
	
	// If tracker is present, add (like Dextools or Nomics)
	if (data.tracker) {
		msg += ` | 📊 [${data.tracker}](${data.trackerUrl})`
	}

	// Add promotion
	msg += `${CerbyFinance}`;

	if (logger) {
		logger.log(msg);
	}

	return msg;
}