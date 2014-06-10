var SendMoney = {
  Models: {},
  Views: {},

  init: function() {
    new this.Router();
    Backbone.history.start();
  }
};


SendMoney.Views.Payment = Backbone.View.extend({
  template: JST['templates/payment-form.hbs'],

  events: {
    'keyup #amount':'showDisplayValue',
    'change #currency': 'showDisplayValue',
    'submit #payment-form': 'submit',
    'click .reset': 'clearDisplayText'
  },

  initialize: function() {
    this.overlay = new SendMoney.Views.Overlay({el: '.overlay'});
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  showDisplayValue: function() {
    // maybe change placeholder text?
    var inputValue = document.getElementById('amount').valueAsNumber;
    var displayValue = this.formatCurrency(inputValue);
    this.$('#display-value').text(displayValue);
  },

  formatCurrency: function(input) {
    if(!input) return '';
    var options = this.getLocalStringOptions();
    var displayAmount = input.toLocaleString('en', options);
    this.model.set('displayAmount', displayAmount);

    return displayAmount;
  },

  getLocalStringOptions: function() {
    return {
      'style': 'currency',
      'currency': this.$('#currency').val()
    };
  },

  submit: function(e) {
    e.preventDefault();
    this.setModel();
    this.loadingRedirect();
  },

  setModel: function() {
    var formArray = this.$('#payment-form').serializeArray();
    formArray.forEach(function(inputObj) {
      var field = inputObj.name;
      var value = inputObj.value;
      this.model.set(field, value);
    }, this);
  },

  loadingRedirect: function() {
    var end = _.bind(this.finishLoading, this);
    this.startLoading();

    _.delay(end, 1500);
  },

  startLoading: function() {
    this.overlay.showOverlay();
  },

  finishLoading: function() {
    this.overlay.hideOverlay();

    window.location.hash = 'success';
  },

  clearDisplayText: function() {
    this.$('#display-value').text('');
  }
});



SendMoney.Views.Overlay = Backbone.View.extend({

  showOverlay: function() {
    this.$el.show();
  },

  hideOverlay: function() {
    this.$el.hide();
  }
});



SendMoney.Views.Index = Backbone.View.extend({
  template: JST['templates/choice.hbs'],

  render: function() {
    this.$el.html(this.template());
    return this;
  }
});



SendMoney.Views.Sucess = Backbone.View.extend({
  template: JST['templates/success.hbs'],

  render: function() {
    var context = this.model.toJSON();
    this.$el.html(this.template(context));
    return this;
  }
});



SendMoney.Views.Transactions = Backbone.View.extend({
  template: JST['templates/transactions.hbs'],

  initialize: function() {
    this.isLoading = false;
    this.transactions = [];
    this.nextUrl = '/api/transactions/';
  },

  render: function() {
    _.bindAll(this, 'scrollEvent');
    $(window).scroll(this.scrollEvent);

    this.$el.html(this.template());
    this.fetchTransaction();

    if(this.transactions.length > 0) {
      this.drawTrasactions(this.transactions);
    }
  },

  scrollEvent: function() {
    var documentHeight = $(document).height();
    var scrollHeight = $(window).scrollTop() + $(window).height();
    var trigger = scrollHeight > documentHeight;

    if(trigger && !this.isLoading) {
      this.fetchTransaction();
    }
  },

  fetchTransaction: function() {
    if(!this.nextUrl) return;

    var callback = function(res) {
      this.transactions = this.transactions.concat(res.data);
      this.drawTrasactions(res.data);

      this.nextUrl = res.nextUrl;
    };
    var cb = _.bind(callback, this);

    this.isLoading = true;

    $.getJSON(this.nextUrl)
      .then(cb);
  },

  drawTrasactions: function(data) {
    var rows = JST['templates/transaction.hbs']({trasaction: data});
    this.$('table').append(rows);
    this.isLoading = false;
  }

});


SendMoney.Models.Transaction = Backbone.Model.extend({});


SendMoney.Views.App = Backbone.View.extend({
  initialize: function() {
    this.transacion = new SendMoney.Models.Transaction();

    this.sendmoneyView = new SendMoney.Views.Payment({
      el: '#main',
      model: this.transacion
    });

    this.sucessView = new SendMoney.Views.Sucess({
      el: '#main',
      model: this.transacion
    });

    this.indexView = new SendMoney.Views.Index({el: '#main'});
    this.transactionsView = new SendMoney.Views.Transactions({el: '#main'});
    this.$heading = this.$el.find('h1');
    this.$footer = this.$el.find('.inner-foooter');
  },

  choicescreen: function() {
    this.$heading.text('What are we Doing?');
    this.$footer.empty();
    this.indexView.render();
  },

  sendmoney: function() {
    this.$heading.text('Send Money');
    this.$footer.empty();
    this.sendmoneyView.render();
  },

  success: function() {
    if(this.transacion)

    this.sucessView.render();
    this.$footer.html('<a class="btn sendmoney" href="#sendmoney">Send Money</a><a class="btn transaction" href="#transactions">Transaction History</a>');
  },

  transactions: function(){
    this.$heading.text('Transaction History');
    this.$footer.html('<a class="btn back" href="#">Back</a>');
    this.transactionsView.render();
  }

});


SendMoney.Router = Backbone.Router.extend({
  routes: {
    '': 'choicescreen',
    'sendmoney': 'sendmoney',
    'success': 'success',
    'transactions': 'transactions'
  },

  initialize: function() {
    this.appView = new SendMoney.Views.App({
      el: 'body',
    });

    this.on('route', this.unbindScroll);
  },

  choicescreen: function() {
    this.appView.choicescreen();
  },

  sendmoney: function() {
    this.appView.sendmoney();
  },

  success: function() {
    this.appView.success();
  },

  transactions: function(){
    this.appView.transactions();
  },

  unbindScroll: function(route) {
    // Make sure the scroll event does not fire ajax request
    // unless the user is on the transactions screen
    if (route !== 'transactions') {
      $(window).unbind('scroll');
    }
  }
});


SendMoney.init();
