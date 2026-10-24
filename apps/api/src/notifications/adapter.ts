import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface SmsSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export interface SmsProvider {
  name: string;
  sendSms(to: string, message: string): Promise<SmsSendResult>;
}

export class MockSmsProvider implements SmsProvider {
  name = 'mock';

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    logger.info({ to, messageLength: message.length }, '[MOCK SMS SENT] Logging to console');
    return {
      success: true,
      provider: 'mock',
      messageId: `mock-msg-${Date.now()}`,
    };
  }
}

export class Msg91Provider implements SmsProvider {
  name = 'msg91';

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    if (!env.MSG91_AUTH_KEY || !env.MSG91_SENDER_ID) {
      logger.warn('MSG91 credentials missing. Falling back to mock');
      return new MockSmsProvider().sendSms(to, message);
    }

    try {
      // MSG91 HTTP API integration
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: env.MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: env.MSG91_SENDER_ID,
          mobiles: to,
          message,
        }),
      });

      const data = (await response.json()) as any;
      return {
        success: response.ok,
        provider: 'msg91',
        messageId: data.message || data.requestId,
      };
    } catch (err: any) {
      logger.error({ err }, 'MSG91 delivery failure');
      return {
        success: false,
        provider: 'msg91',
        error: err.message,
      };
    }
  }
}

export class TwilioProvider implements SmsProvider {
  name = 'twilio';

  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
      logger.warn('Twilio credentials missing. Falling back to mock');
      return new MockSmsProvider().sendSms(to, message);
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');

      const params = new URLSearchParams();
      params.append('To', to);
      params.append('From', env.TWILIO_FROM_NUMBER);
      params.append('Body', message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = (await response.json()) as any;
      return {
        success: response.ok,
        provider: 'twilio',
        messageId: data.sid,
      };
    } catch (err: any) {
      logger.error({ err }, 'Twilio delivery failure');
      return {
        success: false,
        provider: 'twilio',
        error: err.message,
      };
    }
  }
}

export function getSmsProvider(): SmsProvider {
  switch (env.NOTIFICATION_PROVIDER) {
    case 'msg91':
      return new Msg91Provider();
    case 'twilio':
      return new TwilioProvider();
    default:
      return new MockSmsProvider();
  }
}
