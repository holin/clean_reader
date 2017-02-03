var ReaderDb = ReaderDb || {
  save: function() {
    chrome.storage.sync.set({'db': ReaderDb.data_need_save()}, function() {
      // console.log('db saved');
    });
  },

  init: function() {
    chrome.storage.sync.get(['db'], function(items) {
      // console.log('Settings retrieved', items.db);
      //TODO, init others?
      ReaderDb.zoomPercents = items.db.zoomPercents || {}
    });

  },

  //private
  data_need_save: function() {
    return {
      zoomPercents: ReaderDb.zoomPercents,
    }
  }
}

ReaderDb.zoomPercents = ReaderDb.zoomPercents || {}

ReaderDb.init()
