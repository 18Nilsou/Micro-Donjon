import { dbConfig, init, destroy } from './src/config/dataBase';

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await destroy();
});
