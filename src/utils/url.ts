/**
 * @param source a string to check.
 * @returns whether the source is a URL.
 */
export const isUrl = (source: string): URL | null => {
  try {
    return (new URL(source));
  }
  catch (error) {
    return (null);
  }
};
