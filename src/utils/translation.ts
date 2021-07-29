interface TransTable {
  [key: string]: string;
}
const translationTable: TransTable = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'g',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  ы: 'i',
  э: 'e',
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ж: 'G',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Ы: 'I',
  Э: 'E',
  ё: 'yo',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: "''",
  ь: "'",
  ю: 'yu',
  я: 'ya',
  Ё: 'YO',
  Х: 'H',
  Ц: 'TS',
  Ч: 'CH',
  Ш: 'SH',
  Щ: 'SHCH',
  Ъ: "''",
  Ь: "'",
  Ю: 'YU',
  Я: 'YA',
};
/**
 * Function to translate string
 *
 * @param string - string to translate
 * @returns {string} - translated string
 */

/**
 * @param {string} string - input text to be translated
 * @returns {string} text - translated text
 */
export default function translateString(string: string): string {
  return string.replace(/[А-яёЁ]/g, (char) => translationTable[char] || char);
}
