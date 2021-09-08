/**
 * Zero-pads a given number.
 *
 * @param number the number to zero pad
 * @param digits the digits to pad it to
 */
export function zeroPad(number: number, digits: number): string {
  let asString = "" + number;

  while (asString.length < digits) {
    asString = "0" + asString;
  }

  return asString;
}
