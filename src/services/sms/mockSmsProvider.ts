import type { ISmsProvider, SmsMessage, SmsResult } from './smsInterface';

export class MockSmsProvider implements ISmsProvider {
  private sentLog: (SmsMessage & { sentAt: string; messageId: string })[] = [];

  async sendSms(message: SmsMessage): Promise<SmsResult> {
    const messageId = `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const logItem = {
      ...message,
      messageId,
      sentAt: new Date().toISOString(),
    };

    this.sentLog.push(logItem);
    console.log(`📱 [MOCK SMS SENT] To: ${message.recipientPhone} | Content: "${message.messageText}"`);

    return {
      success: true,
      messageId,
    };
  }

  async sendBulkSms(messages: SmsMessage[]): Promise<SmsResult[]> {
    const results: SmsResult[] = [];
    for (const msg of messages) {
      const res = await this.sendSms(msg);
      results.push(res);
    }
    return results;
  }

  getSentLog() {
    return this.sentLog;
  }
}

export const smsService = new MockSmsProvider();
