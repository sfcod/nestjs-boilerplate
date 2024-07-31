export interface Push {
    device?: string;
    dataOnly: boolean;
    priority: 'high' | 'normal';
    data?: { [key: string]: any };
    message?: string;
    alert?: string;
    title?: string;
    sound?: string;
    badge?: number;
    android_channel_id?: string;
}
