import { render } from '../framework/render.js';
import AbstractView from '../framework/view/abstract-view.js';

export default class NoEventsView extends AbstractView {
  #message = '';

  constructor(message) {
    super();
    this.#message = message;
  }

  get template() {
    return `
      <p class="trip-events__msg">${this.#message}</p>
    `;
  }

  render(container) {
    render(this.template, container);
  }
}
