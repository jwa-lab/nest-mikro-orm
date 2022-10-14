import { RequestContext, Transaction } from '@mikro-orm/core';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class CtxManager {
  private ctx: Transaction;

  setCtx(ctx: Transaction) {
    this.ctx = ctx;
  }

  resetCtx() {
    const ctx = this.ctx;
    delete this.ctx;
    return ctx;
  }

  getCtx(): Transaction {
    return this.ctx;
  }
}

@Injectable()
export class TransactionContextMiddleware implements NestMiddleware {
  constructor(private readonly ctx_manager: CtxManager) {}

  use(req: any, res: any, next: (error?: any) => void): any {
    const em = RequestContext.getEntityManager();
    const ctx = this.ctx_manager.getCtx();

    if (em && ctx) {
      em.setTransactionContext(ctx);
    }

    next();
  }
}
