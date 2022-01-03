import { numWithCommas, shortenAddress, createEtherscanLink } from "./Radix-uniswap";
import { generateDots, getDate } from "./Wise-stakes-uniswap";

export interface Message {
    id: string,
	owner: {
    		id: string
  	},
	stakedAmount: string,
	startDay: string,
	lockDays: string
	endDay: string,
	interest: string,
	penalty: string,
	sharesCount: string,
	startTx: string,
	endTx: string,
	startedAt: string,
	completedAt: string,
	canceledAt: string,
	timestamp: string,
	blockNumber: string,
	gasPrice: string,
	gasUsed: string,
    feedType: string,
    transactionFeeInUsd: number,
    roi: string,
    deftInUsd: string,
    rewardAmount: number
}

export async function createMessage(options: Message, constants, logger) {
    let emoji;
    let boundEmoji;
    let additionalInfo = '';
    const stakeType = [options.feedType.slice(5), options.feedType.slice(0, 5)].join(' ');
    // const ROI = -1// (((Number(options.stakedAmount) - Number(options.penalty)) / options.amountWise) * 100).toFixed(2);
    let days;
    
    switch(options.feedType) {
        case "stakeCanceled":
            emoji = "📕";
            boundEmoji = "⚫️"
            additionalInfo = `🚫 Penalty: ${numWithCommas(Math.ceil(+options.penalty))} CERBY (${numWithCommas(Math.ceil((Math.abs(options.rewardAmount) * +options.deftInUsd) * 1e3) / 1e3)}$)\n`
                           + `📉 ROI: ${Math.ceil(+options.roi * 100) / 100}%\n\n`;
            days = +options.endDay - +options.startDay + 1
            break;
        case "stakeCompleted":
            emoji = "📗"
            boundEmoji = "🟣"
            additionalInfo = `${options.rewardAmount > 0 ? '💰 Reward' : '🚫 Penalty'}: ${numWithCommas(Math.ceil(Math.abs(options.rewardAmount)))} CERBY (${numWithCommas(Math.ceil((Math.abs(options.rewardAmount) * +options.deftInUsd) * 1e3) / 1e3)}$)\n` +
                             `📉 ROI: ${Math.ceil(+options.roi * 100) / 100}%\n\n`;
            days = +options.endDay - +options.startDay + 1;
            break;
        case "stakeStarted":
            emoji = "📘";
            boundEmoji = "🔵";
            days = options.lockDays
            break;
        default:
            logger.error(`No bid found.\nReceived data: ${JSON.stringify(options)}`)
            throw 'error no bid';
    }
     return `${emoji} ${stakeType} of *${numWithCommas(Math.floor(+options.stakedAmount * 1000) / 1000)} CERBY* (${numWithCommas(Math.floor(+options.stakedAmount * +options.deftInUsd))}$) ${options.feedType == "stakeStarted" ? "for" : "after"} ${days} days ${getDate(days, +options.timestamp * 1e3)}long on ${constants.token} (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(+options.stakedAmount * +options.deftInUsd, constants, boundEmoji)}\n\n` +
            additionalInfo +
            `From address: [${shortenAddress(options.owner.id)}](${constants.scanURL}address/${options.owner.id})\n\n` +
            `🥩 [Staking](https://app.cerby.fi/staking) | 📶 [Tx Hash](${constants.scanURL}tx/${options.feedType == "stakeStarted" ? options.startTx : options.endTx}) | 💥 [Powered by CERBY Token](https://t.me/CerbyToken)`
}