// Old version
// export function numWithCommas(number) {
//     return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }

// New version
export function numWithCommas(number: number | string) {
    let strNum = String(number);
    return Math.floor(+number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (~strNum.indexOf('.') ? strNum.slice(strNum.indexOf('.')) : '');
}

function shortenAddress(address: string) {
    switch(address.toLowerCase()) {
        case "0x8149C0a6f5b5417d30F70e00a05d8D15CF471853".toLowerCase():
            return "Cerby Stablecoin Reserve"
        case "0x72aCC602f185692b80d66f933Bb679b04aD4583d".toLowerCase():
            return "Cerby Business Development Fund";
        case "0x43cFD604C3a59f2eE315d25D5D982257D9D28a3E".toLowerCase():
            return "MaratCerby";
        case "0xaeF1352112eE0E98148A10f8e7AAd315c738E98b".toLowerCase():
            return "Cerby Team #2";
        case "0x72fe4aB74214f88e48eF39e7B7Fee7a25085e851".toLowerCase():
            return "Cerby Team #3";
        case "0xBD50733cE43871F80AdFb344aB6F7C43B666763F".toLowerCase():
            return "Cerby Team #4";
        case "0x9980a0447456b5cdce209D7dC94820FF15600022".toLowerCase():
            return "BridgeFeesWallet";
        case "5FsWP1GxpzT11xyFBojKpE75pzp54ESDA6BYbRMPJ2nsCZE5".toLowerCase():
            return "GateColdWallet";
    }
    return address.substring(0, 6) + "..." + address.substring(address.length - 5);
}

export function createEtherscanLink(type: "address" | "tx", address: string) {
    return `https://etherscan.io/${type}/${address}`
}

export namespace ScanText {
    export enum ScanChain {
        BSC,
        ETH,
        Polygon,
        Avax,
        FTM,
        AlephZeroSubscan
    }

    export enum ScanType {
        account,
        tx
    }

    export function createScanText(chain: ScanChain, type: ScanType, address: string) {
        const ScanHost = ((): string => {
            switch(chain) {
                case ScanChain.BSC:
                    return `bscscan.com`;
                case ScanChain.Polygon:
                    return `polygonscan.com`;
                case ScanChain.Avax:
                    return `snowtrace.io`;
                case ScanChain.FTM:
                    return `ftmscan.com`;
                case ScanChain.AlephZeroSubscan:
                    return `alephzero.subscan.io`;
                case ScanChain.ETH:
                default:
                    return `etherscan.io`;
            }
        })();
        return (type == ScanType.tx ? "📶 [Tx Hash]" : `[${shortenAddress(address)}]`) +
            `(https://${ScanHost}/${
                type == ScanType.account
                ? (chain == ScanChain.AlephZeroSubscan ? "account" : "address")
                : (chain == ScanChain.AlephZeroSubscan ? "extrinsic" : "tx")
            }/${address})`;
    }

    export class generateScanText {
        chain: ScanChain
        constructor(chain?: ScanChain) {
            if(chain) {
                this.chain = chain;
            }
        }
        setChain(chain: ScanChain) {
            this.chain = chain;
        }
        createLink(type: ScanType, address: string) {
            if(this.chain == undefined) {
                throw "Chain is not defined";
            } else {
                return createScanText(this.chain, type, address);
            }
        }
    }
}

// OLD
// export function generateDots(options: Message | any, constants) {
//     var dots = options.amountRadixInUsd < 2*constants.USDInterval? 1: options.amountRadixInUsd / constants.USDInterval - 1;
//     dots = dots > 1000 ? 1000 : dots;
//     let message = "";
//     for (let i = 0; i < dots; i++)
//         message += (options.feedType == "uniswapBuy" ? "🟢" : "🔴");
//     return message;
// }


export function generateDots(amountInUsd: number, constants, boundEmoji: string) {
    let dots = amountInUsd < 2*constants.USDInterval? 1: amountInUsd / constants.USDInterval - 1;
    dots = dots > 1000 ? 1000 : dots;
    let message = "";
    for (let i = 0; i < dots; i++)
        message += boundEmoji;
    return message;
}

// export function dateFromDayWise(day: number) {
//     var date = new Date(1604966400000); // initialize a date in `year-01-01`
  
//     date.setDate(date.getDate() + day);

//     return date;
// }

export function getDate(day: number, endTimestamp: number | string = 0) {
    let date_1 = new Date(endTimestamp ? +endTimestamp - day * 86400 * 1e3 : 0);
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

export function fromWei(num: string | number): number {
    return +num / 1e18;
}


export function getDoubleOffset(num: number) {
    if(num < 10) {
        let numString = String(num).slice(2);
        let offset = 0;
        for(; numString[offset] == '0'; offset++) {}
        return offset + 4;
    } else if(num < 100) {
        return 2;
    } else {
        return 0;
    }
}


export const CerbyFinance = `💥 [Powered by Cerby Finance](https://cerby.fi)`;
export const CerbyFinanceRU = `💥 [При поддержке Cerby Finance](https://cerby.fi)`;