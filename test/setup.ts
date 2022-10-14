import { MikroORM } from '@mikro-orm/core';
import { GlobalSeeder } from './seeders';

require('ts-node/register');

const setup = async (): Promise<void> => {
  const orm = await MikroORM.init();

  await orm.getSchemaGenerator().refreshDatabase();

  const seeder = orm.getSeeder();
  await seeder.seed(GlobalSeeder);

  await orm.close();
};

export default setup;
