class Jsonable {
    constructor(obj = {}) {
        if (obj instanceof this.constructor) {
            return obj; //Indepotent (I'm a mathematician I don't have to spell it right!)
        } else {
            this.init();
            this._extra_args = {};
        }
        for (var name in obj) {
            if (name !== '_extra_args') {
                if (this.hasOwnProperty(name)){
                    this[name] = obj[name]
                } else {
                    this._extra_args[name] = obj[name];
                }
            }
        }
    }
}

class Comment extends Jsonable {
    constructor(obj = {}) {
        super(obj);
    this.in_reply_to = this.in_reply_to || this.article_url;
    this.submit_url = this.submit_url || this.article_url;
    this.title = this.title || ("Untitled Comment on " + this.article_title);
    }

    init() {
        this.id = null;
        this.author = "";
        this.email = "";
        this.url = "";
        this.title = "";
        this.comment = "";
        this.article_title = "";
        this.article_url = "";
        this.in_reply_to = this.article_url; // Url of article or comment this replies to
        this.format = "text"; // One of text, html, markdown
        this.submit_url = "";
    }
}

// Delete everything above here!



var blog = null;
var debug = false;


function saveResponse(msg) {
    console.log(`background script sent a response: ${message.response}`);
}

function saveError(error) {
  console.log(`Error: ${error}`);
}

function save_comment(comment) {
    console.log("Sent message from content script to backend");
    var sent_message = browser.runtime.sendMessage(comment);
    sent_message.then(saveResponse, saveError);  
}


function capture_comment_setup( ){

    blog = Blog.factory(save_comment);
    blog.capture();
}





class Blog {
    constructor(oncapture) {
        this.comment = null;
        this.form = null;
        this.callback = oncapture;
        this._bound_capture_submit = null;
    }

    static factory(oncapture) {
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
            return new Wordpress_blog(oncapture);
          } else if (generator.indexOf('typepad') > -1) {
            return new Typepad_blog(oncapture);
          } else {
            return new Blog(oncapture);
            // Add code to check if is explicitly listed as blog
            // return new Blog();
          }
        }
    }

    capture() {
        var bound_capture_submit = this.capture_submit.bind(this);
        window.addEventListener('submit', bound_capture_submit, true);
        // If a script calls someForm.submit(), the onsubmit event does not fire,
        // so we need to redefine the submit method of the HTMLFormElement class.
        var interceptor = function() { 
                            bound_capture_submit(this);  
                            this.real_submit(); 
                          };
        HTMLFormElement.prototype.real_submit = HTMLFormElement.prototype.submit;
        HTMLFormElement.prototype.submit = interceptor;
        this._bound_capture_submit = bound_capture_submit;
    }

    stop_capture() {
        window.removeEventListener('submit', this._bound_capture_submit, true);
        if ('real_submit' in HTMLFormElement.prototype) {
            HTMLFormElement.prototype.submit = HTMLFormElement.prototype.real_submit;
        }
    }


    capture_submit(e) {
        var target = e; // If e isn't instance of Event we are being passed form directly.
        if (e instanceof Event) {
            target = e.target;
        }
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
        

        var comment = this.parse_comment_form(form);
        this.oncapture(comment);
    }

    parse_comment_form(form) {
        var values = {};
        var input = form.getElementsByName("author").item(0) || form.getElementsByName("comment-author").item(0);
        if (input) values.author=input.value;
        input = form.getElementsByName("email").item(0) || form.getElementsByName("comment-email").item(0);
        if (input) values.email=input.value;
        input = form.getElementsByName("url").item(0) || form.getElementsByName("comment-url").item(0);
        if (input) values.url=input.value;
        input = form.getElementsByName("comment").item(0) || form.getElementsByName("comment-text").item(0);
        if (input) values.comment=input.value;
        input = form.getElementsByName("title");
        if (input) values.title=input.value;
        values.submit_url = form.getAttribute('action');
        return (new Comment(values));
    }

    oncapture(comment) {
        if (this.comment.empty) {
            console.log("Comment is empty!");
        } else {
            console.log("Sending comment to callback");
            this.callback(comment);
        }
    }
    
}


class Wordpress_blog extends Blog {

}

class Typepad_blog extends Blog {

}

browser.storage.local.get("options").then( (opts) => { 
    if ('debug' in opts) {debug = opts.debug;} 
    capture_comment_setup();
}).catch(       (reason) => {
            console.log('Couldn\t set debug  ('+reason+') here.');
            }
);

