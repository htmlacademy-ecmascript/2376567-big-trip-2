import BoardPresenter from './presenter/board-presenter.js';
import BoardModel from './model/board-model.js';
import HeaderPresenter from './presenter/header-presenter.js';

const pageHeader = document.body.querySelector('.page-header');
const tripEventsElement = document.body.querySelector('.trip-events');

const boardModel = new BoardModel();

const headerPresenter = new HeaderPresenter({ headerContainer: pageHeader });
const boardPresenter = new BoardPresenter({ boardContainer:tripEventsElement }, boardModel);

headerPresenter.init();
boardPresenter.init();


