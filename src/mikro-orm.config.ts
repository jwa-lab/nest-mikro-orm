import { Options } from '@mikro-orm/core';

const config: Options = {
  type: 'postgresql',
  user: 'toto',
  password: 'tata',
  host: 'localhost',
  port: 5432,
  dbName: 'nest-mikro-orm',
  entities: ['dist/**/entity-schemas/**/*.js'],
  entitiesTs: ['src/**/entity-schemas/**/*.ts'],
  implicitTransactions: false,
  allowGlobalContext: false,
  debug: false,
};

export default config;
