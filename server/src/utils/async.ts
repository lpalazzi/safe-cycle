export const asyncCallWithTimeout = async <T>(
  asyncPromise: Promise<T>,
  timeLimit: number
) => {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error('Async call timeout limit reached')),
      timeLimit
    );
  });

  return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  });
};

export const asyncFilter = async <T>(
  array: T[],
  predicate: (item: T) => Promise<boolean>
): Promise<T[]> => {
  const results = await Promise.all(
    array.map(async (item) => ({
      item,
      isValid: await predicate(item),
    }))
  );

  return results
    .filter((result) => result.isValid)
    .map((result) => result.item);
};
