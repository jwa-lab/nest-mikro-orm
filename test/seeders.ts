import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { AggregateRoot } from '../src/entities/AggregateRoot';

export class GlobalSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const global_aggregate = new AggregateRoot(
      'f35b0b66-4cd1-4cad-8ea4-32d710e82dff',
      'global aggregate',
    );

    em.persist(global_aggregate);
  }
}

export class TestSuiteSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const suite_aggregate = new AggregateRoot(
      '9ec8ec6b-29c9-4f01-97f0-7eab6e7bf600',
      'suite aggregate',
    );

    em.persist(suite_aggregate);
  }
}

export class TestSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const test_aggregate = new AggregateRoot(
      '6347d147-330c-42e0-9aa7-925a457f35b9',
      'test aggregate',
    );

    em.persist(test_aggregate);
  }
}
