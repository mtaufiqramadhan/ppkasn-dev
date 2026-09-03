import { format } from "date-fns";

export const DateUtils = {
  toISODate: (d?: Date | null): string | null =>
    d ? format(d, "yyyy-MM-dd") : null,

  isoDateOnly: (iso: string): string => iso.split("T")[0],

  parseTimeToMinutes: (t: string): number => {
    const [hh, mm] = t.split(":").map((s) => parseInt(s, 10));
    return (Number.isNaN(hh) ? 0 : hh) * 60 + (Number.isNaN(mm) ? 0 : mm);
  },

  dateRangesOverlap: (
    aStartISO: string,
    aEndISO: string,
    bStartISO: string,
    bEndISO: string
  ): boolean => {
    const aStart = new Date(DateUtils.isoDateOnly(aStartISO));
    const aEnd = new Date(DateUtils.isoDateOnly(aEndISO));
    const bStart = new Date(DateUtils.isoDateOnly(bStartISO));
    const bEnd = new Date(DateUtils.isoDateOnly(bEndISO));
    return !(aEnd < bStart || bEnd < aStart);
  },

  timesOverlap: (
    aStartTime: string,
    aEndTime: string,
    bStartTime: string,
    bEndTime: string
  ): boolean => {
    const aS = DateUtils.parseTimeToMinutes(aStartTime);
    const aE = DateUtils.parseTimeToMinutes(aEndTime);
    const bS = DateUtils.parseTimeToMinutes(bStartTime);
    const bE = DateUtils.parseTimeToMinutes(bEndTime);
    return !(aE <= bS || bE <= aS);
  },
};
