import { Logger } from "../../feed-parser/helpers/logger";
import { numWithCommas, ScanText, CerbyFinance, fromWei, generateDots, getDate } from './helpers';

export interface Message {
    // feedType: string,
    // wiseInUsd: number,
    // wiseInEth: number,
    // amountWise: number,
    // amountWiseInUsd: number,
    // amountWiseInEth: number,
    // transactionFeeInUsd: number,
    // fromAddress: string,
    // transactionHash: string,
    // penalty: number,
    // penaltyInUsd: number,
    // rewardAmount: number,
    // rewardAmountInUsd: number,
    // startDay: number,
    // startDate: string, // Date string
    // lockDays: number,
    // finalDay: number,
    // closeDay?: number

    closeDay: string,
    cmShares: string //'50282344136920710000000',
    currentShares: string //'55070514136920710000000',
    daiEquivalent: string //'1472881177742062772513',
    endTx: string //'0xbfe4be393c94d13d575f9441827c3a0f02a1417e14748428185d1129137c0ff5',
    id: string //'0xc259d330114cb5a59250905e18cdbc96',
    lastScrapeDay: string //null,
    lockDays: string //'366',
    penalty: string //'0',
    principal: string //'4788170000000000000000',
    referrer: string //'0x16ebdd55fce5319b1a6229d19c3fa081c851548f',
    referrerSharesPenalized: string //'0',
    reward: string //'566969353130526567136',
    scrapeCount: '0',
    scrapedYodas: '0',
    shares: '55070514136920710000000',
    sharesPenalized: '0',
    staker: string//'0x7226fe8c4d65be9d03d9f6b2eaff6153e0b4a0ed',
    startDay: string //'57',
    startTx: string //'0x',
    timestamp: '1648663049'
    price: number
    feedType: "stakeStarted" | "stakeCompleted" | "stakeCanceled"
}


export function createMessage(options: Message, constants, logger: Logger) {
    let emoji;
    let boundEmoji;
    let additionalInfo = '';
    const stakeType = [options.feedType.slice(5), options.feedType.slice(0, 5)].join(' ');
    const ROI = (((fromWei(options.reward) - fromWei(options.penalty)) / fromWei(options.principal)) * 100).toFixed(2);
    let days: number;
    switch(options.feedType) {
        case "stakeCanceled":
            emoji = "📕";
            boundEmoji = "⚫️"
            additionalInfo = `🚫 Penalty: ${numWithCommas(Math.ceil(fromWei(options.penalty)))} WISE ($${numWithCommas(Math.ceil(fromWei(options.penalty) * options.price))})\n`
                           + `📉 ROI: ${ROI}%\n\n`;
            days = +options.closeDay - +options.startDay + 1
            break;
        case "stakeCompleted":
            emoji = "📗"
            boundEmoji = "🟠"
            additionalInfo = `💰 Reward: ${numWithCommas(Math.ceil(fromWei(options.reward)))} WISE ($${numWithCommas(Math.ceil(fromWei(options.reward) * options.price))})\n`
                           + `📉 ROI: ${ROI}%\n\n`;
            days = +options.closeDay - +options.startDay + 1;
            break;
        case "stakeStarted":
            emoji = "📘";
            boundEmoji = "🔵";
            days = +options.lockDays
            break;
        default:
            logger.error(`No bid found.\nReceived data: ${JSON.stringify(options)}`)
            throw 'error no bid';
    }
     return `${emoji} ${stakeType} of *${numWithCommas(Math.floor(fromWei(options.principal) * 1000) / 1000)} WISE* (${numWithCommas(Math.floor(fromWei(options.principal) * options.price))}$) ${options.feedType == "stakeStarted" ? "for" : "after"} ${days} days ${getDate(days, options.timestamp)}long\n\n` +
            `${generateDots(fromWei(options.principal) * options.price, constants, boundEmoji)}\n\n` +
            additionalInfo +
            `From address: ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.account, options.staker)}\n\n` +
            `${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.tx, options.feedType == 'stakeStarted' ? options.startTx : options.endTx)} | ${CerbyFinance}`
}