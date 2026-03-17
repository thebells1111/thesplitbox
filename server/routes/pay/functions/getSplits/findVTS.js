export default function findVTS(data, timestamp) {
  for (let i = 0; i < data?.length; i++) {
    const current = data[i];
    const next = data[i + 1];

    const startTime = parseFloat(current["@_startTime"]);
    const endTime = current["@_endTime"]
      ? parseFloat(current["@_endTime"])
      : next
      ? parseFloat(next["@_startTime"])
      : startTime + parseFloat(current["@_duration"]);

    if (timestamp >= startTime && timestamp < endTime) {
      return current;
    }
  }
  return null; // Return null if no match is found
}
