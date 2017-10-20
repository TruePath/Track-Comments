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

    get empty() {
        return ((this.comment instanceof String) && (this.comment.length > 0));
    }
}