import NewFilterView from './view/filter-view.js';
import BoardPresenter from './presenter/board-presenter.js';
import { render } from './render.js';

const filtersElement = document.body.querySelector('.trip-controls__filters');
const tripEventsElement = document.body.querySelector('.trip-events');

const boardPresenter = new BoardPresenter({ boardContainer:tripEventsElement });

render(new NewFilterView(), filtersElement);

boardPresenter.init();
