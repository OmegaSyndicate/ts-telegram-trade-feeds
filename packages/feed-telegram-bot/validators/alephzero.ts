import { Message } from '../messageCreators/alephzero';

export function validate(config, msg: Message): boolean {
    if(msg.feedType == 'deposit'
       ? ( config.noDeposit  || (config.noDepositFrom  && (config.noDepositFrom  as string[]).includes(msg.from.toLowerCase())) )
       : ( config.noWithDraw || (config.noWithDrawFrom && (config.noWithDrawFrom as string[]).includes(msg.to.toLowerCase())) )
    ) {
        return false; 
    }
    return +msg.amount >= config.minALEPH;
}