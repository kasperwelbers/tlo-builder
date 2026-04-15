import { db } from './src/db';
import { trajectories } from './src/db/schema';

async function test() {
  const toInsert = [
    { projectId: 'test_project_batch', name: 'A', color: null },
    { projectId: 'test_project_batch', name: 'B', color: null },
    { projectId: 'test_project_batch', name: 'C', color: null },
    { projectId: 'test_project_batch', name: 'D', color: null }
  ];
  
  const inserted = await db.insert(trajectories).values(toInsert).returning();
  console.log(inserted);
}
test().catch(console.error);
