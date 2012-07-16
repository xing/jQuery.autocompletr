describe("jQuery.autocompletr", function() {
  var input, input2;
  var ajaxCount, ajaxOptions, ajaxDone;
  beforeEach(function() {
    jasmine.Clock.useMock();
    loadFixtures("autocompletr.html");
    input = $("#input");

    input2 = $("#input2");
    ajaxOptions = null;
    ajaxCount = 0;
    ajaxDone = null;

    spyOn($, 'ajax');
    $.ajax = function(options) {
      ++ajaxCount;
      ajaxOptions = options;
      return {
        done: ajaxDone || function() { return this; },
        always: function() { return this; },
        fail: function() { return this; }
      };
    };
  });

  afterEach(function() {
    input.autocompletr('remove');
    input2.autocompletr('remove');
    $('#autocomplete-container').remove();
  });

  it("is a jQuery plugin", function() {
    expect(input.autocompletr).toBeFunction();
  });

  describe("defined on input field (with directly added options)", function() {
    beforeEach(function() {
      input.autocompletr();
    });

    it("sets aria-autocomplete on input field", function() {
      expect(input).toHaveAttr('aria-autocomplete', 'list');
    });
    // TODO more aria stuff like exampled in http://www.w3.org/TR/wai-aria/roles#combobox

    it("sets attribute for default autocomplete to 'off", function() {
      expect(input).toHaveAttr('autocomplete', 'off');
    });

    it("does not send an ajax request", function() {
      input.autocompletr('open');
      expect(ajaxCount).toBe(0);
    });
  });

  describe("defined on an input field with option ajax url", function() {
    beforeEach(function() {
      ajaxOptions = null;

      input.autocompletr({
        source: '/get/data/here'
      });
      input2.autocompletr({
        source: '/get/data/here',
        requestMethod: 'post'
      });
    });

    describe("on keydown", function() {
      beforeEach(function() {
        input.val('here');
        input2.val('here');
        input.trigger('keydown');
      });

      describe("after the delay", function() {
        beforeEach(function() {
          jasmine.Clock.tick(301);
        });

        describe("an ajax call", function() {
          it("is fired ", function() {
            expect(ajaxCount).toBe(1);
          });

          it("goes to the right url", function() {
            expect(ajaxOptions.url).toBe('/get/data/here');
          });

          it("is send with default GET method", function() {
            expect(ajaxOptions.type).toBe('GET');
          });

          it("can be send with POST method", function() {
            input2.autocompletr('open');
            expect(ajaxOptions.type).toBe('POST');
          });

          it("sends the right data with the ajax request", function() {
            expect(ajaxOptions.data.q).toBe('here');
          });
        });
      });

      describe("keydown triggered twice within the delay", function() {
        beforeEach(function() {
          input.trigger('keydown');
          jasmine.Clock.tick(301);
        });

        it("fires ajax call only once ", function() {
          expect(ajaxCount).toBe(1);
        });
      });

      describe("the suggestions box", function() {
        beforeEach(function() {
          ajaxDone = function(cb) {
            cb([ 'test', 'test2' ]);
            return this;
          };
          jasmine.Clock.tick(301);
        });

        it("was opened", function() {
          expect($('#autocomplete-container')).toBeVisible();
        });
      });
    });

    it("is bound to event namespace called 'autocomplete'", function() {
      input.unbind('.autocomplete');
      input.autocompletr('open');
      jasmine.Clock.tick(301);
      expect(ajaxCount).toBe(0);
    });


    var havingDefaultSettings = function() {
      beforeEach(function() {
        input.autocompletr('open');
      });

      it("with id=autocomplete-container", function() {
        expect($('div#autocomplete-container')).toExist();
      });

      it("with the right data structure a list of links", function() {
        expect($('div#autocomplete-container')).toContain('ul li a');
      });

      it("with matching fields", function() {
        expect($('#autocomplete-container ul li').length).toBe(2);
        expect($('#autocomplete-container')).toContain('ul li[data-value=test]');
        expect($('#autocomplete-container')).toContain('ul li[data-value=test2]');
      });
    };

    describe("returning a result in format: array of objects with value", function() {
      beforeEach(function() {
        ajaxDone = function(cb) {
          cb([{ value: 'test' }, { value: 'test2' }]);
          return this;
        };
        input.val("test");
      });

      describe("having default settings it opens a list", havingDefaultSettings);
    });

    describe("returning a result in format: array strings", function() {
      beforeEach(function() {
        ajaxDone = function(cb) {
          cb([ 'test', 'test2' ]);
          return this;
        };
        input.val("test");
      });

      describe("having default settings it opens a list", havingDefaultSettings);
    });
  });

  describe("the option", function() {
    beforeEach(function() {
      input.val('my input');
    });

    it("queryParameter can be changed", function() {
      input.autocompletr({
        source: '/get/data/here',
        queryParameter: 'keyword'
      });
      input.autocompletr('open');
      expect(ajaxOptions.data.keyword).toBe('my input');
    });

    describe("minLength", function() {
      it("calls ajax request on keyup if exactly matched", function() {
        input.autocompletr({ source: '/get/data/here', minLength: 8 });
        input.autocompletr('open');
        expect(ajaxCount).toBe(1);
      });

      it("prevents keyup of triggering ajax request", function() {
        input.autocompletr({ source: '/get/data/here', minLength: 9 });
        input.autocompletr('open');
        expect(ajaxCount).toBe(0);
      });
    });

    describe("beforeShow", function() {
      describe("when callback is given", function() {
        var beforeShowCallCount, beforeShowArguments;
        beforeEach(function() {
          beforeShowArguments = null;
          beforeShowCallCount = 0;
          input.autocompletr({ source: ['foo',  'bar'], beforeShow: function() {
            beforeShowArguments = arguments;
            ++beforeShowCallCount;
          } });
          input.val('oo');
        });

        describe("and we open the list", function() {
          beforeEach(function() {
            input.autocompletr('open');
          });

          it("the callback is called", function() {
            expect(beforeShowCallCount).toBe(1);
          });

          it("the callback is called with input element and list container", function() {
            expect(beforeShowArguments[0]).toHaveId('input');
            expect(beforeShowArguments[1]).toHaveId('autocomplete-container');
          });
        });
      });
    });

    describe("id", function() {
      beforeEach(function() {
        input.autocompletr({ source: ['foo'], minLength: 1, id: 'my-autocomplete' });
        input.val('f');
        input.autocompletr('open');
      });

      afterEach(function() {
        $('#my-autocomplete').remove();
      });

      it("creates no element with default id", function() {
        expect($('#autocomplete-container')).not.toExist();
      });

      it("creates element with given id", function() {
        expect($('#my-autocomplete')).toExist();
      });
    });

    describe("delay", function() {
      beforeEach(function() {
        input.autocompletr({ source: ['foo'], minLength: 1, delay: 600 });
        input.val('f');
        input.trigger('keydown');
      });

      it("does not open delay with default delay", function() {
        jasmine.Clock.tick(301);
        expect($('#autocomplete-container')).not.toBeVisible();
      });

      it("opens the suggestions after given delay", function() {
        jasmine.Clock.tick(601);
        expect($('#autocomplete-container')).toBeVisible();
      });
    });

    describe("position", function() {
      describe("set to false", function() {
        beforeEach(function() {
          input.autocompletr({ source: ['foo'], minLength: 1, position: false });
          input.val('f');
          input.autocompletr('open');
        });

        it("does not add position=absolute", function() {
          expect($('#autocomplete-container')[0].style.position).not.toBe('absolute');
        });

        it("does not change top style", function() {
          expect($('#autocomplete-container')[0].style.top).toBeFalsy();
        });

        it("does not change left style", function() {
          expect($('#autocomplete-container')[0].style.left).toBeFalsy();
        });
      });

      describe("set to a function", function() {
        var args;
        beforeEach(function() {
          args = null;
          input.autocompletr({ source: ['foo'], minLength: 1, position: function() {
            args = arguments;
            return [23, 42];
          } });
          input.val('f');
          input.autocompletr('open');
        });

        describe("the callback", function() {
          it("gets the input element as first argument", function() {
            expect(args[0]).toHaveId('input');
          });

          it("gets the container as second argument", function() {
            expect(args[1]).toHaveId('autocomplete-container');
          });
        });

        it("adds position=absolute", function() {
          expect($('#autocomplete-container')[0].style.position).toBe('absolute');
        });

        it("uses returned top style", function() {
          expect($('#autocomplete-container')[0].style.top).toBe('42px');
        });

        it("uses returned left style", function() {
          expect($('#autocomplete-container')[0].style.left).toBe('23px');
        });
      });
    });
  });

  describe("the action", function() {
    describe("'close'", function() {
      beforeEach(function() {
        input.autocompletr({
          source: ['test', 'lala']
        });
        input.val('te');
        input.trigger('keydown');
        jasmine.Clock.tick(301);
      });

      it("closes the list again", function() {
        input.autocompletr('close');
        expect($('#autocomplete-container')).toBeHidden();
      });

      it("does not reopen the box after interval without changed input", function() {
        input.autocompletr('close');
        jasmine.Clock.tick(301);
        expect($('#autocomplete-container')).toBeHidden();
      });
    });

    describe("'list'", function() {
      beforeEach(function() {
        input.autocompletr({
          source: ['test', 'lala']
        });
        input.val('te');
        input.trigger('keydown');
      });

      it("returns the jQueryfied list element", function() {
        var list = input.autocompletr('list');
        expect(list.length).toBe(1);
        expect(list).toHaveId('autocomplete-container');
      });
    });

    describe("'remove'", function() {
      beforeEach(function() {
        input.autocompletr({
          source: '/get/it/here'
        });
      });

      it("unbinds every autocomplete event", function() {
        input.autocompletr('remove');
        input.trigger('keydown');
        expect(ajaxCount).toBe(0);
      });

      describe("with a list already added to the DOM", function() {
        beforeEach(function() {
          input.trigger('keydown');
          input.autocompletr('remove');
        });

        it("removes the autocomplete container from DOM again", function() {
          expect($('body')).not.toContain('#autocomplete-container');
        });

        it("removes aria-autocomplete attribute from input field", function() {
          expect(input).not.toHaveAttr('aria-autocomplete');
        });

        it("removes autocomplete attribute from input field", function() {
          expect(input).not.toHaveAttr('autocomplete', 'off');
        });
      });
    });
  });

  describe("when copy and pasting input via mouse context menu", function() {
    beforeEach(function() {
      input.autocompletr({ source: ['test'] });
      input.focus();
      input.val('te');
      jasmine.Clock.tick(301);
    });

    it("will open the suggestions box", function() {
      expect($('#autocomplete-container')).toBeVisible();
    });
  });

  describe("when open is called", function() {
    beforeEach(function() {
      input.val('test');
    });

    it("calls input processor", function() {
      var count = 0;
      input.autocompletr({ inputProcessor: function(val) { ++count; return val; } });
      input.autocompletr('open');
      expect(count).toBe(1);
    });

    it("and input processor gets field input value", function() {
      input.autocompletr({ inputProcessor: function(val) {
        expect(val).toBe('test');
        return val;
      } });
      input.autocompletr('open');
    });

    describe("and there are no entries matching", function() {
      beforeEach(function() {
        input.autocompletr({ source: ['foo'] });
        input.autocompletr('open');
      });

      it("does not append the suggestions box to body", function() {
        expect($('body')).not.toContain('#autocomplete-container');
      });

      describe("and it was open before", function() {
        beforeEach(function() {
          input.val('fo');
          input.autocompletr('open');
        });

        describe("and get reopened without matches", function() {
          beforeEach(function() {
            input.val('test');
            input.autocompletr('open');
          });

          it("does not append the suggestions box to body", function() {
            expect($('#autocomplete-container')).toBeHidden();
          });
        });
      });
    });

    it("and input processor can alter the input value (send to ajax method)", function() {
      input.autocompletr({ source: '/get/data/here', inputProcessor: function(val) {
        return 'te';
      } });
      input.autocompletr('open');
      expect(ajaxOptions.data.q).toBe('te');
    });

    it("and input processor can alter the input value (send to intern regex matcher)", function() {
      input.autocompletr({ source: ['foo', 'bar'], inputProcessor: function(val) {
        return 'foo';
      } });
      input.autocompletr('open');
      expect(input.autocompletr('list').find('li').length).toBe(1);
      expect(input.autocompletr('list')).toContain('[data-value=foo]');
    });

    describe("with default settings it opens a list", function() {
      var fields = ['test', 'test1', 'todo'];
      beforeEach(function() {
        input.autocompletr({ source: fields });
        input.autocompletr('open');
      });

      it("with id=autocomplete-container", function() {
        expect($('#autocomplete-container')).toExist();
      });

      it("the list is visible", function() {
        expect($('#autocomplete-container')).toBeVisible();
      });

      it("with the right data structure a list of links", function() {
        expect($('#autocomplete-container')).toContain('ul li a');
      });

      it("with matching fields", function() {
        expect($('#autocomplete-container')).toContain('ul li[data-value=test]');
        expect($('#autocomplete-container')).toContain('ul li[data-value=test1]');
        expect($('#autocomplete-container')).not.toContain('ul li[data-value=todo]');
      });

      it("shows two items", function() {
        expect($('#autocomplete-container ul li').length).toBe(2);
      });

      describe("and the input is changed", function() {
        beforeEach(function() {
          input.val('to');
          input.autocompletr('open');
        });

        it("shows now one item", function() {
          expect($('#autocomplete-container ul li').length).toBe(1);
        });
      });

      describe("and the user blurs from input field", function() {
        beforeEach(function() {
          input.trigger('blur');
        });

        it("suggestions are hidden", function() {
          jasmine.Clock.tick(501);
          expect($('#autocomplete-container')).toBeHidden();
        });
      });

      describe("the suggestions box", function() {
        it("has position absolute", function() {
          expect($('#autocomplete-container')[0].style.position).toBe('absolute');
        });

        it("is shown directly below the input field", function() {
          var positionBelowInput = input.position().top + input.height();
          expect($('#autocomplete-container').position().top).toBe(positionBelowInput);
        });

        it("is shown on same x coodinates", function() {
          expect($('#autocomplete-container').position().left).toBe(input.position().left);
        });
      });
    });

    describe("with default settings and fuzzy input", function() {
      var fields = ['test', 'täst1', 'tt', 'todo'];
      beforeEach(function() {
        input.val('tt');
        input.autocompletr({ source: fields });
        input.autocompletr('open');
      });

      it("fuzzy matches fields", function() {
        expect($('#autocomplete-container')).toContain('ul li[data-value=test]');
        expect($('#autocomplete-container')).toContain('ul li[data-value="' + escape('täst1') + '"]');
        expect($('#autocomplete-container')).toContain('ul li[data-value=tt]');
        expect($('#autocomplete-container')).not.toContain('ul li[data-value=todo]');
      });
    });

    describe("if itemRenderer is changed", function() {
      beforeEach(function() {
        input.autocompletr({ source: ['test me'], itemRenderer: function(ul, item) {
          ul.append('<li class="item">' + item + '</li>');
          ul.append('<li class="spacer">foobar</li>');
        } });
        input.autocompletr('open');
      });

      it("the html will adopt accordingly", function() {
        expect($('#autocomplete-container')).not.toContain('ul li a');
        expect($('#autocomplete-container')).toContain('ul li.item');
        expect($('#autocomplete-container')).toContain('ul li.spacer');
      });
    });

    describe("if containerRenderer is changed", function() {
      beforeEach(function() {
        input.autocompletr({ source: ['test me'], containerRenderer: function() {
          return $('<div><ul></ul><b>haha</b></div>');
        } });
        input.autocompletr('open');
      });

      it("the html will adopt accordingly", function() {
        expect($('#autocomplete-container')).toContain('b');
      });
    });

    describe("the content of the list", function() {
      var fields = ['"><b>xss</b><li data-value="'];
      beforeEach(function() {
        input.val("xss");
        input.autocompletr({ source: fields });
        input.autocompletr('open');
      });

      it("and it's data-value is secure", function() {
        expect($('#autocomplete-container')).toContain('ul li[data-value="' + escape('"><b>xss</b><li data-value="') + '"]');
      });

      it("and it's content is secure", function() {
        expect($('#autocomplete-container')).not.toContain('ul li b');
      });
    });
  });

  describe("when we open a simple list", function() {
    var fields = ['te st', 'test1', 'todo'];
    beforeEach(function() {
      input.val('te');
    });

    describe("and select something with a mouse click", function() {
      it("calls the output processor", function() {
        var count = 0;
        input.autocompletr({ source: fields, outputProcessor: function() { ++count; } });
        input.autocompletr('open');
        $('#autocomplete-container ul li a:last').click();
        expect(count).toBe(1);
      });

      it("and output processor gets the selected value", function() {
        input.autocompletr({ source: fields, outputProcessor: function(val) {
          expect(val).toBe('te st');
        } });
          input.autocompletr('open');
        $('#autocomplete-container ul li a:first').click();
      });

      it("and output processor gets the old value as second parameter", function() {
        input.autocompletr({ source: fields, outputProcessor: function(val, oldValue) {
          expect(oldValue).toBe('te');
        } });
        input.autocompletr('open');
        $('#autocomplete-container ul li a:first').click();
      });

      describe("-", function() {
        beforeEach(function() {
          input.autocompletr({ source: fields });
          input.autocompletr('open');
          $('#autocomplete-container ul li a:last').click();
        });

        it("changes the input field according to selected suggestion", function() {
          expect(input).toHaveValue('test1');
        });

        it("the input field keeps it focus", function() {
          expect(input).toBeFocused();
        });

        it("does not matter if we click on the li directly", function() {
          expect(input).toHaveValue('test1');
        });

        it("closes the suggestions box", function() {
          expect($('#autocomplete-container')).toBeHidden();
        });
      });
    });

    describe("and hover with the mouse over one item", function() {
      beforeEach(function() {
        input.autocompletr({ source: fields });
        input.autocompletr('open');

        $('#autocomplete-container ul li:first').mouseover();
      });

      it("marks this item as selected", function() {
        expect($('#autocomplete-container ul li:first')).toBe('.selected');
      });

      describe("and we hover over the next item", function() {
        beforeEach(function() {
          $('#autocomplete-container ul li:first').mouseout();
          $('#autocomplete-container ul li:first').next().mouseover();
        });

        it("marks this item as selected", function() {
          expect($('#autocomplete-container ul li:first').next()).toBe('.selected');
        });

        it("the last item is not selected any more", function() {
          expect($('#autocomplete-container ul li:first')).not.toBe('.selected');
        });
      });

      describe("and we hover out of the box", function() {
        beforeEach(function() {
          $('#autocomplete-container ul li:first').mouseout();
        });

        it("the item stays selected", function() {
          expect($('#autocomplete-container ul li:first')).toBe('.selected');
        });
      });

      describe("and press key down", function() {
        beforeEach(function() {
          var keydownEvent = $.Event('keydown');
          keydownEvent.which = 40; // key: DOWN

          input.trigger(keydownEvent);
        });

        it("marks the following item as selected", function() {
          expect($('#autocomplete-container ul li:first').next()).toBe('.selected');
        });
      });
    });

    describe("and press escape key", function() {
      beforeEach(function() {
        input.autocompletr({ source: fields });
        input.autocompletr('open');

        var keydownEvent = $.Event('keydown');
        keydownEvent.which = 27; // key: ESC

        input.trigger(keydownEvent);
      });

      it("closes the suggestions box", function() {
        expect($('#autocomplete-container')).toBeHidden();
      });
    });

    describe("and remove one character", function() {
      beforeEach(function() {
        input.autocompletr({ source: fields });
        input.autocompletr('open');

        input.val('t');

        input.trigger('keydown');
        jasmine.Clock.tick(301);
      });

      it("closes the suggestions box", function() {
        expect($('#autocomplete-container')).toBeHidden();
      });
    });

    describe("and press key down", function() {
      var countOutputProcessor, valueOutputProcessor;
      beforeEach(function() {
        countOutputProcessor = 0;
        valueOutputProcessor = null;
        input.autocompletr({ source: fields, outputProcessor: function(val) { ++countOutputProcessor; valueOutputProcessor = val; return val; } });
        input.autocompletr('open');

        var keydownEvent = $.Event('keydown');
        keydownEvent.which = 40; // key: DOWN

        input.trigger(keydownEvent);
      });

      it("marks first entry as selected", function() {
        expect($('#autocomplete-container ul li:first')).toBe('.selected');
      });

      describe("and add a char into input field", function() {
        beforeEach(function() {
          input.val('tes');
          input.trigger('keydown');
        });

        it("no entry is selected", function() {
          expect($('#autocomplete-container ul li')).not.toContain('.selected');
        });

        it("the list is still visible", function() {
          expect($('div#autocomplete-container')).toBeVisible();
        });
      });

      describe("and press key down again", function() {
        beforeEach(function() {
          var keydownEvent = $.Event('keydown');
          keydownEvent.which = 40; // key: DOWN

          input.trigger(keydownEvent);
        });

        it("marks the second entry as selected", function() {
          expect($('#autocomplete-container ul li:nth-child(2)')).toBe('.selected');
        });

        describe("and press key down a third time", function() {
          beforeEach(function() {
            var keydownEvent = $.Event('keydown');
            keydownEvent.which = 40; // key: DOWN

            input.trigger(keydownEvent);
          });

          it("has no items selected (since we have only two items)", function() {
            expect($('#autocomplete-container ul')).not.toContain('.selected');
          });
        });
      });

      describe("we press enter", function() {
        beforeEach(function() {
          var keydownEvent = $.Event('keydown');
          keydownEvent.which = 13; // key: ENTER

          input.trigger(keydownEvent);
        });

        it("calls output processor", function() {
          expect(countOutputProcessor).toBe(1);
        });

        it("gives the selected value to output processor", function() {
          expect(valueOutputProcessor).toBe('te st');
        });

        it("changes the input field according to selected suggestion", function() {
          expect(input).toHaveValue('te st');
        });

        it("closes the suggestions box", function() {
          expect($('#autocomplete-container')).toBeHidden();
        });
      });
    });

    describe("and press key up", function() {
      beforeEach(function() {
        input.autocompletr({ source: fields });
        input.autocompletr('open');

        var keydownEvent = $.Event('keydown');
        keydownEvent.which = 38; // key: UP

        input.trigger(keydownEvent);
      });

      it("marks last entry as selected", function() {
        expect($('#autocomplete-container ul li:last')).toBe('.selected');
      });

      describe("and press key up again", function() {
        beforeEach(function() {
          var keydownEvent = $.Event('keydown');
          keydownEvent.which = 38; // key: UP

          input.trigger(keydownEvent);
        });

        it("marks the first entry as selected", function() {
          expect($('#autocomplete-container ul li:first')).toBe('.selected');
        });

        describe("and press key up a third time", function() {
          beforeEach(function() {
            var keydownEvent = $.Event('keydown');
            keydownEvent.which = 38; // key: UP

            input.trigger(keydownEvent);
          });

          it("has no items selected (since we have only two items)", function() {
            expect($('#autocomplete-container ul')).not.toContain('.selected');
          });
        });

        describe("and press key down then", function() {
          beforeEach(function() {
            var keydownEvent = $.Event('keydown');
            keydownEvent.which = 40; // key: DOWN

            input.trigger(keydownEvent);
          });

          it("has no items selected (since we have only two items)", function() {
            expect($('#autocomplete-container ul li:last')).toBe('.selected');
          });
        });
      });

      describe("and press key down then", function() {
        beforeEach(function() {
          var keydownEvent = $.Event('keydown');
          keydownEvent.which = 40; // key: DOWN

          input.trigger(keydownEvent);
        });

        it("has no items selected (since we have only two items)", function() {
          expect($('#autocomplete-container ul')).not.toContain('.selected');
        });
      });
    });
  });

  describe("when we have no items to show", function() {
    beforeEach(function() {
      input.autocompletr({ source: [] });
    });

    describe("and press key down", function() {
      beforeEach(function() {
        var keydownEvent = $.Event('keydown');
        keydownEvent.which = 40; // key: DOWN

        input.trigger(keydownEvent);
      });

      it("the menu is not there", function() {
        expect($('body')).not.toContain('#autocomplete-container');
      });
    });

    describe("and press key enter", function() {
      beforeEach(function() {
        var keydownEvent = $.Event('keydown');
        keydownEvent.which = 13; // key: ENTER

        input.trigger(keydownEvent);
      });

      it("the menu is not there", function() {
        expect($('body')).not.toContain('#autocomplete-container');
      });
    });
  });
});
