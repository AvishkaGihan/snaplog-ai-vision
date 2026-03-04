import { Timestamp } from "firebase/firestore";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function formatDate(
  date: Timestamp | string | null | undefined,
): string {
  if (!date) {
    return "—";
  }

  try {
    let jsDate: Date;

    if (date instanceof Timestamp) {
      jsDate = date.toDate();
    } else if (
      typeof date === "object" &&
      date !== null &&
      "seconds" in date
    ) {
      jsDate = new Date((date as { seconds: number }).seconds * 1000);
    } else if (typeof date === "string") {
      jsDate = new Date(date);
    } else {
      return "—";
    }

    if (Number.isNaN(jsDate.getTime())) {
      return "—";
    }

    const month = MONTH_NAMES[jsDate.getMonth()];
    const day = jsDate.getDate();
    const year = jsDate.getFullYear();

    return `${month} ${day}, ${year}`;
  } catch {
    return "—";
  }
}
