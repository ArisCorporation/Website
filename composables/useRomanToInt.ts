// const romanHash = {
//   I: 1,
//   V: 5,
//   X: 10,
//   L: 50,
//   C: 100,
//   D: 500,
//   M: 1000,
// };
// const s = 'MCMLXXXIX';
// export const useRomanToInt = (s) => {
//   let accumulator = 0;
//   for (let i = 0; i < s.length; i++) {
//     if (s[i] === 'I' && s[i + 1] === 'V') {
//       accumulator += 4;
//       i++;
//     } else if (s[i] === 'I' && s[i + 1] === 'X') {
//       accumulator += 9;
//       i++;
//     } else if (s[i] === 'X' && s[i + 1] === 'L') {
//       accumulator += 40;
//       i++;
//     } else if (s[i] === 'X' && s[i + 1] === 'C') {
//       accumulator += 90;
//       i++;
//     } else if (s[i] === 'C' && s[i + 1] === 'D') {
//       accumulator += 400;
//       i++;
//     } else if (s[i] === 'C' && s[i + 1] === 'M') {
//       accumulator += 900;
//       i++;
//     } else {
//       accumulator += romanHash[s[i]];
//     }
//   }
//   return accumulator;
// };
export const useRomanToInt = (roman: string) => {
  const romanNumerals = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const currentSymbol = romanNumerals[roman[i].toUpperCase()];
    const nextSymbol = romanNumerals[roman[i + 1].toUpperCase()];
    if (nextSymbol && currentSymbol < nextSymbol) {
      result -= currentSymbol;
    } else {
      result += currentSymbol;
    }
  }
  return result;
};
