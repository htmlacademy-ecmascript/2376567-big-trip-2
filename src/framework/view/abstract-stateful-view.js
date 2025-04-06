import AbstractView from './abstract-view.js';

/**
 * Абстрактный класс представления с состоянием
 */
export default class AbstractStatefulView extends AbstractView {
  /** @type {Object} Объект состояния */
  _state = {};

  /**
   * Метод для обновления состояния и перерисовки элемента
   * @param {Object} update Объект с обновлённой частью состояния
   */
  updateElement(update) {
    if (!update) {
      return;
    }

    if (!this.element) {
      return;
    }

    this._setState(update);

    this.#rerenderElement();
  }

  /**
   * Метод для восстановления обработчиков после перерисовки элемента
   * @abstract
   */
  _restoreHandlers() {
    throw new Error('Abstract method not implemented: restoreHandlers');
  }

  /**
   * Метод для обновления состояния
   * @param {Object} update Объект с обновлённой частью состояния
   */
  _setState(update) {
    this._state = structuredClone({...this._state, ...update});
  }

  /** Метод для перерисовки элемента */

  #rerenderElement() {
    if (!this.element || !this.element.parentElement) {
      return;
    }

    const parent = this.element.parentElement;
    const oldElement = this.element;

    this.removeElement();
    const newElement = this.element;

    if (parent && oldElement.parentNode === parent) {
      parent.replaceChild(newElement, oldElement);
      // this._restoreHandlers();//возможно сделать
    } else {
      parent?.appendChild(newElement);
      // this._restoreHandlers();//возможно сделать
    }
  }
}
