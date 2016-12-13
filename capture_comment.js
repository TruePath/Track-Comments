
var blog_obj = null;

function interceptor(e) {
    var frm = e ? e.target : this;

    e.stopPropagation();

	e.preventDefault();
	blog_obj.bookmark_comment(frm);

}


function interceptor_setup( ){
// capture the onsubmit event on all forms
window.addEventListener('submit', interceptor, true);

// If a script calls someForm.submit(), the onsubmit event does not fire,
// so we need to redefine the submit method of the HTMLFormElement class.
HTMLFormElement.prototype.real_submit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = interceptor;
blog_obj = blog_factory();
}

function blog_factory() {
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
        return new Blog();
      }
    }
}

function Blog() {
    this.reset_blog();
}

Blog.prototype.reset_blog = function() {
    this.author = "";
    this.email = "";
    this.url = "";
    this.title = "Untitled Comment on: " + document.title;
    this.comment = "";
};

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

function add_to_delicious(uri, title, notes) {
    node=document.createElement("SCRIPT");
    node.type="text/javascript";
    delurl= window.location.protocol + "//del.icio.us/save/get_bookmarklet_save?url=";
    node.src=delurl+encodeURIComponent(uri)+"&title="+encodeURIComponent(title)+"&notes="+encodeURIComponent(notes);
    document.body.appendChild(node);
    document.body.removeChild(node);
}

interceptor_setup();