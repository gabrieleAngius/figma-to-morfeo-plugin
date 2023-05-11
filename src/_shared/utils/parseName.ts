export const parseName = (unparsedName: string) => {
  const useDotAsSeparator = unparsedName.replace('/', '.');
  const splittedWords = useDotAsSeparator.split(' ');
  const camelized = splittedWords.map((word, i) => {
    const firstLetter = word.match(/[a-zA-Z]/)?.[0] || '';
    if (i !== 0) {
      return word.replace(firstLetter, firstLetter.toUpperCase());
    }
    return word.replace(firstLetter, firstLetter.toLowerCase());
  });

  return camelized.join('');
};
