import { AzureFunction, Context } from "@azure/functions"

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    const sendingDisabled = process.env.DISABLED ? true : false;
    const topic = process.env.TOPIC ? process.env.TOPIC : 'Generator Message';
    const body = process.env.BODY ? process.env.BODY : 'Generator Message Body';

    const message = {
        topic:topic,
        body:body,
        timestamp:timeStamp,
    }

    if (myTimer.IsPastDue)
    {
        context.log('Timer function is running late!');
    }
    if (sendingDisabled) {
        context.log('Message sending disabled!');
    } else {
        if (context.bindings.outputEventHubMessage) {
            context.bindings.outputEventHubMessage.push(message);
            context.log('Message sent!');
        } else {
            context.log('Bindings are not ok!');
            context.log('context.bindings: ' + JSON.stringify(context.bindings));
        }
    }
    context.log('Timer trigger function ran!', timeStamp);
};

export default timerTrigger;