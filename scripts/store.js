'use strict';

const store = (function() {
  const setError = function(error) {
    this.error = error;
  };

  const addBookmark = function(bookmark) {
    const expand = { expand: false };
    Object.assign(bookmark, expand);
    this.bookmarks.push(bookmark);
  };

  const findById = function(id) {
    return this.bookmarks.find(bookmark => bookmark.id === id);
  };

  const findAndDelete = function(id) {
    return (this.bookmarks = this.bookmarks.filter(
      bookmark => bookmark.id !== id
    ));
  };

  const findAndUpdate = function(id, newData) {
    const bookmark = this.findById(id);
    Object.assign(bookmark, newData);
  };

  const filterByRating = function(rating) {
    return this.bookmarks.filter(bookmark => bookmark.rating >= rating);
  };

  const setBookmarkIsEditing = function(id, isEditing) {
    const item = this.findById(id);
    item.isEditing = isEditing;
  };

  return {
    bookmarks: [],
    adding: false,
    error: null,
    filterRating: 1,

    setError,
    addBookmark,
    findById,
    findAndDelete,
    findAndUpdate,
    filterByRating,
    setBookmarkIsEditing
  };
})();