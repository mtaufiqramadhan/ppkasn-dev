import "server-only";
import { CmsStore } from "@/lib/cms-store";
import { getProgramSubPelatihanList } from "./utils/sub-pelatihan";

/** Read the same persisted catalog used by CMS on every request. */
export function getStoredPrograms() {
  return CmsStore.getPrograms().map(program => ({
    ...program,
    subPelatihan: getProgramSubPelatihanList(program),
  }));
}

export { cmsProgramSchema } from "./schemas/cms-program-schema";
