import { z } from "zod";

const safeKey = z.string().max(100).refine(key => !["__proto__", "constructor", "prototype"].includes(key));
const scalar = z.union([z.string().max(10000), z.number().finite(), z.boolean(), z.null()]);
function boundedValue(depth: number): z.ZodType<unknown> {
  if (depth === 0) return scalar;
  const value = boundedValue(depth - 1);
  return z.union([scalar, z.array(value).max(500), z.record(safeKey, value).refine(record => Object.keys(record).length <= 100)]);
}
const record = z.record(safeKey, boundedValue(4)).refine(value => Object.keys(value).length <= 100);
export const restoreRecordsSchema = z.array(record).max(10000);
