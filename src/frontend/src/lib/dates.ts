export const DISPLAY_TIME_ZONE = "Asia/Ho_Chi_Minh";
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: DISPLAY_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
export function formatBusinessTime(utc: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T.*Z$/.test(utc) || !Number.isFinite(Date.parse(utc)))
    throw new RangeError("Expected a UTC ISO timestamp");
  return formatter.format(new Date(utc)).replace(",", "");
}
function localDayStart(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
    throw new RangeError("Expected YYYY-MM-DD");
  const timestamp = Date.parse(`${day}T00:00:00Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== day
  )
    throw new RangeError("Invalid calendar day");
  // Business dates use modern Vietnam time, UTC+07 without daylight saving.
  if (day < "1976-01-01")
    throw new RangeError(
      "Historical timezone dates are outside the business range",
    );
  return timestamp - 7 * 60 * 60 * 1000;
}
/** Inclusive local start/end dates produce a half-open [from, toExclusive) UTC window. */
export function localDateWindow(from: string, through = from) {
  const start = localDayStart(from);
  const end = localDayStart(through);
  if (end < start) throw new RangeError("End date precedes start date");
  return {
    from: new Date(start).toISOString(),
    toExclusive: new Date(end + 86_400_000).toISOString(),
  };
}
