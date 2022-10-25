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
