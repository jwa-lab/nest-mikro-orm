import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import config from './mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot({ ...config, registerRequestContext: true }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
