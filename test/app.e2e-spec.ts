import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { EntityManager, MikroORM, Transaction } from '@mikro-orm/core';
import { TestSeederLocal } from './test-seeder-local';
import { SeedManager } from '@mikro-orm/seeder';
import { AggregateRoot } from '../src/entities/AggregateRoot';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let em: EntityManager;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication().enableShutdownHooks();
    await app.init();

    orm = app.get(MikroORM);
    await orm.getSchemaGenerator().refreshDatabase();
  });

  beforeEach(async () => {
    em = orm.em.fork();
    await em.begin();
  });

  afterEach(async () => {
    await em.rollback();
    em.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1: Persist entity with EntityManager', async () => {
    const test_aggregate = new AggregateRoot(
      '9e88a21f-f3b1-48ef-b652-c1935a8d39ac',
      'test aggregate',
    ).addSub('test sub 1');

    em.persist(test_aggregate);
    await em.flush();
    em.clear();

    const aggregate = await em.findOneOrFail(
      AggregateRoot,
      '9e88a21f-f3b1-48ef-b652-c1935a8d39ac',
    );

    expect(aggregate.getName()).toEqual('test aggregate');
  });

  it('2. Entity from previous test has been rollbacked', async () => {
    const aggregate = await em.findOne(
      AggregateRoot,
      '9e88a21f-f3b1-48ef-b652-c1935a8d39ac',
    );

    expect(aggregate).toBeNull();
  });

  it('3. Persist entity with Seeder', async () => {
    const seeder = new SeedManager(em);
    await seeder.seed(TestSeederLocal);
    await em.flush();
    em.clear();

    const aggregate = await em.findOneOrFail(
      AggregateRoot,
      '6347d147-330c-42e0-9aa7-925a457f35b9',
    );

    expect(aggregate.getName()).toEqual('local seeder aggregate');
  });

  it('4. Entity from Seeder is not rollbacked', async () => {
    const aggregate = await em.findOneOrFail(
      AggregateRoot,
      '6347d147-330c-42e0-9aa7-925a457f35b9',
    );

    expect(aggregate.getName()).toEqual('local seeder aggregate');
  });

  it('5. Persist entity by sending a request to a controller', async () => {
    const result = await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('ok');

    const aggregate = await em.findOneOrFail(
      AggregateRoot,
      '6bab4f7d-0614-4480-a4c3-caa8343ca152',
    );

    expect(aggregate.getName()).toEqual('controller aggregate');

    return result;
  });

  it('6. Entity created in controller is not rollbacked', async () => {
    const aggregate = await em.findOneOrFail(
      AggregateRoot,
      '6bab4f7d-0614-4480-a4c3-caa8343ca152',
    );

    expect(aggregate.getName()).toEqual('controller aggregate');
  });
});
