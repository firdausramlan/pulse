FlowRouter.route('/', {
  action: function(params, queryParams) {

    BlazeLayout.render('main', { top: "header", main: "dashboard", bottom: "footer" });

  }
});

FlowRouter.route('/settings', {
  action: function(params, queryParams) {

    BlazeLayout.render('main', { top: "header", main: "settings", bottom: "footer" });

  }
});