import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { MikroORM, Transaction } from '@mikro-orm/core';
import { TestSuiteSeeder } from './seeders';
import { AggregateRoot } from '../src/entities/AggregateRoot';
import { EntityManager } from '@mikro-orm/postgresql';
import { PostgreSqlDriver } from '@mikro-orm/postgresql/PostgreSqlDriver';
import { TestModule } from './test.module';
import { CtxManager } from './test.middleware';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let em: EntityManager;
  let main_trx: Transaction;
  let ctx_manager: CtxManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = module.createNestApplication().enableShutdownHooks();
    await app.init();

    const orm: MikroORM<PostgreSqlDriver> = app.get(MikroORM);
    ctx_manager = app.get(CtxManager);

    em = orm.em.fork();

    main_trx = await em.getConnection().begin();
    em.setTransactionContext(main_trx);

    const suite_seeder = new TestSuiteSeeder();
    await suite_seeder.run(em);
    await em.flush();
    em.clear();
  });

  beforeEach(async () => {
    const test_trx = await em.getConnection().begin({ ctx: main_trx });
    em.setTransactionContext(test_trx);
    ctx_manager.setCtx(test_trx);
  });

  afterEach(async () => {
    const test_trx = ctx_manager.resetCtx();
    await em.getConnection().rollback(test_trx);
    em.clear();
  });

  afterAll(async () => {
    await em.getConnection().rollback(main_trx);
    await app.close();
  });

  it('Entities created from global and test suite seeders are available', async () => {
    const global_aggregate = await em.findOne(
      AggregateRoot,
      'f35b0b66-4cd1-4cad-8ea4-32d710e82dff',
    );
    expect(global_aggregate).toBeInstanceOf(AggregateRoot);
    expect(global_aggregate?.getName()).toEqual('global aggregate');

    const suite_aggregate = await em.findOne(
      AggregateRoot,
      '9ec8ec6b-29c9-4f01-97f0-7eab6e7bf600',
    );
    expect(suite_aggregate).toBeInstanceOf(AggregateRoot);
    expect(suite_aggregate?.getName()).toEqual('suite aggregate');
  });
});
