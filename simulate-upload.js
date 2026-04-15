const fs = require('fs');
const JSZip = require('jszip');

async function test() {
  const zip = new JSZip();
  zip.file("courses.csv", "id,name,color\n1,Stats 101,");
  zip.file("trajectories.csv", "id,name,color\n1,Methods,");
  zip.file("ltos.csv", "id,trajectoryId,name,outcome,bloom\n1,1,Data Management,The student...,A2");
  zip.file("ilos.csv", "id,courseId,name,outcome,bloom,isNew,derivedFromId\n1,1,ANOVA,The student...,C3,false,");
  zip.file("mappings.csv", "ltoId,iloId\n1,1");
  
  const content = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync("test.zip", content);
}
test();
