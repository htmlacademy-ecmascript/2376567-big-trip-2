import HeaderPresenter from './presenter/header-presenter.js';
import BoardPresenter from './presenter/board-presenter.js';
import BoardModel from './model/board-model.js';
import FilterModel from './model/filter-model.js';
import EventsApiService from './api/events-api-service.js';
import FailedLoadView from './view/failed-load-view.js';
import { render } from './framework/render.js';
import LoadingView from './view/loading-view.js';

const AUTHORIZATION = 'Basic GS2sfS44wcl1sa2';
const END_POINT = 'https://23.objects.htmlacademy.pro/big-trip';

const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.page-header');

const eventsApiService = new EventsApiService(END_POINT, AUTHORIZATION);
const boardModel = new BoardModel({ eventsApiService });
const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({
  boardContainer: siteMainElement,
  boardModel,
  filterModel,
});

const headerPresenter = new HeaderPresenter({
  headerContainer: siteHeaderElement,
  filterModel,
  boardPresenter,
  boardModel,
});

headerPresenter.init();

const loadingView = new LoadingView();

render(loadingView, siteMainElement);

Promise.all([
  boardModel.loadDestinations(),
  boardModel.loadOffers(),
  boardModel.loadEvents(),
]).then(() => {
  loadingView.removeElement();
  boardPresenter.init();
})
  .catch(() => {
    loadingView.removeElement();
    const errorView = new FailedLoadView();
    render(errorView, siteMainElement);
  });
