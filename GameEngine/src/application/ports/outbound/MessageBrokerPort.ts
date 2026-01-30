export interface MessageBrokerPort {
  notifyAction(action: string, details: any): Promise<void>;
}