import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly rabbitmqUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') ?? '';
  }

  async onModuleInit() {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declarar as filas que serão utilizadas
      await this.channel.assertQueue('email_notifications', { durable: true });
      await this.channel.assertQueue('ticket_generation', { durable: true });
      await this.channel.assertQueue('payment_processing', { durable: true });

      console.log('Conectado ao RabbitMQ');
    } catch (error) {
      console.error('Erro ao conectar ao RabbitMQ:', error.message);
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.error('Erro ao fechar conexão com RabbitMQ:', error.message);
    }
  }

  async sendEmailNotification(data: any) {
    if (!this.channel) {
      throw new Error('Canal RabbitMQ não está disponível');
    }

    return this.channel.sendToQueue(
      'email_notifications',
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
  }

  async sendTicketGeneration(data: any) {
    if (!this.channel) {
      throw new Error('Canal RabbitMQ não está disponível');
    }

    return this.channel.sendToQueue(
      'ticket_generation',
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
  }

  async sendPaymentProcessing(data: any) {
    if (!this.channel) {
      throw new Error('Canal RabbitMQ não está disponível');
    }

    return this.channel.sendToQueue(
      'payment_processing',
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
  }

  async consumeEmailNotifications(callback: (data: any) => Promise<void>) {
    if (!this.channel) {
      throw new Error('Canal RabbitMQ não está disponível');
    }

    await this.channel.consume('email_notifications', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await callback(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Erro ao processar mensagem de email:', error);
          this.channel.nack(msg, false, true);
        }
      }
    });
  }

  async consumeTicketGeneration(callback: (data: any) => Promise<void>) {
    if (!this.channel) {
      throw new Error('Canal RabbitMQ não está disponível');
    }

    await this.channel.consume('ticket_generation', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await callback(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Erro ao processar mensagem de geração de ingresso:', error);
          this.channel.nack(msg, false, true);
        }
      }
    });
  }

  async consumePaymentProcessing(callback: (data: any) => Promise<void>) {
    if (!this.channel) {
      throw new Error('Canal RabbitMQ não está disponível');
    }

    await this.channel.consume('payment_processing', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await callback(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Erro ao processar mensagem de pagamento:', error);
          this.channel.nack(msg, false, true);
        }
      }
    });
  }
}

