export const dateFormat = (isoString: string | number | Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  return formatter.format(new Date(isoString));
}
