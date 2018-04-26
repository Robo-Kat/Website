router = {}

router.use = function(route,router) {
	router.baseRouter = this;
	this.routes.set([route,['GET','POST','HEAD','PUT','DELETE','OPTIONS','CONNECT','TRACE','PATCH','WSS']],router);
}

router.handle = function(stream,req,next,iter) {
	if (req[':path']) {
		req.url = decodeURI(req[':path']);
		req.method = req[':method'];
	}
	else if (req.url) {
		req.method = 'WSS'
	}
	var iter = iter && typeof iter.next==='function'?iter:this.routes.entries();
	while ([value,done]=Object.values(iter.next()),!done) {
		[[route,Methods],handler] = value;
		if (Methods.includes(req.method) && (regex = route.exec(req.url),regex)) {
			[,...req.params] = regex;
			handler(stream,req,this.handle.bind(this,stream,req,next,iter));
			return;
		}
	}
	if (typeof next === 'function') next(stream,req)
}

router.route = function(route,methods,handler) {
	if (methods = 'all') methods = ['GET','POST','HEAD','PUT','DELETE','OPTIONS','CONNECT','TRACE','PATCH','WSS'] //IDK all the http methods
	this.routes.set([route,methods],handler)
}


function routerfact() {
	function app(stream,req,next,iter) {
		return app.handle(stream,req,next,iter)
	}
	Object.assign(app,router);
	app.routes = new Map();
	return app;
}

exports = module.exports = routerfact;

exports.route = router.route.bind(router);
