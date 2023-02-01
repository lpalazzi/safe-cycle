export const metresToDistanceString = (metres: number) => {
  if (metres <= 0) return null;
  if (metres < 1000) return metres.toFixed(0) + 'm';
  return (metres / 1000).toFixed(2) + 'km';
};

export const secondsToTimeString = (totalSeconds: number) => {
  if (totalSeconds < 60) return '<1 min';

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (hours > 0 ? hours + ' hr ' : '') + (minutes + ' min');
};
