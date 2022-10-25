import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import config from './mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...config,
      registerRequestContext: process.env.NODE_ENV !== 'test',
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
