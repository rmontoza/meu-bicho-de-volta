import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PushPayload {
  tokens: string[];
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);
  private initialized = false;
  private messaging: any = null;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const serviceAccountJson =
      this.config.get<string>('FCM_SERVICE_ACCOUNT_JSON') ??
      process.env.FCM_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
      this.logger.warn('FCM não configurado (FCM_SERVICE_ACCOUNT_JSON ausente) — push desativado');
      return;
    }

    try {
      const { initializeApp, getApps, cert } = await import('firebase-admin/app');
      const { getMessaging } = await import('firebase-admin/messaging');

      const serviceAccount = JSON.parse(serviceAccountJson);

      if (!getApps().length) {
        initializeApp({ credential: cert(serviceAccount) });
      }

      this.messaging = getMessaging();
      this.initialized = true;
      this.logger.log('FCM inicializado com sucesso');
    } catch (err) {
      this.logger.error('Erro ao inicializar FCM:', err);
    }
  }

  get isReady() {
    return this.initialized;
  }

  async sendMulticast(payload: PushPayload): Promise<{
    sent: number;
    failed: number;
    invalidTokens: string[];
  }> {
    if (!this.initialized || payload.tokens.length === 0) {
      return { sent: 0, failed: 0, invalidTokens: [] };
    }

    const message = {
      tokens: payload.tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      },
      data: payload.data ?? {},
      android: {
        priority: 'high' as const,
        notification: { sound: 'default', channelId: 'mbv-alerts' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };

    const response = await this.messaging.sendEachForMulticast(message);

    const invalidTokens: string[] = [];
    (response.responses as any[]).forEach((resp: any, idx: number) => {
      if (!resp.success) {
        const code = resp.error?.code;
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(payload.tokens[idx]);
        }
      }
    });

    return {
      sent: response.successCount,
      failed: response.failureCount,
      invalidTokens,
    };
  }
}
