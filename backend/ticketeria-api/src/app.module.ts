import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { OrdersModule } from './orders/orders.module';
import { PromoterCodesModule } from './promoter-codes/promoter-codes.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    TicketsModule,
    OrdersModule,
    PromoterCodesModule,
    ReportsModule,
    PaymentsModule,
    DashboardModule,
    MessagingModule,
  ],
})
export class AppModule {}

