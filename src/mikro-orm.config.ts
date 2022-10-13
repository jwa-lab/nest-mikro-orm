import { MikroOrmModuleOptions as Options } from '@mikro-orm/nestjs';

const config: Options = {
  type: 'postgresql',
  user: 'toto',
  password: 'tata',
  host: 'localhost',
  port: 5432,
  dbName: 'nest-mikro-orm',
  entities: ['dist/**/entity-schemas/**/*.js'],
  entitiesTs: ['src/**/entity-schemas/**/*.ts'],
  registerRequestContext: true,
  implicitTransactions: false,
};

export default config;
