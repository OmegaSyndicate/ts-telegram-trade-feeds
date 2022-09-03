import { numWithCommas, generateDots, ScanText, CerbyFinance } from "./helpers";
export interface Message {
    amountDeft: string,
    amountDeftInUsd: string,
    blockNumber: string,
    feedType: 'buy' | 'sell',
    from: string,
    id: string,
    logIndex: string,
    sender: string,
    timestamp: string,
    to: string,
    transactionFeeInEth: string,
    txHash: string,
    transactionFeeInUsd: string,
    otherInUsdPrice: string,
    deftInUsd: string
}

export function createMessage(options: any, constants) {
    const scanByChain = new ScanText.generateScanText();
    switch(constants.pair) {
        case "Eth":
            scanByChain.setChain(ScanText.ScanChain.ETH);
            break;
        case "Matic":
            scanByChain.setChain(ScanText.ScanChain.Polygon);
            break;
        case "Bnb":
            scanByChain.setChain(ScanText.ScanChain.BSC);
            break;
        case "Avax":
            scanByChain.setChain(ScanText.ScanChain.Avax);
            break;
        case "Ftm":
            scanByChain.setChain(ScanText.ScanChain.FTM);
            break;
        default:
            throw "Error, symbol not found!";
    }

    options.deftInUsd = +options.amountDeftInUsd / +options.amountDeft;
     return `${options.feedType == "buy" ? "🚀" : "👹"} *1 CERBY = ${Number(options.deftInUsd).toFixed(7)} ${constants.token.toUpperCase()}*\n` +
            `${options.feedType == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.floor(options.amountDeft * 1000) / 1000)} CERBY* for *${numWithCommas(Math.ceil(options.amountDeftInUsd * 1000) / 1000)} ${constants.token.toUpperCase()}* on ${constants.stakingType == "Uniswap" ? "Uniswap V3" : constants.stakingType} (Gas Fee: $${numWithCommas(Math.ceil(options.transactionFeeInUsd))})\n\n` +
            `${generateDots(options.amountDeftInUsd, constants, options.feedType == "buy" ? "🟢" : "🔴")}\n\n` +
            `From address: ${scanByChain.createLink(ScanText.ScanType.account, options.from)}\n\n` +
            `${constants.chain} | ${scanByChain.createLink(ScanText.ScanType.tx, options.txHash)} ${constants.DexToolsLink ? `| 📊 [Dextools](${constants.DexToolsLink}) ` : ''}${CerbyFinance}`
}