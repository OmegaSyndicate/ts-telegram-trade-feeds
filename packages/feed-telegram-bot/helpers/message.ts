import { generateDots, ScanText } from "../messageCreators/helpers"

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

export function createMessageFromTemplate(data: MessageData, options): string {
	let msg = `${data.type == "Bought" ? "🚀" : "👹"} *1 ${data.baseSymbol} = ${data.usdValue.toFixed(4)} USD*
${data.type} *${(Math.floor(data.baseAmount * 1000) / 1000).toLocaleString()} ${data.baseSymbol}* for *${(Math.floor(data.quoteAmount * 1000) / 1000).toLocaleString()} ${data.quoteSymbol} (${Math.ceil(+options.swapUSD).toLocaleString()} USD)* on ${data.platform}

${generateDots(data.usdValue, options, data.type == "Bought" ? "🟢" : "🔴")}`;
	
	if (data.address) {
		msg += `\n\nFrom address: ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.account, data.address)}`;
	}

	msg += `\n\n${data.platformIcon} [${data.platform}](${data.platformUrl})`;
	
	if (data.transactionId) {
		msg += ` | ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.tx, options.id)}`;
	}
	
	if (data.tracker) {
		msg += ` | 📊 [${data.tracker}](${data.trackerUrl})`
	}

	msg += ` | 💥 Powered by [DefiPlaza](https://defiplaza.net)`;

	return msg;
}