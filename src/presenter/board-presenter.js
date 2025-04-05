import EventsListView from '../view/events-list-view.js';
import { render } from '../framework/render.js';
import SortPresenter from './sort-presenter.js';
import EventsPresenter from './events-presenter.js';
import { USER_ACTIONS } from '../const.js';
import { SORT_TYPES } from '../const.js';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

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
    const sortedEvents = this.#sortPresenter.getSortedEvents(
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

  _handleEventChange = async (updatedEvent) => {
    try {
      const savedEvent = await this.#boardModel.updateEvent(updatedEvent);
      const modelEvents = this.#boardModel.events;
      const currentSortType = this.#boardModel.getCurrentSortType();

      const sortedEvents = this.#sortPresenter.getSortedEvents(modelEvents, currentSortType);

      await new Promise((resolve) => {
        if (!modelEvents.some((e) => e.id === savedEvent.id)) {
          this.#eventsPresenter.updateEvents(sortedEvents);
          resolve();
        } else {
          this.#eventsPresenter.updateEvent(savedEvent);
          const oldEvent = this.#boardModel.getEventById(updatedEvent.id);
          let needsFullUpdate = false;

          switch (currentSortType) {
            case SORT_TYPES.DAY: {
              needsFullUpdate = !dayjs(savedEvent.dateFrom).isSame(oldEvent.dateFrom);
              break;
            }
            case SORT_TYPES.TIME: {
              const oldDuration = dayjs(oldEvent.dateTo).diff(dayjs(oldEvent.dateFrom));
              const newDuration = dayjs(savedEvent.dateTo).diff(dayjs(savedEvent.dateFrom));
              needsFullUpdate = oldDuration !== newDuration;
              break;
            }
            case SORT_TYPES.PRICE: {
              needsFullUpdate = savedEvent.basePrice !== oldEvent.basePrice;
              break;
            }
            default: {
              needsFullUpdate = true;
            }
          }

          if (needsFullUpdate) {
            this.#eventsPresenter.updateEvents(sortedEvents);
          }
          resolve();
        }
      });

      return savedEvent;
    } catch (error) {
      const currentSortType = this.#boardModel.getCurrentSortType();
      const sortedEvents = this.#sortPresenter.getSortedEvents(this.#boardModel.events, currentSortType);
      this.#eventsPresenter.updateEvents(sortedEvents);
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

    const sortedEvents = this.#sortPresenter.getSortedEvents(filteredEvents, SORT_TYPES.DAY);

    this.#eventsPresenter.updateEvents(sortedEvents);

    if (this.#sortPresenter) {
      const dayInput = this.#sortPresenter.container.querySelector('#sort-day');
      if (dayInput) {
        dayInput.checked = true;
      }
    }

  }

  setTripMainView(tripMainView) {
    this.#tripMainView = tripMainView;
  }

  updateEvents(filteredEvents) {
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

  showAddEventForm(addEventView) {
    this.#eventsPresenter.resetAllViews();

    this.closeAddEventForm();

    this.#addEventForm = addEventView;

    render(this.#addEventForm, this.#eventsListComponent.element, 'afterbegin');
    this.#tripMainView.blockNewEventButton();
  }

  closeAddEventForm() {
    if (this.#addEventForm) {
      this.#addEventForm.removeElement();
      this.#addEventForm = null;
    }
  }

  _handleModelChange(actionType, payload) {
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
    const sortedEvents = this.#sortPresenter.getSortedEvents(events, this.#boardModel.getCurrentSortType());
    this.#eventsPresenter.updateEvents(sortedEvents);
  }

  resetAllViews() {
    this.#eventsPresenter.resetAllViews();
  }

  resetFiltersAndSorting() {
    this.#filterModel.resetFilters();
    this.#boardModel.changeSortType(SORT_TYPES.DAY);
    this.#sortPresenter.resetSorting();
    this.#eventsPresenter.resetAllViews();
    const filteredEvents = this.#filterModel.filterEvents(this.#boardModel.events);
    this.#eventsPresenter.updateEvents(filteredEvents);
  }

}
