import SortView from '../view/sort-view.js';
import { render } from '../framework/render.js';

export default class SortPresenter {
  #container = null;
  constructor({ boardContainer }) {
    this.#container = boardContainer;
  }

  init() {
    const sortView = new SortView();
    render(sortView, this.#container);
  }
}
