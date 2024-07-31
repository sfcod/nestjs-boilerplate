export interface NotificationManagerInterface {
    process(...args): Promise<void>;
}
