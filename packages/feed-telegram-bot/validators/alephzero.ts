import { Message } from '../messageCreators/alephzero';

export function validate(config, msg: Message): boolean {
    if(msg.feedType == 'deposit'
       ? ( config.noDeposit  || (config.noDepositFrom  && (config.noDepositFrom  as string[]).includes(msg.from)))
       : ( config.noWithDraw || (config.noWithDrawFrom && (config.noWithDrawFrom as string[]).includes(msg.to)))
    ) {
        return false; 
    }
    return (config.minALEPH ? +msg.amount >= config.minALEPH : true) && (config.minUSD ? +msg.amount * +msg.price >= config.minUSD : true);
}