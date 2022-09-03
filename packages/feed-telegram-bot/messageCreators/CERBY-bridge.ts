import { generateDots, numWithCommas, ScanText, CerbyFinance } from "./helpers";

export interface Message {
    Burn: Type,
    Mint: Type,
    price: string
}

interface Type {
    symbol: string,
    amount: string,
    id: string,
    sender: string,
    timestamp: string,
    txFee: string,
    txHash: string,
    type: "Mint" | "Burn"
}

export function createMessage(options: Message, constants) {
    const scanByChain = new ScanText.generateScanText()
    switch(options.Mint.symbol) {
        case "BSC":
            scanByChain.setChain(ScanText.ScanChain.BSC);
            break;
        case "ETH":
            scanByChain.setChain(ScanText.ScanChain.ETH);
            break;
        case "Polygon":
            scanByChain.setChain(ScanText.ScanChain.Polygon);
            break;
        case "Avax":
            scanByChain.setChain(ScanText.ScanChain.Avax);
            break;
        case "FTM":
            scanByChain.setChain(ScanText.ScanChain.FTM);
            break;
        default:
            throw "Error, symbol not found!";
    }
    return `🌉 Bridged *${numWithCommas((Number(options.Mint.amount) / 1e6).toFixed(3))} Million CERBY* ($${numWithCommas((Number(options.Mint.amount) * Number(options.price)).toFixed(2))}) from ${options.Burn.symbol} to ${options.Mint.symbol} chain\n` +
        `From address: ${scanByChain.createLink(ScanText.ScanType.account, options.Burn.sender)}\n\n` +
        `${generateDots(Number(options.Mint.amount) * Number(options.price), constants, '🟠')}\n\n` +
        `🌉 [Bridge](https://bridge.cerby.fi) | ${scanByChain.createLink(ScanText.ScanType.tx, options.Mint.txHash)} ${CerbyFinance}`;
}