import { AzureFunction, Context } from "@azure/functions"

const eventHubTrigger: AzureFunction = async function (context: Context, eventHubMessages: any[]): Promise<void> {
    context.log(`FirstEventHubTrigger called with ${eventHubMessages.length} messages.`);

    const outputMessages: any[] = [];
    
    for (const message of eventHubMessages) {
        context.log(`Processed message: ${JSON.stringify(message)}`);
        outputMessages.push(message);
    }

    context.bindings.outputEventHubMessage = outputMessages;
    context.log(`Sent ${outputMessages.length} messages to the next Event Hub.`);
};

export default eventHubTrigger;
