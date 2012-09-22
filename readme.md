# jquery.autocompletr - A really extensible jquery autocompleter plugin

An easy to use and extendable jQuery plugin for autocompletion and suggesting in input fields. Which should be small in file size and fast.


## Why another one?

The actual available ones are either very opinionated, which means, you have to use it exactly like the author meant it, but if you want to change something in markup you find yourself overriding parts of the plugin. Others are very big, and do much more as many people will need.

So we decided to go for a new one, that is meant to have a small and useful set of features, which can be extended in anyway you want, instead of having all the features there can be, and then strip off / disable the features you do not need. Which will make for a smaller file size by nature.


## How to install

Simple include a recent version of jQuery and the jquery.autocompletr.js (or the minified version) from the lib directory.

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script src="./lib/jquery.autocompletr.js"></script>

Get an input field with jQuery and start call autocompletr on it.

    <input type="text">
    <script>
      $('input').autocompletr({
        source: ['foo', 'bar', 'baz', 'test']
      });
    </script>

Style it via css.

    <style type="text/css">
      ul {
        list-style-type: none;
      }
      .autocomplete-container {
        background: #fff;
        border: 1px solid #666;
        padding: 2px;
      }
      .autocomplete-container li {
        border-bottom: 1px solid #ccc;
      }
      .autocomplete-container .selected {
        background: #dedede;
      }
    </style>

It's that simple. But the default feature set can do more:


## Browser support?

Tested in IE 6 and above, Chrome, FF >= 3.6, Opera 12.

But I do not guarantee to test regularly in IE 6, it just happend that I did.


## What can it do?

Here is a list of things **jQuery.autocompletr** can do:

### Local list of suggestions
      $('input').autocompletr({
        source: ['option1', 'option2', 'option3', 'option4']
      });

Pass an array of strings to the `source` parameter. They will then used for suggesting texts for the user. It will use a fuzzy matcher similar to [that one](http://www.dustindiaz.com/autocomplete-fuzzy-matching/) described by [Dustin Diaz](http://www.dustindiaz.com).

### Remote list of suggestions
    $('input').autocompletr({
      source: '/typeahead' # mandatory, (default is [], so nothing will happen)
    });

In passing a (absolute or relative) url to the `source` parameter, the input field will ask the server for suggestions. By default it will pass the input as q query parameter and will do a GET request. But that can be changed through the `queryParameter` and `requestMethod` options

    $('input').autocompletr({
      source: '/typeahead',
      requestMethod: 'POST', # default: 'GET'
      queryParameter: 'keyword' # default: 'q'
    });

### Changing the delay
    $('input').autocompletr({
      source: '/typeahead',
      delay: 500 # default: 300
    });

With the `delay`parameter you can change the time the user has to wait, before the request is made to the server, asking for suggestions. Reducing the time will get faster suggestions to the user, but will probably increase the number of requests made to server the user will not see because he has typed ahead.

### changing where the Suggestion box will be appended
    $('input').autocompletr({
      source: '/typeahead',
      id: 'my-suggestions' # default: 'autocomplete-container'
    });

The box containing the suggestions will have an id, and this is changed via the ìd`option.

### changing where the Suggestion box will be appended
    $('input').autocompletr({
      source: '/typeahead',
      appendTo: '#anotherDiv' # default: 'body'
    });

When the `appendTo` options is not changed, the suggestion box, containing the suggestions matching the user input will be appended to the document's body. If set with a selector it will be appended on (every) matching element.

### want to position the suggestion box by yourself?
    $('input').autocompletr({
      source: '/typeahead',
      position: function(inputField, suggestionBox) { return [100, 200]; } # default: true
    });

The default of the `position`option is true. This means, the calculation of the position of the suggestion box is calculated through the — at the moment really basic — build in function. If you have a better one, or using one in your project already, you might want to you your own positioning method. Simply pass in a method to the `position`option, it will recieve the autocompletr enhanced input field and the suggestion box — both as jQuery objects — and should return an object with x- and y-coordinates of the top left corner of the box (according to it's position context, where it was appended to).

### processing the input
    $('input').autocompletr({
      source: '/typeahead',
      inputProcessor: function(value) {
        // only sending the last element of comma separated list to the server
        return $.trim(value.split(",").pop());
      } # default: function(val) { return val; }
    });

If you want to change the input value before sending it to the server or letting it match via the included fuzzy matcher, you can change it with the ìnputProcessor`option. For example it is ideal if you only want to match the last word of the users input. It gets the input value as parameter and should return the string that should be used for matching.

### processing the output
    $('input').autocompletr({
      source: '/typeahead',
      outputProcessor: function(value, oldValue) {
        // Don't try do that at home, the users want like it ;-) It is only an example.
        return oldValue;
      } # default: function(val) { return val; }
    });

If you do not specify otherwise, the selected value will be used as new value for the input. But if you pass a method to the `outputProcessor` option you can change that. It gets the selected value as first, and the old value in the input field as second parameter and needs a string returned which will then be used as new value for the input field.

### Changing the options
    $('input').autocompletr({
      source: ['option1', 'option2']
    });
    $('input').autocompletr({
      source: ['option1', 'option2', 'option3', 'option4']
    });

If autocompletr is called on an input field that is already enhanced, then every call after the initial call will only change the options. In this case, there would be four items suggested if you type 'op'.

### Restricting the size of suggestion box
    <style type="text/css">
      #autocomplete-container {
        max-height: 150px;
        overflow: hidden;
      }
    </style>

There is no option for that, but if you have more suggestions then the box (max-)height can handle, the container fill automatically scroll the suggestion box so you always can see what you have currently selected. Sweet, isn't it? ;-)


## How to contribute

*Found a bug? Have a future set has to be in here?*

Simply create an issue on github and describe it. Or if you are the hands on do-it-yourself kind of guy, then try this:

**Fork the code. Write your stuff. Make sure the tests pass.**

For testing your need jasmine. You can install the jasmine gems or simple use bundler for this:

    bundle install

And then run the tests in the browser:

    rake jasmine

And call `localhost:8888 in your browser.


## Contributers

- [Georg Tavonius (a.k.a Calamari)](https://github.com/Calamari/)

## Futures to come

- Mark the entered letters in result
- cache ajax results
