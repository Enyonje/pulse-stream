import { Module } from '@nestjs/common';
import { IngestorService } from './ingestor.service';

@Module({
  providers: [IngestorService]
})
export class AppModule {}