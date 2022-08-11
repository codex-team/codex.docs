import { debounce } from '../utils/decorators';
import Shortcut from '@codexteam/shortcuts';
import axios from 'axios';


export default class Search {
  constructor() {
    this.nodes = {
      overlay: null,
      searchWrapper: null,
      searchInput: null,
      searchResultsWrapper: null
    };

    this.isVisible = false;

    this.shortcut = null;
    this.TOGGLER_SHORTCUT = 'CMD+SHIFT+F';

    this.debouncedSearch = null;
    this.DEBOUNCE_TIME = 500;
  }

  init(settings = {}, moduleEl) {
    console.log('search init');

    this.createSearchOverlay();
    this.createDebouncedSearch();
    this.enableShortcutListening();

    // ! force open search overlay
    // this.toggleSearchOverlay(true);
  }

  createSearchOverlay() {
    this.nodes.overlay = document.createElement('div');
    this.nodes.overlay.classList.add('search-overlay');
    this.nodes.overlay.addEventListener('click', this.searchOverlayClickProcessor.bind(this));

    this.nodes.searchWrapper = document.createElement('div');
    this.nodes.searchWrapper.classList.add('search-wrapper');

    this.nodes.searchInput = document.createElement('input');
    this.nodes.searchInput.classList.add('search-input');
    this.nodes.searchInput.setAttribute('type', 'search');
    this.nodes.searchInput.setAttribute('placeholder', 'Find in documents...');
    this.nodes.searchInput.setAttribute('autocomplete', 'off');
    this.nodes.searchInput.addEventListener('input', this.searchInputOnchangeProcessor.bind(this));
    this.nodes.searchWrapper.appendChild(this.nodes.searchInput);

    this.nodes.searchResultsWrapper = document.createElement('div');
    this.nodes.searchResultsWrapper.classList.add('search-results-wrapper');
    this.nodes.searchWrapper.appendChild(this.nodes.searchResultsWrapper);

    this.nodes.overlay.appendChild(this.nodes.searchWrapper);
    document.body.appendChild(this.nodes.overlay);
  }

  searchOverlayClickProcessor(event) {
    if (event.target !== this.nodes.overlay) {
      return;
    }

    this.toggleSearchOverlay(false);
  }

  searchInputOnchangeProcessor(event) {
    // close search overlay if ESC key is pressed
    if (event.keyCode === 27) {
      this.toggleSearchOverlay(false);
      event.preventDefault();
    }

    console.log(event.target.value);

    this.debouncedSearch(event.target.value);
  }

  enableShortcutListening() {
    this.shortcut = new Shortcut({
      name : this.TOGGLER_SHORTCUT,
      on : document.body,
      callback: (event) => {
        this.toggleSearchOverlay();
      }
    });
  }

  toggleSearchOverlay(force) {
    this.isVisible = force || !this.isVisible;

    this.nodes.overlay.classList.toggle('search-overlay--visible', this.isVisible);
    document.body.classList.toggle('noscroll', this.isVisible);

    try {
      document.getElementsByClassName('docs')[0].classList.toggle('blurred', this.isVisible);
    } catch (e) {}

    this.nodes.searchInput.focus();
  }

  createDebouncedSearch() {
    this.debouncedSearch = debounce(this.getSearchResults, this.DEBOUNCE_TIME);
  }

  getSearchResults(text) {
    if (!text) {
      this.clearSearchResults();
      return;
    }

    axios.get('/api/search', {
      params: {
        text: text
      }
    })
      .then(this.showSearchResult.bind(this));
  }

  clearSearchResults() {
    this.nodes.searchResultsWrapper.innerHTML = '';
  }

  showSearchResult({ data }) {
    this.clearSearchResults();

    data.result.pages.forEach(page => {
      const result = document.createElement('a');
      result.classList.add('search-results-item');
      result.setAttribute('href', `/${page.uri}`);

      const title = document.createElement('div');
      title.classList.add('search-results-item__title');
      title.innerHTML = page.title;
      result.appendChild(title);

      // const description = document.createElement('div');
      // description.classList.add('search-results-item__description');
      // result.appendChild(description);

      this.nodes.searchResultsWrapper.appendChild(result);
    });
  }
}
