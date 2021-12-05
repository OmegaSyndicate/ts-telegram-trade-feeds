import { shortenAddress, createEtherscanLink, numWithCommas } from "./Radix-uniswap";
import { generateDots } from "./Wise-stakes-uniswap";

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
    let link, from;
    switch(options.Mint.symbol) {
        case "BSC":
            link = `https://bscscan.com/tx/${options.Mint.txHash}`;
            from = `https://bscscan.com/address/${options.Mint.sender}`;
            break;
        case "ETH":
            link = createEtherscanLink('tx', options.Mint.txHash);
            from = createEtherscanLink("address", options.Mint.sender);
            break;
        case "Polygon":
            link = `https://polygonscan.com/tx/${options.Mint.txHash}`;
            from = `https://polygonscan.com/address/${options.Mint.sender}`
            break;
        case "Avax":
            link = `https://snowtrace.io/tx/${options.Mint.txHash}`;
            from = `https://snowtrace.io/address/${options.Mint.sender}`;
            break;
        case "FTM":
            link = `https://ftmscan.com/tx/${options.Mint.txHash}`;
            from = `https://ftmscan.com/address/{options.Mint.sender}`;
            break;
        default:
            throw "Error, symbol not found! "
    }
    return `🌉 Bridged *${numWithCommas((Number(options.Mint.amount) / 1e6).toFixed(3))} Million CERBY* ($${numWithCommas((Number(options.Mint.amount) * Number(options.price)).toFixed(2))}) from ${options.Burn.symbol} to ${options.Mint.symbol} chain\n` +
        `From address: [${shortenAddress(options.Burn.sender)}](${from})\n\n` +
        `${generateDots(Number(options.Mint.amount) * Number(options.price), constants, '🟠')}\n\n` +
        `🌉 [Bridge](https://bridge.cerby.fi) | 📶 [Tx Hash](${link}) | 💥 [Powered by CERBY Token](https://t.me/CerbyToken)`;
}