export default function combineSplits(destinations, amount) {
  const { mainSplits, remoteSplits } = destinations;

  let runningAmount = amount;

  // Combine fees and splits from mainSplits
  const fees = [
    ...mainSplits.feesDestinations,
    ...remoteSplits.feesDestinations,
  ];

  // Combine fees and splits from remoteSplits
  const splits = [
    ...mainSplits.splitsDestinations,
    ...remoteSplits.splitsDestinations,
  ];

  fees.forEach((fee) => {
    fee.amount = Math.floor((fee["@_split"] / 100) * amount);
    runningAmount -= fee.amount;
  });

  splits.forEach((split) => {
    split.amount = Math.floor((fee["@_split"] / 100) * runningAmount);
  });

  // Return combined array
  return [...fees, ...splits];
}
