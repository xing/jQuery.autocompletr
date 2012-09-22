/**
 * jQuery.autocompletr
 * @version 0.1.4
 *
 * @author Georg Tavonius a.k.a. Calamari <https://github.com/Calamari>
 * @homepage https://github.com/xing/jQuery.autocompletr
 */
(function($, undefined) {
  var emptyFunction = function(x) { return x; },

      KEY_ENTER  = 13,
      KEY_UP     = 38,
      KEY_DOWN   = 40,
      KEY_ESCAPE = 27;


  /**
   * The Object for the List with the Suggestions
   */
  var Suggestions = function(input, options) {
    this.input = input;
    this.options = options || {};
    this.container = this.createMarkup();
    this._lastInput = input.val();
  };
  Suggestions.prototype = {
    // sets the options
    setOptions: function(options) {
      $.extend(this.options, options);
    },
    // creates the markup for suggestion box
    createMarkup: function() {
      var options   = this.options,
          container = options.containerRenderer().attr('id', options.id).addClass('autocomplete-container'),
          self      = this;

      container
        .bind('click.autocomplete', function(event) {
          var li = $(event.target).closest('li');
          if (li.length) {
            self._select(li);
          }
          self.close();
          self.input.focus();
          event.preventDefault();
          event.stopPropagation();
        })
        .on('mouseover', 'li', function(event) {
          container.find('li').removeClass('selected');
          $(event.currentTarget).addClass('selected');
        });
      return container;
    },
    // try opening the suggestions
    open: function() {
      var data       = {},
          options    = this.options,
          inputValue = options.inputProcessor(this.input.val());

      if (inputValue.length >= options.minLength) {
        data[options.queryParameter] = inputValue;
        if (typeof options.source === 'string') {
          $.ajax({
            url: options.source,
            data: data,
            type: options.requestMethod.toUpperCase()
          }).done($.proxy(this._show, this));
        } else {
          this._show(options.matcher(inputValue, options.source));
        }
      } else {
        this.close();
      }
    },
    // shows the suggestion box with given items
    _show: function(itemList) {
      var options       = this.options,
          input         = this.input,
          container     = this.container,
          inputPosition = input.offset(),
          ul            = this._ul().empty(),
          numberItems   = itemList.length;

      for (var i=0; i<numberItems; ++i) {
        options.itemRenderer(ul, itemList[i]);
      }
      if (numberItems) {
        container.appendTo($(options.appendTo));
        if (options.position === true) {
          container.css({
            position: 'absolute',
            left: inputPosition.left,
            top: (inputPosition.top + input.outerHeight())
          });
        } else if($.isFunction(options.position)) {
          var position = options.position(input, container);
          container.css({
            position: 'absolute',
            left: position[0],
            top: position[1]
          });
        }
        options.beforeShow(input, container);
        container.show();
      } else {
        container.hide();
      }
    },
    // determines if suggestions are open
    isOpen: function() {
      return this.container.is(':visible');
    },
    // closes the suggestion box if it is open
    close: function() {
      this.container.hide();
      this._lastInput = this.input.val();
    },
    // returns the suggestion box element
    list: function() {
      return this.container.eq(0);
    },
    // returns the ul element of this suggestion box
    _ul: function() {
      return this.container.is('ul') ? this.container : this.container.find('ul');
    },
    // removes the suggestion box element
    remove: function() {
      this.input
        .unbind('.autocomplete')
        .removeAttr('aria-autocomplete autocomplete');
      this.container.remove();
      clearInterval(this._delayInterval);
    },
    _step: function(dir) {
      var ul       = this._ul(),
          selected = ul.find('li.selected');

      if (selected.length) {
        selected
          .removeClass('selected')[dir === 1 ? 'next' : 'prev']()
          .addClass('selected');
      } else {
        ul.find('li:' + (dir === 1 ? 'first' : 'last')).addClass('selected');
      }
    },
    // selects the next element in list
    next: function() {
      this._step(+1);
    },
    // selects the previous element in list
    previous: function() {
      this._step(-1);
    },
    // chooses the actual selected item
    select: function() {
      var ul       = this._ul(),
          selected = ul.find('li.selected');

      if (selected.length) {
        this._select(selected);
      }
    },
    _select: function(item) {
      var newValue = this.options.outputProcessor(unescape(item.data('value')), this.input.val());
      this.input.val(newValue);
    },
    resetOpenInterval: function() {
      var self = this;
      clearInterval(this._delayInterval);
      this._delayInterval = setInterval(function() {
        if (self.input.val() !== self._lastInput) {
          self.open();
          self._lastInput = self.input.val();
        }
      }, this.options.delay);
    }
  };

  $.fn.autocompletr = function(options) {
    if (typeof options === 'string') {
      var action = options;
    } else {
      options = $.extend({
        // id of suggestions box element
        id: 'autocomplete-container',
        // append list to this element
        appendTo: 'body',
        // after which input shall we start?
        minLength: 2,
        // time till ajax in ms
        delay: 300,
        // list of possible elements or url where to get them
        source: [],
        // allows the automatic positioning
        position: true,
        // Matcher that selects all relevant fields from source (has to return the reduced list)
        // (inspired by: http://www.dustindiaz.com/autocomplete-fuzzy-matching/)
        matcher: function(input, source) {
          if (!Array.prototype.filter) {
            throw new Error("Add Shim for Array.prototype.filter. Maybe use: http://www.tutorialspoint.com/javascript/array_filter.htm")
          }
          var reg = new RegExp($.map((input || "").split(""), function(value) {
            // Escape regex chars
            return value.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
          }).join("[a-zA-Z0-9ßÄÖÜäöüÑñÉéÈèÁáÀàÂâŶĈĉĜĝŷÊêÔôÛûŴŵ_]*"), "i");
          return source.filter(function(element) {
            if (element.match(reg)) {
              return element;
            }
          });
        },
        // which ajax method to use, when getting the elements
        requestMethod: 'GET',
        // how should the query parameter be named?
        queryParameter: 'q',
        // filter that is called for processing the input valued (has to return a String)
        inputProcessor: emptyFunction,
        // filter that is called after selecteing a result and before inserting this in the input field (has to return a String)
        outputProcessor: emptyFunction,
        // callback called for each item that will be shown (you could prevent showing it here)
        itemRenderer: function(ul, item) {
          item = typeof item === 'string' ? item : item.value;
          ul.append('<li data-value="' + escape(item) + '"><a tabindex="-1">' + escape(item) + '</a></li>');
        },
        // callback called for constructing the container
        containerRenderer: function() {
          return $('<div><ul></ul></div>');
        },
        // callback called before container will be shown
        beforeShow: emptyFunction,
        // callback called before item will be send to server (here is your chance to alter what will be send to server)
        beforeSend: emptyFunction
      }, options);
    }


    var returnValue, delayInterval;
    var thisElements = this.each(function() {
      var element     = $(this),
          suggestions = element.data('autocomplete-suggestions'),
          lastInput   = element.val(),
          container, ul;
      if (action) {
        if (suggestions) {
          returnValue = suggestions[action]();
        }
        return;
      }
      if (suggestions === undefined) {
        suggestions = new Suggestions(element, options);
        container = suggestions.container;
        element.data('autocomplete-suggestions', suggestions);
      } else {
        suggestions.setOptions(options);
      }
      element
        .attr('aria-autocomplete', 'list')
        .attr('autocomplete', 'off')
        .on('keydown.autocomplete', function(event) {
          var inputValue = suggestions.input.val(),
              keyCode    = event.which;

          if (keyCode === KEY_DOWN) {
            suggestions.next();
            event.preventDefault();
          } else if (keyCode === KEY_UP) {
            suggestions.previous();
            event.preventDefault();
          } else if (keyCode === KEY_ESCAPE) {
            suggestions.close();
          } else if (keyCode === KEY_ENTER && suggestions.isOpen()) {
            suggestions.select();
            suggestions.close();
            event.preventDefault();
            event.stopPropagation();
          } else {
            // delay because input field is filled after keydown event is processed
            suggestions.resetOpenInterval();
          }
        })
        .on('focus.autocomplete', function(event) {
          suggestions.resetOpenInterval();
        })
        .on('blur.autocomplete', function(event) {
          // if we want to be able to click, we have to close the element after the click was handled
          setTimeout(function() {
            suggestions.close();
          }, 500);
        });
    });
    return returnValue || thisElements;
  };
}(jQuery));
