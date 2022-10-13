import { EntitySchema } from '@mikro-orm/core';
import { Sub } from '../entities/Sub';

export const schema = new EntitySchema<Sub>({
  class: Sub,
  tableName: 'subs',
  properties: {
    id: { type: 'number', primary: true },
    name: { type: 'string', nullable: false },
    aggregate: { reference: 'm:1', entity: 'AggregateRoot' },
  },
});
