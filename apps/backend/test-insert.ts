import { db } from './src/db';
import { trajectories } from './src/db/schema';

async function test() {
  for (let i = 0; i < 5; i++) {
    const name = `Test Traj ${i}`;
    const [inserted] = await db.insert(trajectories).values({
      projectId: 'test_project',
      name: name,
      color: null
    }).returning();
    console.log(`Inserted ${name}: id = ${inserted.id}`);
  }
}
test().catch(console.error);
