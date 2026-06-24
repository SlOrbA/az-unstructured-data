import { AzureFunction, Context } from "@azure/functions"

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    const timeStamp = new Date().toISOString();

    const sendingDisabled = process.env.DISABLED ? true : false;
    const topic = process.env.TOPIC ? process.env.TOPIC : 'Generator Message';
    const body = process.env.BODY ? process.env.BODY : 'Generator Message Body';

    const message = {
        topic: topic,
        body: body,
        timestamp: timeStamp,
    };

    if (myTimer.IsPastDue) {
        context.log('Timer function is running late!');
    }

    if (sendingDisabled) {
        context.log('Message sending disabled!');
    } else {
        context.bindings.outputEventHubMessage = [message];
        context.log('Message sent via output bindings!');
    }
    context.log('Timer trigger function ran!', timeStamp);
};

export default timerTrigger;