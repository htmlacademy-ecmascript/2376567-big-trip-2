import HeaderPresenter from './presenter/header-presenter.js';
import BoardPresenter from './presenter/board-presenter.js';
import BoardModel from './model/board-model.js';
import FilterModel from './model/filter-model.js';

const boardModel = new BoardModel();
const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({
  boardContainer: document.querySelector('.trip-events'),
  boardModel: boardModel,
  filterModel: filterModel,
});

const headerPresenter = new HeaderPresenter({
  headerContainer: document.querySelector('.page-header'),
  filterModel: filterModel,
  boardPresenter: boardPresenter,
  boardModel: boardModel,
});

headerPresenter.init();
boardPresenter.init();
