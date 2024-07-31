import { InvocationType, InvokeCommand, LambdaClient, LogType, InvokeCommandOutput } from '@aws-sdk/client-lambda';

export const invokeLambda = async (lambdaFunctionName: string, payload: any): Promise<InvokeCommandOutput> => {
    const lambdaClient = new LambdaClient({
        credentials: {
            secretAccessKey: process.env.AWS_S3_SECRET,
            accessKeyId: process.env.AWS_S3_KEY,
        },
        region: process.env.AWS_S3_REGION,
    });

    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const params = {
        FunctionName: lambdaFunctionName,
        InvocationType: InvocationType.RequestResponse,
        LogType: LogType.None,
        Payload: payloadStr,
    };

    try {
        const command = new InvokeCommand(params);

        return await lambdaClient.send(command);
    } catch (error) {
        console.error('Error invoking lambda:', error);
        throw error;
    }
};
