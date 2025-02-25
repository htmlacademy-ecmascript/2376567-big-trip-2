import AbstractView from '../framework/view/abstract-view';

function getNoPointTemplate() {
  return '<p class="trip-events__msg">Click New Event to create your first point</p>';
}

export class NoPointView extends AbstractView {
  get template() {
    return getNoPointTemplate();
  }
}
