/**
 * Checks if it is a digit, canceling the input if it is not. 
 * @param evt Event that can cancel input
 */
export const validateFieldIsDigit = (evt: KeyboardEvent) => {
  if (!/\d/.test(evt.key)) {
    evt.preventDefault();
  }
};
