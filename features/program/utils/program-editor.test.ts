import { test } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PROGRAMS } from "../data/mock-programs";
import { getProgramSubPelatihanList } from "./sub-pelatihan";
import { prepareProgramForEditor, resolveSubPelatihanDetails } from "./program-editor";
import { cmsProgramSchema } from "../schemas/cms-program-schema";

const source = MOCK_PROGRAMS[0];

test("legacy public subpelatihan and their modules become editable without mutating source", () => {
  const before = JSON.stringify(source);
  const expected = getProgramSubPelatihanList(source);
  const draft = prepareProgramForEditor(source);
  assert.equal(draft.subPelatihan?.length, expected.length);
  assert.deepEqual(draft.subPelatihan?.[0].curriculum, expected[0].curriculum);
  draft.subPelatihan![0].curriculum![0].title = "Modul yang diedit";
  assert.equal(JSON.stringify(source), before);
  assert.notEqual(getProgramSubPelatihanList(source)[0].curriculum?.[0].title, "Modul yang diedit");
});

test("saving all nested information round-trips without losing modules, contact or requirements", () => {
  const draft = prepareProgramForEditor(source);
  const child = draft.subPelatihan![0];
  child.description = "Deskripsi subpelatihan yang disimpan";
  child.curriculum = [{ title: "Silabus khusus", duration: "12 JP", description: "Materi rinci" }];
  child.requirements = ["Surat usulan khusus"];
  child.facilities = ["Laboratorium"];
  child.contactPerson = {name: "Kontak subpelatihan", role: "Koordinator", email: "sub@example.com", phone: "08123456789"};
  const saved = cmsProgramSchema.parse(draft);
  const details = resolveSubPelatihanDetails(saved, saved.subPelatihan![0]);
  assert.equal(details.fullDescription, child.description);
  assert.deepEqual(details.curriculum, child.curriculum);
  assert.deepEqual(details.requirements, child.requirements);
  assert.deepEqual(details.facilities, child.facilities);
  assert.deepEqual(details.contactPerson, child.contactPerson);
  assert.equal(saved.id, source.id);
  assert.equal(saved.slug, source.slug);
});

test("explicitly empty subpelatihan do not regenerate deleted public tracks", () => {
  assert.deepEqual(getProgramSubPelatihanList({...source, subPelatihan: []}), []);
});

test("subpelatihan overrides preserve zero counts and intentionally empty objectives", () => {
  const details = resolveSubPelatihanDetails(source, {id:"sub",title:"Sub",description:"Detail",hours:0,enrolledCount:0,objectives:[],curriculum:[]});
  assert.equal(details.hours, 0);
  assert.equal(details.enrolledCount, 0);
  assert.deepEqual(details.objectives, []);
  assert.deepEqual(details.curriculum, []);
  assert.equal(details.location, source.location);
});

test("validation rejects invalid nested modules and inverted schedules", () => {
  const draft = prepareProgramForEditor(source);
  draft.subPelatihan![0].curriculum = [{title:"",description:"Materi"}];
  assert.equal(cmsProgramSchema.safeParse(draft).success, false);
  draft.subPelatihan![0].curriculum = [];
  draft.subPelatihan![0].startDate = "2026-12-20";
  draft.subPelatihan![0].endDate = "2026-12-01";
  assert.equal(cmsProgramSchema.safeParse(draft).success, false);
});

test("validation rejects duplicate subpelatihan IDs and blank titles", () => {
  const draft = prepareProgramForEditor(source);
  draft.subPelatihan![1].id = draft.subPelatihan![0].id;
  assert.equal(cmsProgramSchema.safeParse(draft).success, false);
  const another = prepareProgramForEditor(source);
  another.subPelatihan![0].title = " ";
  assert.equal(cmsProgramSchema.safeParse(another).success, false);
});

test("existing Indonesian schedules are normalized for date inputs", () => {
  const draft = prepareProgramForEditor(source);
  assert.equal(draft.startDate, "2026-06-16");
  assert.equal(draft.endDate, "2026-09-18");
  assert.equal(draft.registrationDeadline, "2026-05-25");
  assert.equal(draft.subPelatihan![0].startDate, draft.startDate);
});

test("every existing catalog item can be edited and saved with its public hierarchy", () => {
  for (const program of MOCK_PROGRAMS) {
    const draft = prepareProgramForEditor(program);
    const result = cmsProgramSchema.safeParse(draft);
    assert.equal(result.success, true, `${program.id}: ${!result.success ? JSON.stringify(result.error.issues) : ""}`);
    assert.equal(draft.subPelatihan.length, getProgramSubPelatihanList(program).length);
  }
});
