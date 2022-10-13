import { EntitySchema } from '@mikro-orm/core';
import { AggregateRoot } from '../entities/AggregateRoot';

export const schema = new EntitySchema<AggregateRoot>({
  class: AggregateRoot,
  tableName: 'aggregate',
  properties: {
    id: { type: 'string', primary: true },
    name: { type: 'string', nullable: false },
    subs: { reference: '1:m', entity: 'Sub', mappedBy: 'aggregate' },
  },
});
