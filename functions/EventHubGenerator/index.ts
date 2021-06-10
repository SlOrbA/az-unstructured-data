import { AzureFunction, Context } from "@azure/functions"
const { EventHubProducerClient } = require("@azure/event-hubs");

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
    var timeStamp = new Date().toISOString();

    const sendingDisabled = process.env.DISABLED ? true : false;
    const topic = process.env.TOPIC ? process.env.TOPIC : 'Generator Message';
    const body = process.env.BODY ? process.env.BODY : 'Generator Message Body';

    const connectionString = process.env.GENERATOR_EVENT_HUB_CONNECTION;
    const eventHubName = process.env.ENDPOINT_EVENT_HUB_NAME;  

    // Create a producer client to send messages to the event hub.
    const producer = new EventHubProducerClient(connectionString, eventHubName);

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
            
            // Prepare a batch of three events.
            const batch = await producer.createBatch();
            batch.tryAdd(message);

            // Send the batch to the event hub.
            await producer.sendBatch(batch);

            // Close the producer client.
            await producer.close();

            console.log("A batch of three events have been sent to the event hub");
        }

    }
    context.log('Timer trigger function ran!', timeStamp);
};

export default timerTrigger;