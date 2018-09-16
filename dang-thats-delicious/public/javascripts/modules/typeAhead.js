// Esta forma de importar solo es necesario en Node.js ya que esta version no soporta esta forma de importacion. En front end se puede usar la nueva importacion de ES6
// const axios = require('axios');
import axios from 'axios';

// Como en este archivo se esta injectando html, es necesario sanitizarlo para evitar ataques SSX
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores
    .map(
      store => `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
    )
    .join('');
}

function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector('input[name=search]');
  const searchResults = search.querySelector('.search__results');

  // El metodo "on" es igual a addEventListener. Se puede usar gracias a la libreria "bling", importada en "delicious-app.js"
  searchInput.on('input', function() {
    // if there is no value, exit
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    // Show search results
    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        // Tell them nothing was found
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">No results found for ${this.value}</div>`
        );
      })
      .catch(err => {
        console.log(err);
      });
  });

  // Handle keyboard inputs
  searchInput.on('keyup', e => {
    // if they are not pressing, 38, 40 or 13, skip it
    if (![13, 38, 40].includes(e.keyCode)) return;
    console.log(e.keyCode);

    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    // Get a list of all items
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) {
      // pressed downkey
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      // pressed upkey
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      // pressed enterkey
      window.location = current.href;
      return;
    }

    // Remove active class from current
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;
