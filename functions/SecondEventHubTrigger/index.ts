import { AzureFunction, Context } from "@azure/functions"
const { EventHubProducerClient } = require("@azure/event-hubs");

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any[]): Promise<void> {
    context.log(`Eventhub trigger function called for message array ${eventHubMessages}`);
    
    const connectionString = process.env.SECOND_EVENT_HUB_CONNECTION;
    const eventHubName = process.env.SECOND_EVENT_HUB_NAME;

    // Create a producer client to send messages to the event hub.
    const producer = new EventHubProducerClient(connectionString, eventHubName);
    
    eventHubMessages.forEach(async (message, index) => {
        context.log(`Processed message ${message}`);

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
    });
    context.done();
};

export default eventHubTrigger;
