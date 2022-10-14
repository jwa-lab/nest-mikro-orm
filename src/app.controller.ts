import { Controller, Get } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AggregateRoot } from './entities/AggregateRoot';

@Controller()
export class AppController {
  constructor(private readonly em: EntityManager) {}

  @Get()
  async newAggregate(): Promise<string> {
    const aggregate = new AggregateRoot(
      '6bab4f7d-0614-4480-a4c3-caa8343ca152',
      'controller aggregate',
    );

    this.em.persist(aggregate);
    await this.em.flush();

    return 'ok';
  }
}
