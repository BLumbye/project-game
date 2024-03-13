/**
 * When applied to the click event of a dialog, it will close whenever the background is clicked.
 */
import { Event } from '../types/types';


export function backgroundClickClose(e: MouseEvent) {
  if ((e.target as HTMLElement).tagName !== 'DIALOG')
    //This prevents issues with forms
    return;

  const rect = (e.target as HTMLElement).getBoundingClientRect();

  const clickedInDialog =
    rect.top <= e.clientY &&
    e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX &&
    e.clientX <= rect.left + rect.width;

  if (clickedInDialog === false) (e.target as HTMLDialogElement).close();
}


