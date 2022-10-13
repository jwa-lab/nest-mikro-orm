import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';

@Module({
  imports: [MikroOrmModule.forRoot()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
