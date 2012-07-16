/*
  Put on top of the file before describe statements
  Usage: expect(fn).toBeFunction()
  From: https://gist.github.com/2282484
*/
beforeEach(function (){
  this.addMatchers({
    toBeFunction: function (){
      return Object.prototype.toString.call(this.actual)==='[object Function]';
    },
    toBeFocused: function(selector) {
      return this.actual.is(':focus')
    }
  });
});
