'use strict';

const main = function() {
  bookmarkPage.bindEventListeners();
  api
    .getBookmarks()
    .then(bookmark => {
      bookmark.forEach(bookmark => store.addBookmark(bookmark));
      bookmarkPage.render();
    })
    .catch(err => console.log(err.message));
};

$(main);