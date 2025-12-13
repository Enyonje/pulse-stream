import { Module } from '@nestjs/common';
import { EnricherService } from './enricher.service';

@Module({
  providers: [EnricherService]
})
export class AppModule {}