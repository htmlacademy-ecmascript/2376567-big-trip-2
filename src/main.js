import HeaderPresenter from './presenter/header-presenter.js';
import BoardPresenter from './presenter/board-presenter.js';
import BoardModel from './model/board-model.js';
import FiltersPresenter from './presenter/filters-presenter.js';

const boardModel = new BoardModel();

const filtersPresenter = new FiltersPresenter();

const headerPresenter = new HeaderPresenter({
  headerContainer: document.querySelector('.page-header'),
  filtersPresenter: filtersPresenter,
});

const boardPresenter = new BoardPresenter({
  boardContainer: document.querySelector('.trip-events'),
  boardModel: boardModel,
  filtersPresenter: filtersPresenter,
});

headerPresenter.init();
boardPresenter.init();
