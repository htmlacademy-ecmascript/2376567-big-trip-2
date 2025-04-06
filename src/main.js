import HeaderPresenter from './presenter/header-presenter.js';
import BoardPresenter from './presenter/board-presenter.js';
import BoardModel from './model/board-model.js';
import FilterModel from './model/filter-model.js';
import EventsApiService from './api/events-api-service.js';
import FailedLoadView from './view/failed-load-view.js';
import { render } from './framework/render.js';
import LoadingView from './view/loading-view.js';
import UiBlocker from './framework/ui-blocker/ui-blocker.js';

const AUTHORIZATION = 'Basic GS2sfS44wcl1sa2G';
const END_POINT = 'https://23.objects.htmlacademy.pro/big-trip';

const UIBLOCKER_TIME_LIMITS = {
  LOWER_LIMIT: 200,
  UPPER_LIMIT: 1000
};

const uiBlocker = new UiBlocker({
  lowerLimit: UIBLOCKER_TIME_LIMITS.LOWER_LIMIT,
  upperLimit: UIBLOCKER_TIME_LIMITS.UPPER_LIMIT
});

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.page-header');

const eventsApiService = new EventsApiService(END_POINT, AUTHORIZATION);
const boardModel = new BoardModel({ eventsApiService });
const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  boardModel,
  filterModel,
  uiBlocker
});

const headerPresenter = new HeaderPresenter({
  headerContainer: siteHeaderElement,
  filterModel,
  boardPresenter,
  boardModel,
  uiBlocker
});

const loadingView = new LoadingView();

render(loadingView, siteMainElement);

Promise.all([
  boardModel.loadDestinations(),
  boardModel.loadOffers(),
  boardModel.loadEvents(),
]).then(() => {
  loadingView.removeElement();
  headerPresenter.init();
  boardPresenter.init();
});
  // .catch(() => {
  //   loadingView.removeElement();
  //   setTimeout(() => {
  //     const errorView = new FailedLoadView();
  //     render(errorView, siteMainElement);
  //   }, 500);
  // });
