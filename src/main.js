import NewFilterView from './view/filter-view.js';
import BoardPresenter from './presenter/board-presenter.js';
import { render } from './render.js';
import BoardModel from './model/board-model.js';

const filtersElement = document.body.querySelector('.trip-controls__filters');
const tripEventsElement = document.body.querySelector('.trip-events');

const boardModel = new BoardModel();

const boardPresenter = new BoardPresenter({ boardContainer:tripEventsElement }, boardModel);

render(new NewFilterView(), filtersElement);

boardPresenter.init();


