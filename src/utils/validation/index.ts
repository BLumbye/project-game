export * from './numbers';
export * from './general';
export * from './transforms';

/**
 * Gets the value after the input event.
 * @param evt the beforeinput event
 */
const getNextVal = (evt: InputEvent) => {
  if ((evt.target as HTMLInputElement).value) {
    const target = evt.target as HTMLInputElement;
    return (
      target.value.substring(0, target.selectionStart!) +
      (evt.data ?? '') +
      target.value.substring(target.selectionEnd!)
    );
  } else {
    const target = evt.target as HTMLElement;
    const selection = document.getSelection();
    const start = Math.min(selection!.anchorOffset, selection!.focusOffset);
    const end = Math.max(selection!.anchorOffset, selection!.focusOffset);
    return target.innerText.substring(0, start) + (evt.data ?? '') + target.innerText.substring(end);
  }
};

/**
 * Sees if the next value matches the given predicate. If not, the event is prevented. Can be used with the `beforeinput` event.
 * @param predicate The predicate to match.
 */
export const validate = (predicate: (element: any) => boolean) => (evt: InputEvent) => {
  const value = getNextVal(evt);
  if (!predicate(value)) {
    evt.preventDefault();
  }
}