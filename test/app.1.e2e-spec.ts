import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MikroORM, Transaction } from '@mikro-orm/core';
import { TestSeeder, TestSuiteSeeder } from './seeders';
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
      imports: [
        // Import the AppModule without any change to config
        AppModule,
        // Add the test module to register the TransactionContextMiddleware
        TestModule,
      ],
    }).compile();

    app = module.createNestApplication().enableShutdownHooks();
    await app.init();

    const orm: MikroORM<PostgreSqlDriver> = app.get(MikroORM);
    ctx_manager = app.get(CtxManager);

    // Fork is required otherwise we get "ValidationError: Using global EntityManager ..."
    // when running the seeder
    em = orm.em.fork();

    // Start the main transaction for the whole the test suite
    main_trx = await em.getConnection().begin();
    em.setTransactionContext(main_trx);

    // Execute test suite seeder: data will be available in all tests
    const suite_seeder = new TestSuiteSeeder();
    await suite_seeder.run(em);
    await em.flush();
    em.clear();
  });

  beforeEach(async () => {
    // Fork is not required here because we already forked in beforeAll, and
    // so we don't get "ValidationError: Using global EntityManager ..."
    // em = em.fork();

    // Create a "sub-transaction" / "nested transaction" dedicated for the test
    const test_trx = await em.getConnection().begin({ ctx: main_trx });

    // Use that transaction in the em, this allows to use it in each test to insert
    // specific tests data
    em.setTransactionContext(test_trx);

    // Put the transaction in the ContextManager
    // This will make the transaction available in the TransactionContextMiddleware
    ctx_manager.setCtx(test_trx);
  });

  afterEach(async () => {
    // Reset the ContextManager from its reference to the test transaction
    const test_trx = ctx_manager.resetCtx();

    // Rollback the test transaction
    await em.getConnection().rollback(test_trx);
    em.clear();
  });

  afterAll(async () => {
    // Rollback the main transaction
    await em.getConnection().rollback(main_trx);
    await app.close();
  });

  it('Persist entity with seeder and controller', async () => {
    // Insert data with a seeder
    const seeder = new TestSeeder();
    await seeder.run(em);
    await em.flush();
    em.clear();

    // Insert data by sending a request to the app
    const result = await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('ok');

    em.clear();

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

    const test_aggregate = await em.findOne(
      AggregateRoot,
      '6347d147-330c-42e0-9aa7-925a457f35b9',
    );
    expect(test_aggregate).toBeInstanceOf(AggregateRoot);
    expect(test_aggregate?.getName()).toEqual('test aggregate');

    const controller_aggregate = await em.findOne(
      AggregateRoot,
      '6bab4f7d-0614-4480-a4c3-caa8343ca152',
    );
    expect(controller_aggregate).toBeInstanceOf(AggregateRoot);
    expect(controller_aggregate?.getName()).toEqual('controller aggregate');

    return result;
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

  it('Entities created in test seeder and controller are rollbacked', async () => {
    const test_aggregate = await em.findOne(
      AggregateRoot,
      '6347d147-330c-42e0-9aa7-925a457f35b9',
    );
    expect(test_aggregate).toBeNull();

    const controller_aggregate = await em.findOne(
      AggregateRoot,
      '6bab4f7d-0614-4480-a4c3-caa8343ca152',
    );
    expect(controller_aggregate).toBeNull();
  });
});
