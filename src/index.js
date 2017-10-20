var self = require("sdk/self");
var Options = {}; //access prefs

function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(result) {
	Options = result.bookmark_comments || {
	    background: true,
	    autodetect: true,
	    tags: "comment,comment-saver-bookmark",
	    includes: "",
	    excludes: ""
	  };
}

var getting = browser.storage.local.get("bookmark_comments");
getting.then(onGot, onError);


function includes() {
	return Options.includes.split(',');
}


function excludes() {
	return Options.excludes.split(',');
}

function common_tags() {
	return new Set(Options.tags.split(','));
}


var pageMod = pageMods.PageMod({
  include: includes(),
  contentScriptFile: self.data.url("capture_comment.js"),
  onAttach: bookmark_daemon
});




function create_bookmark(url, title="", tags = new Set(), group_title = null)  {
	let { Bookmark, save, UNSORTED} = require("sdk/places/bookmarks");
  let bookmark = Bookmark({ title: title, url: url, group: UNSORTED, tags: tags });
  // Attempt to save the bookmark instance to the Bookmarks database
	// and store the emitter
	let emitter = save(bookmark);

	// It comes back through event listener
	emitter.on("data", function (saved, inputItem) {
														  	console.log(saved.title === inputItem.title); // true
														  	console.log(saved !== inputItem); // true
														  	console.log(inputItem === bookmark); // true
																}); //.on("end", function (savedItems, inputItems) { } );
}

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;
