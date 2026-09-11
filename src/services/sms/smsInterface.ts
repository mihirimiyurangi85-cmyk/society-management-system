export interface SmsMessage {
  recipientPhone: string;
  messageText: string;
  metadata?: Record<string, any>;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ISmsProvider {
  sendSms(message: SmsMessage): Promise<SmsResult>;
  sendBulkSms(messages: SmsMessage[]): Promise<SmsResult[]>;
}
