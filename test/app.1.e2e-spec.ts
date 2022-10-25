import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MikroORM, Transaction } from '@mikro-orm/core';
import { AggregateRoot } from '../src/entities/AggregateRoot';
import { PostgreSqlDriver } from '@mikro-orm/postgresql/PostgreSqlDriver';

describe('app.1', () => {
  let app: INestApplication;
  let orm: MikroORM<PostgreSqlDriver>;
  let main_trx: Transaction;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication().enableShutdownHooks();
    await app.init();

    orm = app.get(MikroORM);

    main_trx = await orm.em.getConnection().begin();
    orm.em.setTransactionContext(main_trx);
  });

  beforeEach(async () => {
    const test_trx = await orm.em.getConnection().begin({ ctx: main_trx });
    orm.em.setTransactionContext(test_trx);
  });

  afterEach(async () => {
    const test_trx = orm.em.getTransactionContext();
    await orm.em.getConnection().rollback(test_trx);

    orm.em.setTransactionContext(main_trx);
    orm.em.clear();
  });

  afterAll(async () => {
    await orm.em.getConnection().rollback(main_trx);
    await app.close();
  });

  it('can fetch entities from global seeder', async () => {
    const global_aggregate = await orm.em.findOne(
      AggregateRoot,
      'f35b0b66-4cd1-4cad-8ea4-32d710e82dff',
    );
    expect(global_aggregate).toBeInstanceOf(AggregateRoot);
    expect(global_aggregate?.getName()).toEqual('global aggregate');
  });
});
