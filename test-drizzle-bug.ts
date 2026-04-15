import { db } from './apps/backend/src/db/index';
import { trajectories, ltos } from './apps/backend/src/db/schema';
import { eq } from 'drizzle-orm';

async function test() {
  await db.delete(ltos);
  await db.delete(trajectories);
  
  const trajs = await db.insert(trajectories).values([
    { projectId: 'bug_test', name: 'T1' },
    { projectId: 'bug_test', name: 'T2' }
  ]).returning();
  
  console.log("Trajectories inserted:", trajs);
  
  const ltosToInsert = [
    { trajectoryId: trajs[0].id, name: 'LTO1', outcome: '1' },
    { trajectoryId: trajs[0].id, name: 'LTO2', outcome: '2' },
    { trajectoryId: trajs[1].id, name: 'LTO3', outcome: '3' },
    { trajectoryId: trajs[1].id, name: 'LTO4', outcome: '4' }
  ];
  
  const insertedLtos = await db.insert(ltos).values(ltosToInsert).returning();
  console.log("LTOs inserted (returning):", insertedLtos.map(l => ({ name: l.name, trajId: l.trajectoryId })));
  
  const queriedLtos = await db.select().from(ltos);
  console.log("LTOs in DB:", queriedLtos.map(l => ({ name: l.name, trajId: l.trajectoryId })));
}

test().catch(console.error);
