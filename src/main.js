import HeaderPresenter from './presenter/header-presenter.js';
import BoardPresenter from './presenter/board-presenter.js';
import BoardModel from './model/board-model.js';
import FilterModel from './model/filter-model.js';

const boardModel = new BoardModel();
const filterModel = new FilterModel();

const headerPresenter = new HeaderPresenter({
  headerContainer: document.querySelector('.page-header'),
  filterModel: filterModel,
});

const boardPresenter = new BoardPresenter({
  boardContainer: document.querySelector('.trip-events'),
  boardModel: boardModel,
  filterModel: filterModel,
});

headerPresenter.init();
boardPresenter.init();
