import { Module } from '@nestjs/common';
import { PromoterCodesService } from './promoter-codes.service';
import { PromoterCodesController } from './promoter-codes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PromoterCodesController],
  providers: [PromoterCodesService],
  exports: [PromoterCodesService],
})
export class PromoterCodesModule {}

