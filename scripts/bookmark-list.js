'use strict';

/* global store, api */

const bookmarkList = (function() {
  function generateError(message) {
    return `
      <section class="error-content">
        <button id="cancel-error">X</button>
        <p>${message}</p>
      </section>
    `;
  }

  function generateBookmarkElement(obj) {
    const { id, title, url, rating, desc } = obj;
    const bookmark = store.findById(id);
    if (bookmark.isEditing) {
      return `
      <li class="js-bookmark-element" data-bookmark-id="${id}">
        <form class="edit">  
         <fieldset>
          <legend>EDIT BOOKMARK</legend>
          <label for="title">
            Title: 
            <input type="text" name="title" id="title" value="${title}" required>
          </label>
          <label for="url">
            URL: 
            <input type="url" name="url" id="url" value="${url}" required>
          </label>
          <label for="rating">
            Rating: 
            <input type="number" name="rating" id="rating" min="1" max="5" value="${rating}" required>
          </label>
          <label for="description">Description: </label>
          <textarea name="desc" id="description" rows="6" cols="28" required>${desc}</textarea>
          <div class="form-buttons">
            <button class="update-button" type="submit">UPDATE</button>
            <button type="button" class="cancel">CANCEL</button>
          </div>
         </fieldset>
       </form>
      </li>
      `;
    } else if (bookmark.expand) {
      return `
      <li class="js-bookmark-element" data-bookmark-id="${id}">
        <div class="li-flex">
          <span class="bookmark-title">${title}</span>
          <span class="bookmark-rating">${rating}</span>
          </div>
          <span class="bookmark-url">
            <a href="${url}">${url}</a>
          </span>
          <span class="bookmark-desc">${desc}</span>
        <div class="li-buttons">
          <button class="bookmark-toggle">COLLAPSE</button>
          <button class="bookmark-edit">EDIT</button>
          <button class="bookmark-delete">REMOVE</button>
        </div>
      </li>`;
    } else {
      return `
      <li class="js-bookmark-element" data-bookmark-id="${id}">
        <div class="li-flex">
          <span class="bookmark-title">${title}</span>
          <span class="bookmark-rating">${rating}</span>
        </div>
        <div class="li-buttons">
          <button class="bookmark-toggle">EXPAND</button>
          <button class="bookmark-edit">EDIT</button>
          <button class="bookmark-delete">REMOVE</button>
        </div>
      </li>`;
    }
  }

  function generateBookmarksString(bookmarksList) {
    const bookmarks = bookmarksList.map(bookmark =>
      generateBookmarkElement(bookmark)
    );
    return bookmarks.join('');
  }

  function renderError() {
    if (store.error) {
      const errorHtml = generateError(store.error);
      $('.error-container').html(errorHtml);
    } else {
      $('.error-container').empty();
    }
  }

  function render() {
    renderError();
    const bookmarks = store.filterByRating(store.filterRating);
    const bookmarksString = generateBookmarksString(bookmarks);
    if (store.adding) {
      $('.add-new').empty();
      $('.add-form').html(`
        <fieldset>
          <legend>ADD A NEW BOOKMARK</legend>
          <label for="title">
            Title: 
            <input type="text" name="title" id="title" required>
          </label>
          <label for="url">
            URL: 
            <input type="url" name="url" id="url" required>
          </label>
          <label for="rating">
            Rating: 
            <input type="number" name="rating" id="rating" min="1" max="5" required>
          </label>
          <label for="description">Description: </label>
          <textarea name="desc" id="description" rows="6" cols="34" required></textarea>
          <div class="form-buttons">
            <button class="add-submit" type="submit">ADD</button>
            <button type="button" class="cancel">CANCEL</button>
          </div>
        </fieldset>
      `);
      $('.add-form').toggleClass('padding');
    } else {
      $('.add-form').empty();
      $('.add-new').html(`<div class="add-new">
      <button class="add-new-button">ADD A BOOKMARK</button>
    </div>`);
    }
    $('.js-bookmark-list').html(bookmarksString);
  }

  function handleAddNewBookmarkClick() {
    $('.add-new').on('click', '.add-new-button', () => {
      store.adding = true;
      render();
    });
  }

  function handleCancelNewClick() {
    $('.add-form').on('click', '.cancel', () => {
      $('.add-form').toggleClass('padding');
      store.adding = false;
      render();
    });
  }

  function handleCancelEditClick() {
    $('ul').on('click', '.cancel', () => {
      const id = getBookmarkIdFromElement(event.target);
      store.setBookmarkIsEditing(id, false);
      render();
    });
  }

  function serializeJson(form) {
    const formData = new FormData(form);
    const o = {};
    formData.forEach((val, name) => (o[name] = val));
    return JSON.stringify(o);
  }

  function serializeForm(form) {
    const formData = new FormData(form);
    let obj = {};
    for (let [key, value] of formData.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  function handleNewBookmarkSubmit() {
    $('.add-form').submit(event => {
      event.preventDefault();
      $('.add-form').toggleClass('padding');
      const newBookmark = serializeJson(event.currentTarget);
      store.adding = false;
      api
        .createBookmark(newBookmark)
        .then(bookmark => {
          store.addBookmark(bookmark);
          render();
        })
        .catch(err => {
          console.log(err);
          store.setError(err.message);
          renderError();
        });
    });
  }

  function getBookmarkIdFromElement(element) {
    return $(element)
      .closest('li')
      .data('bookmark-id');
  }

  function handleBookmarkDetailClick() {
    $('ul').on('click', '.bookmark-toggle', event => {
      const id = getBookmarkIdFromElement(event.currentTarget);
      const bookmark = store.findById(id);
      bookmark.expand = !bookmark.expand;
      render();
    });
  }

  function handleRemoveBookmarkClick() {
    $('ul').on('click', '.bookmark-delete', event => {
      const id = getBookmarkIdFromElement(event.currentTarget);
      api
        .deleteBookmark(id)
        .then(() => {
          store.findAndDelete(id);
          render();
        })
        .catch(err => {
          console.log(err);
          store.setError(err.message);
          renderError();
        });
    });
  }

  function handleFilterByRating() {
    $('#filter').change(() => {
      const rating = $(event.currentTarget).val();
      store.filterRating = rating;
      render();
    });
  }

  function handleBookmarkStartEditing() {
    $('ul').on('click', '.bookmark-edit', event => {
      const id = getBookmarkIdFromElement(event.target);
      store.setBookmarkIsEditing(id, true);
      render();
    });
  }

  function handleEditBookmarkSubmit() {
    $('ul').on('submit', '.edit', event => {
      event.preventDefault();
      const id = getBookmarkIdFromElement(event.currentTarget);
      const bookmark = serializeForm(event.currentTarget);
      const bookmarkJson = serializeJson(event.currentTarget);
      api
        .updateBookmark(id, bookmarkJson)
        .then(() => {
          store.findAndUpdate(id, bookmark);
          store.setBookmarkIsEditing(id, false);
          render();
        })
        .catch(err => {
          console.log(err);
          store.setError(err.message);
          renderError();
        });
    });
  }

  function handleCloseError() {
    $('.error-container').on('click', '#cancel-error', () => {
      store.setError(null);
      renderError();
    });
  }

  function bindEventListeners() {
    handleAddNewBookmarkClick();
    handleNewBookmarkSubmit();
    handleBookmarkDetailClick();
    handleRemoveBookmarkClick();
    handleFilterByRating();
    handleBookmarkStartEditing();
    handleEditBookmarkSubmit();
    handleCancelNewClick();
    handleCancelEditClick();
    handleCloseError();
  }

  return {
    render: render,
    bindEventListeners: bindEventListeners,
  };
})();