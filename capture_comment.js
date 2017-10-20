
var blog = null;
var debug = false;


function capture_comment(e) {
    var frm = e ? e.target : this;

    e.stopPropagation();

	e.preventDefault();
	blog.bookmark_comment(frm);

}


function capture_comment_setup( ){


    // If a script calls someForm.submit(), the onsubmit event does not fire,
    // so we need to redefine the submit method of the HTMLFormElement class.
    HTMLFormElement.prototype.real_submit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = interceptor;
    blog = detect_blog();
    if (blog_obj) {
        window.addEventListener('submit', capture_comment, true);
    }
}

function detect_blog() {
    var metas = document.getElementsByTagName('meta');
    var generator = 'not_found';
    for (var i = 0; i < metas.length; i++) {
      var meta_name = metas[i].getAttribute('name');
      if (meta_name) {
        if (meta_name.toLowerCase() == 'generator') {
          generator = metas[i].getAttribute('content');
          break;
        }
      }
    }
    if (generator != 'not_found') {
      generator = generator.toLowerCase();
      if (generator.indexOf('wordpress') > -1) {
        return new Wordpress_blog();
      } else if (generator.indexOf('typepad') > -1) {
        return new Typepad_blog();
      } else {
        return false;
        // Add code to check if is explicitly listed as blog
        // return new Blog();
      }
    }
}

class Comment {
    constructor(article_url = "", article_title = "") {
        this.author = "";
        this.email = "";
        this.url = "";
        this.title = "";
        this.comment = "";
        this.article_title = article_title;
        this.article_url = article_url;
        this.in_reply_to = this.article_url; // Url of article or comment this replies to
    }
}

class Blog {
    constructor() {
        this.reset_comment();
        this.form = false;
    }

    reset_comment() {
        this.comment = new Comment();
    }

    capture_submit(e) {
        target = e.target;
        if (! target) {return;}

        if (this.form) {
            form = this.form;
        } else if ("tagName" in target && target.tagName == 'form') {
            form = target;
        } else if ("tagName" in target && target.tagName == 'input' && target.closest('form')) {
            form = target.closest('form');
        } else {
            form = document.getElementsByTagName()
        }

    e.stopPropagation();

    e.preventDefault();
    blog.bookmark_comment(frm);
    }

    bookmark_comment(frm) {
            if (this.parse_comment(frm)) this.create_bookmark();
            this.reset_blog();
    }
}



Blog.prototype.bookmark_comment = function(frm) {
    if (this.parse_comment(frm)) this.create_bookmark();
    this.reset_blog();
};

Blog.prototype.create_bookmark = function() {
    var notes = "comment on: {" + document.title + "}, author: {" + this.author + "}, url: {" + this.url + "}, email: {" + this.email + "}, comment: {" + this.comment + "}";
    add_to_delicious(window.location.href, this.title, notes);
};

Blog.prototype.parse_comment  = function(form) { // returns false if not a form element
    var input = form.elements.namedItem("author") || form.elements.namedItem("comment-author");
    if (input) this.author=input.value;
    alert('hi2');
    input = form.elements.namedItem("email") || form.elements.namedItem("comment-email");
    if (input) this.email=input.value;
    input = form.elements.namedItem("url") || form.elements.namedItem("comment-url");
    if (input) this.url=input.value;
    input = form.elements.namedItem("comment") || form.elements.namedItem("comment-text");
    if (input) this.comment=input.value;
    input = form.elements.namedItem("title");
    if (input) this.title=input.value;
    if ( (this.author.length + this.email.length + this.comment.length) > 0) {
        return true;
    } else {
        return false;
    }
};

function Wordpress_blog() {
    Blog.call(this);
}

Wordpress_blog.prototype = Object.create(Blog.prototype);

// Set the "constructor" property to refer to
Wordpress_blog.prototype.constructor = Wordpress_blog;

function Typepad_blog() {
    Blog.call(this);
}

Typepad_blog.prototype = Object.create(Blog.prototype);

// Set the "constructor" property to refer to
Typepad_blog.prototype.constructor = Typepad_blog;

function create_bookmark(uri, title, notes) {

}

browser.storage.local.get("options").then( (opts) => { 
    if ('debug' in opts) {debug = opts.debug;} 
    capture_comment_setup();
}).catch(       (reason) => {
            console.log('Couldn\t set debug  ('+reason+') here.');
            }
);

