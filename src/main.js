import HeaderPresenter from './presenter/header-presenter.js';
import BoardPresenter from './presenter/board-presenter.js';
import TripMainModel from './model/trip-model.js';
import BoardModel from './model/board-model.js';

const tripModel = new TripMainModel();
const boardModel = new BoardModel();

const headerPresenter = new HeaderPresenter({
  headerContainer: document.querySelector('.page-header'),
  tripModel: tripModel
});

const boardPresenter = new BoardPresenter({
  boardContainer: document.querySelector('.trip-events'),
  boardModel: boardModel,
  tripModelForObserve: tripModel
});

headerPresenter.init();
boardPresenter.init();


