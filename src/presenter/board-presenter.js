import EventsListView from '../view/events-list-view.js';
import { render } from '../framework/render.js';
import SortPresenter from './sort-presenter.js';
import EventsPresenter from './events-presenter.js';
import { USER_ACTIONS } from '../const.js';
import { FILTERS } from '../const.js';
import { SORT_TYPES } from '../const.js';

export default class BoardPresenter {
  #eventsListComponent = new EventsListView();
  #boardContainer = null;
  #boardModel = null;
  #filterModel = null;
  #eventsPresenter = null;
  #addEventForm = null;
  #sortPresenter = null;
  #isAddFormOpen = false;
  #tripMainView = null;

  constructor({ boardContainer, boardModel, filterModel }) {
    this.#boardContainer = boardContainer;
    this.#boardModel = boardModel;
    this.#filterModel = filterModel;

    this.#filterModel.addObserver((filter) => this._handleFilterUpdate(filter));
    this.#boardModel.addObserver((actionType, payload) => this._handleModelChange(actionType, payload));
  }

  init() {
    this._renderBoard();
    const sortedEvents = this.#sortPresenter._getSortedEvents(
      this.#boardModel.events,
      SORT_TYPES.DAY
    );
    this.#eventsPresenter.updateEvents(sortedEvents);
  }

  _renderSort(eventsPresenter) {
    this.#sortPresenter = new SortPresenter({
      boardContainer: this.#boardContainer,
      eventsPresenter: eventsPresenter,
      boardModel: this.#boardModel,
    });

    this.#sortPresenter.init();
  }

  _renderEvents() {
    this.#eventsPresenter.init(this.#eventsListComponent);
  }

  // _handleEventChange = async (updatedEvent) => {
  //   try {
  //     const savedEvent = await this.#boardModel.updateEvent(updatedEvent);
  //     const modelEvents = this.#boardModel.events;
  //     if (!modelEvents.some((e) => e.id === savedEvent.id)) {
  //       this.#eventsPresenter.updateEvents(modelEvents);
  //       return;
  //     }
  //     this.#eventsPresenter.updateEvent(savedEvent);
  //   } catch {
  //     this.#eventsPresenter.updateEvents(this.#boardModel.events);
  //   }
  // };

  _handleEventChange = async (updatedEvent) => {
    try {
      const savedEvent = await this.#boardModel.updateEvent(updatedEvent);
      const modelEvents = this.#boardModel.events;

      // Ждем завершения всех обновлений UI
      await new Promise(resolve => {
        if (!modelEvents.some((e) => e.id === savedEvent.id)) {
          this.#eventsPresenter.updateEvents(modelEvents, resolve);
        } else {
          this.#eventsPresenter.updateEvent(savedEvent, resolve);
        }
      });

      return savedEvent;
    } catch (error) {
      await new Promise(resolve => {
        this.#eventsPresenter.updateEvents(this.#boardModel.events, resolve);
      });
      throw error;
    }
  };

  _renderBoard() {
    const events = this.#boardModel.events;
    const destinations = this.#boardModel.destinations;
    const offers = this.#boardModel.offers;

    const eventsPresenterParams = {
      events,
      destinations,
      offers,
      boardModel: this.#boardModel,
      eventsListComponent: this.#eventsListComponent,
      onDataChange: this._handleEventChange,
      filterModel: this.#filterModel,
      boardContainer: this.#boardContainer,
      resetFiltersAndSorting: () => this.resetFiltersAndSorting(),
      onFormOpen: () => {
        this.closeAddEventForm();
      },
      tripMainView: this.#tripMainView,
    };

    this.#eventsPresenter = new EventsPresenter(eventsPresenterParams);
    this._renderSort(this.#eventsPresenter);

    render(this.#eventsListComponent, this.#boardContainer);
    this._renderEvents();
  }

  _handleFilterUpdate() {

    const filteredEvents = this.#filterModel.filterEvents(this.#boardModel.events);

    this.#boardModel.changeSortType(SORT_TYPES.DAY);

    const sortedEvents = this.#sortPresenter._getSortedEvents(filteredEvents, SORT_TYPES.DAY);

    this.#eventsPresenter.updateEvents(sortedEvents);

    if (this.#sortPresenter) {
      const dayInput = this.#sortPresenter.container.querySelector('#sort-day');
      if (dayInput) {
        dayInput.checked = true;
        // dayInput.dispatchEvent(new Event('change'));
      }
    }

  }

  setTripMainView(tripMainView) {
    this.#tripMainView = tripMainView;
  }

  updateEvents(filteredEvents) {
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

  // showAddEventForm(addEventView) {
  //   this.#eventsPresenter.removeNoEventsView();
  //   if (this.#addEventForm) {
  //     this.#addEventForm.removeElement();
  //   }
  //   this.#addEventForm = addEventView;
  //   this.#eventsPresenter.resetAllViews();
  //   render(this.#addEventForm, this.#eventsListComponent.element, 'afterbegin');
  // }

  showAddEventForm(addEventView) {
    // Закрываем все формы редактирования
    this.#eventsPresenter.resetAllViews();

    // Закрываем предыдущую форму добавления, если есть
    this.closeAddEventForm();

    // Открываем новую форму
    this.#addEventForm = addEventView;
    // this.#isAddFormOpen = true;
    render(this.#addEventForm, this.#eventsListComponent.element, 'afterbegin');
    this.#tripMainView.blockNewEventButton();
  }

  closeAddEventForm() {
    if (this.#addEventForm) {
      this.#addEventForm.removeElement();
      this.#addEventForm = null;
      // this.#isAddFormOpen = false;
      // this.#tripMainView.unblockNewEventButton();
    }
  }

  _handleModelChange(actionType, payload) {
    console.log(`Изменение модели: ${actionType}`, payload);
    switch (actionType) {
      case USER_ACTIONS.ADD_EVENT:
        this.#eventsPresenter.updateEvent(payload);
        break;
      case USER_ACTIONS.UPDATE_EVENT:
        this._updateEventsList();
        break;
      case USER_ACTIONS.SORT_CHANGED:
        this._updateEventsList();
        break;
      case USER_ACTIONS.DELETE_EVENT:
        this.#eventsPresenter.updateEvents(this.#boardModel.events);
        break;
    }
  }

  _updateEventsList() {
    const events = this.#boardModel.events;
    const sortedEvents = this.#sortPresenter._getSortedEvents(events, this.#boardModel.getCurrentSortType());
    this.#eventsPresenter.updateEvents(sortedEvents);
  }

  resetAllViews() {
    this.#eventsPresenter.resetAllViews();
  }

  // resetFiltersAndSorting() {
  //   this.#filterModel.setFilter(FILTERS[0]);
  //   this.#eventsPresenter.resetAllViews();
  // }

  resetFiltersAndSorting() {
    this.#filterModel.resetFilters();
    this.#boardModel.changeSortType(SORT_TYPES.DAY);
    this.#sortPresenter.resetSorting();
    this.#eventsPresenter.resetAllViews();
    const filteredEvents = this.#filterModel.filterEvents(this.#boardModel.events);
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

}
