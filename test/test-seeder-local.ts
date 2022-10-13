import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { AggregateRoot } from '../src/entities/AggregateRoot';

export class TestSeederLocal extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const local_aggregate = new AggregateRoot(
      '6347d147-330c-42e0-9aa7-925a457f35b9',
      'local seeder aggregate',
    );

    local_aggregate.addSub('local seeder sub');

    em.persist(local_aggregate);
  }
}
