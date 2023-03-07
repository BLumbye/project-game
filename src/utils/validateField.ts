export const validateFieldIsDigit = (evt: KeyboardEvent) => {
  if (!/\d/.test(evt.key)) {
    evt.preventDefault();
  }
};
