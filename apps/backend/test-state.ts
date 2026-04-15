import { db } from './src/db';
import { trajectories } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function test() {
  const all = await db.query.trajectories.findMany({
    where: eq(trajectories.projectId, 'test_project'),
    with: { ltos: true }
  });
  console.log(JSON.stringify(all, null, 2));
}
test().catch(console.error);
