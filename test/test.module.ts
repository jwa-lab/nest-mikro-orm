import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CtxManager, TransactionContextMiddleware } from './test.middleware';

@Module({
  providers: [CtxManager],
})
class TestMiddlewareSubModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(TransactionContextMiddleware).forRoutes('*');
  }
}

@Module({
  imports: [TestMiddlewareSubModule],
})
class TestMiddlewareModule {}

@Module({
  imports: [TestMiddlewareModule],
})
export class TestModule {}
