import { isIfStatement } from "typescript";
import { Logger } from "../../feed-parser/helpers/logger";
import { numWithCommas, shortenAddress, createEtherscanLink } from './Radix-uniswap';

export interface Message {
    feedType: string,
    wiseInUsd: number,
    wiseInEth: number,
    amountWise: number,
    amountWiseInUsd: number,
    amountWiseInEth: number,
    transactionFeeInUsd: number,
    fromAddress: string,
    transactionHash: string,
    penalty: number,
    penaltyInUsd: number,
    rewardAmount: number,
    rewardAmountInUsd: number,
    startDay: number,
    startDate: string, // Date string
    lockDays: number,
    finalDay: number,
    closeDay?: number
}

export function generateDots(amountInUsd, constants, boundEmoji) {
    let dots = amountInUsd < 2*constants.USDInterval? 1: amountInUsd / constants.USDInterval - 1;
    dots = dots > 1000 ? 1000 : dots;
    let message = "";
    for (let i = 0; i < dots; i++)
        message += boundEmoji;
    return message;
}

export function getDate(day: number, fromTimestamp: number | string = 0) {
    let date_1 = new Date(fromTimestamp);
    let date_2 = new Date(+date_1 + (day * 86400 * 1e3));
    let date2_UTC = new Date(Date.UTC(date_2.getUTCFullYear(), date_2.getUTCMonth(), date_2.getUTCDate()));
    let date1_UTC = new Date(Date.UTC(date_1.getUTCFullYear(), date_1.getUTCMonth(), date_1.getUTCDate()));

    let days = (+date2_UTC - +date1_UTC) / (86400 * 1e3);
    console.log(days);
    if(Math.floor(days / 365)) {
        return `(${(days / 365).toFixed(1)} years) `;
    } else if(Math.floor(days / 30)) {
        return `(${(days / 30).toFixed(1)} months) `;
    } else {
        return '';
    }
}

export function createMessage(options: Message, constants, logger: Logger) {
    let emoji;
    let boundEmoji;
    let additionalInfo = '';
    const stakeType = [options.feedType.slice(5), options.feedType.slice(0, 5)].join(' ');
    const ROI = (((options.rewardAmount - options.penalty) / options.amountWise) * 100).toFixed(2);
    let days;
    switch(options.feedType) {
        case "stakeCanceled":
            emoji = "📕";
            boundEmoji = "⚫️"
            additionalInfo = `🚫 Penalty: ${numWithCommas(Math.ceil(options.penalty))} WISE ($${numWithCommas(Math.ceil(options.penaltyInUsd))})\n`
                           + `📉 ROI: ${ROI}%\n\n`;
            days = options.closeDay - options.startDay + 1
            break;
        case "stakeCompleted":
            emoji = "📗"
            boundEmoji = "🟠"
            additionalInfo = `💰 Reward: ${numWithCommas(Math.ceil(options.rewardAmount))} WISE ($${numWithCommas(Math.ceil(options.rewardAmountInUsd))})\n`
                           + `📉 ROI: ${ROI}%\n\n`;
            days = options.closeDay - options.startDay + 1;
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
     return `${emoji} ${stakeType} of *${numWithCommas(Math.floor(options.amountWise * 1000) / 1000)} WISE* (${numWithCommas(Math.floor(options.amountWiseInUsd))}$) ${options.feedType == "stakeStarted" ? "for" : "after"} ${days} days ${getDate(days, options.startDate)}long (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(options.amountWiseInUsd, constants, boundEmoji)}\n\n` +
            additionalInfo +
            `From address: [${shortenAddress(options.fromAddress)}](${createEtherscanLink("address", options.fromAddress)})\n\n` +
            `📶 [Tx Hash](${createEtherscanLink("tx", options.transactionHash)}) | 💥 [Powered by Cerby Finance](https://cerby.fi)`
}