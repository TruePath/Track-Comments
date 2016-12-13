function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    bookmark_comments: {
      background: document.querySelector("#background").checked,
      autodetect: document.querySelector("#autodetect").checked,
      tags: document.querySelector("#tags").value.replace(/ /g,''),
      includes: document.querySelector("#includes").value.replace(/ /g,''),
      excludes: document.querySelector("#excludes").value.replace(/ /g,'')
    }
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    var options = result.bookmark_comments || {
      background: true,
      autodetect: true,
      tags: "comment,comment-saver-bookmark",
      includes: "",
      excludes: ""
    };
    document.querySelector("#background").checked = options.background;
    document.querySelector("#autodetect").checked = options.autodetect;
    document.querySelector("#tags").value = options.tags;
    document.querySelector("#includes").value = options.includes;
    document.querySelector("#excludes").value = options.excludes;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("bookmark_comments");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);