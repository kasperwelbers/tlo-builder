import { db } from './index';
import { projects, trajectories, ltos, courses, ilos, mappings } from './schema';

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await db.delete(mappings);
  await db.delete(ltos);
  await db.delete(trajectories);
  await db.delete(ilos);
  await db.delete(courses);

  // Insert Project
  await db.insert(projects).values([
    { id: 'seed-project', name: 'Seed Project' }
  ]).onConflictDoNothing();

  // Insert Trajectories
  const [traj1] = await db.insert(trajectories).values([
    { projectId: 'seed-project', name: 'Methods' }
  ]).returning();

  // Insert LTOs
  const [lto1, lto2] = await db.insert(ltos).values([
    { trajectoryId: traj1.id, name: 'Data Management', outcome: 'The student will be able to manage data effectively...', bloom: 'A2' },
    { trajectoryId: traj1.id, name: 'Analysis', outcome: 'The student will be able to analyze data using appropriate tools...', bloom: 'C4' }
  ]).returning();

  // Insert Courses
  const [course1] = await db.insert(courses).values([
    { projectId: 'seed-project', name: 'Stats 101' }
  ]).returning();

  // Insert ILOs
  const [ilo1] = await db.insert(ilos).values([
    { courseId: course1.id, name: 'ANOVA', outcome: 'The student can perform an ANOVA test...', bloom: 'C3' },
    { courseId: course1.id, name: 'Data Cleaning', outcome: 'The student can clean raw datasets...', bloom: 'C3' }
  ]).returning();

  // Insert Mappings
  await db.insert(mappings).values([
    { ltoId: lto1.id, iloId: ilo1.id } // Linking Data Management to ANOVA (just an example)
  ]);

  console.log('Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
