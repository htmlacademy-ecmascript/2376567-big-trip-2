import HeaderPresenter from './presenter/header-presenter.js';
import BoardPresenter from './presenter/board-presenter.js';
import BoardModel from './model/board-model.js';

const boardModel = new BoardModel();

const headerPresenter = new HeaderPresenter({
  headerContainer: document.querySelector('.page-header'),
});

const boardPresenter = new BoardPresenter({
  boardContainer: document.querySelector('.trip-events'),
  boardModel: boardModel,
  observer: headerPresenter.filters
});

headerPresenter.init();
boardPresenter.init();


