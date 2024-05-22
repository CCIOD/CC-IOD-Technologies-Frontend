export const formatTime12to24 = (time: string): string => {
  const [timeWithoutPeriod, period] = time.split(" ");
  let hours = timeWithoutPeriod.split(":")[0];
  const minutes = timeWithoutPeriod.split(":")[1];

  if (period === "PM" && hours !== "12") hours = String(Number(hours) + 12);
  if (period === "AM" && hours === "12") hours = "00";
  return `${hours}:${minutes}`;
};

export const formatDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];
