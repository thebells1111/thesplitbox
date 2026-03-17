import clone from "just-clone";

//helper functions to convert shares to percentages
export default function normalizeSplits(destinations, percentage = 100) {
  if (!destinations || destinations?.length === 0) {
    return { feesDestinations: [], splitsDestinations: [] };
  }
  destinations = [].concat(destinations);
  let feesDestinations = [];
  let splitsDestinations = [];
  let splitTotal = 0;

  // Calculate the total of the splits
  destinations.forEach((v) => {
    if ((!v["@_fee"] || v["@_fee"] === false) && Number(v["@_split"])) {
      splitTotal += Number(v["@_split"]);
    }
  });

  // Normalize splits and apply percentage multiplier
  destinations.forEach((v) => {
    if (!v["@_fee"] || v["@_fee"] === false) {
      if (Number(v["@_split"])) {
        v["@_split"] = (Number(v["@_split"]) / splitTotal) * 100; // Normalize the split to a percentage
        v["@_split"] *= percentage / 100; // Apply the percentage multiplier
      }
      splitsDestinations.push(clone(v));
    } else {
      feesDestinations.push(clone(v));
    }
  });

  return { feesDestinations, splitsDestinations };
}
