---
layout: post
title:  "A Better Way to Perform Multiple Comparisons in Javascript"
date:   2017-08-12 15:16:00 +0200
comments: true
---

Having to compare a value with a bunch of other values is a common, even trivial task for a developer. It's something you probably don't even think about when you have to do it.

Look at the following Javascript example:

{% highlight js %}
var name = 'Kurt';
if (name === 'Jimi' || name === 'Amy' || name === 'Janis') {
    // do stuff
}
{% endhighlight %}

Nothing fancy here. It works as you expect it to, but somehow it doesn't feel quite right. Like you could do it better. Like there must be a *smarter way*.

There are several problems in the above condition:

- It's **repetitive**. If you need to change something (new variable name, new operators, etc.), you have to make sure you don't forget an occurence. This can be even more tedious if your condition is more complex, like (`x === a || x === b || x !== c...`).
- It's **long**. If you have line length-based coding standards in your project (such as the no more than 80 characters per line rule), you won't be able to add more conditions to your `if` statement without either breaking it into several lines (messy and hard to read) or shortening your variable names (a terrible short-term solution, and you may not even have a choice).
- It's **hard to read**. This might be *okay* with 3 statements like we have up here but the more you add, the more illegible it will get.

## Native Javascript alternative

When given a problem, it's always a good idea to look at it from different perspectives. What if, instead of comparing a value to every possibility one by one, we simply tried to check if it exists in a **list**?

{% highlight js %}
var names = ['Jimi', 'Amy', 'Janis', 'Brian', 'Jim', 'Robert', 'Kurt'];
if (names.indexOf('Kurt') !== -1) {
    // do stuff
}
{% endhighlight %}

Instead of repeating our search value/variable, we're using Javascript's native `Array.prototype.indexOf()` method to see if it exists in an array of values. `indexOf()` returns the value's position, so we only have to make sure the result is different from `-1` (which is what `indexOf()` returns if the value isn't found).

This method is a lot clearer, more elegant, legible and DRY. It's also a lot more **convenient**. In real-life projects you usually get lists of values from API calls or database requests, which come as an array or can easily be turned into one. It's much smarter for you to use this method than loop over every value and match it against your string.

Imagine you're building an banking app where the user must input his bank name to make sure it's supported. The app currently supports 20 banks, but plans on adding more with time. Are you going to create a long and complicated condition and edit it every time you add a new value? Are you going to loop over a collection you got from an API call and return `true` as soon as you have a match? Hell no.

{% highlight js %}
var banks = [
    'JPMorgan Chase', 'Bank of America', 'Wells Fargo',
    'Citigroup', 'Goldman Sachs', 'Morgan Stanley',
    'U.S. Bancorp', 'PNC Financial Services', '	Capital One',
    'TD Bank, N.A.', 'The Bank of New York Mellon', 'Barclays',
    'HSBC Bank USA', 'State Street Corporation',
    'Charles Schwab Corporation', 'BB&T', 'Credit Suisse',
    'SunTrust Banks', 'Deutsche Bank', 'Ally Financial'
];

// or something like
// var banks = Api.get('bankList');

if (banks.indexOf(document.getElementById('myBank').value) !== -1) {
    // do stuff
}
{% endhighlight %}

Here, we keep our list separate in a variable (either hard-coded or from a database) and perform the condition on it with `indexOf()`. If the list changes, that's all we need to maintain, in one place, without touching any logic.

And what if you don't have an array but a string instead? Easy.

- Either use Javascript's native `String.prototype.indexOf()` method...
- ... or if you have a consistent separator in your string, break it up into an array with `String.prototype.split()` then refer to the tutorial above.

{% highlight js %}
'Motown Records'.indexOf('Records'); // returns 7 (position in the string)

var label = 'Def Jam Recordings';
label.indexOf('Records'); // returns -1 (not found)

var artists = 'Diana Ross,Michael Jackson,Stevie Wonder,The Temptations,Marvin Gaye';
artists.split(',')
       .indexOf('Marvin Gaye'); // returns 4 (position in the array)

{% endhighlight %}

## IE8-friendly solutions

Maybe you *have* to put up with [IE8 (or older)][breakupwithie8]. My condoleances, I know how you feel. Working with Internet Explorer has always been a pain for front-end developers. Unfortunately for us, the `indexOf()` method wasn't implemented in the prototype of the `Array` object before IE9. Bummer.

What do we do then? Do we go back to repetitive comparisons? Of course not. There's a light at the end of the tunnel, in fact there's even **two ways out of it**: using either **jQuery** or a **polyfill**.

jQuery has `$.inArray`, a great utility function offering exactly what we want: it looks for a value (of any type) in an array, returns a position, and it's compatible with IE8.

{% highlight js %}
var names = ['Jimi', 'Amy', 'Janis', 'Brian', 'Jim', 'Robert', 'Kurt'];
if ($.inArray('Kurt', names) !== -1) {
    // do stuff
}
{% endhighlight %}

If you can't use jQuery (or don't want to include it only for `$.inArray`), you can still add a polyfill. MDN made one for [Array.prototype.indexOf()][mdn:array-indexof-polyfill] you can use in your project. You'll be able to use `indexOf()` on an array like you'd normally do, even with IE8:

{% highlight js %}
// polyfills/indexOf.js

if (!Array.prototype.indexOf)
    Array.prototype.indexOf = function(searchValue, index) {
        // In non-strict-mode, if the `this` variable is null
        // or undefined, then it is set the the window object.
        // Else, `this` is automaticly converted to an object.
        var len = this.length >>> 0; // convert ot number or 0

        index |= 0; // rounds and NaN-checks
        if (index < 0) // check if negative start
            index = Math.max(len - index, 0);
        else if (index >= len) // else, check if too big
            return -1;

        if (searchValue === undefined)
            // Because searchValue is undefined, keys that
            // don't exist will have the same value as the
            // searchValue, and thus do need to be checked.
            do {
                if (index in this && this[index] === undefined)
                    return index;
            } while (++index !== len)
        else
            // Because searchValue is not undefined, there's no
            // need to check if the current key is in the array
            // because if the key isn't in the array, then it's
            // undefined which is not equal to the searchValue.
            do {
                if (this[index] === searchValue)
                    return index;
            } while (++index !== len)

        // if nothing was found, then simply return -1
        return -1;
    };
{% endhighlight %}

{% highlight html %}
<!-- index.html -->

<script src="polyfills/indexOf.js"></script>
<script>
    var needle = 'frontstuff';
    var haystack = ['CSS Tricks', 'David Walsh Blog', 'frontstuff'];
    var isACoolBlog = haystack.indexOf(needle) !== -1; // true
</script>
{% endhighlight %}

## References

- [`Array.prototype.indexOf()` on MDN][mdn:array-indexof]
- [`String.prototype.indexOf()` on MDN][mdn:string-indexof]
- [`String.prototype.split()` on MDN][mdn:split]
- [jQuery's `$.inArray`][jquery:inarray]

[mdn:array-indexof]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
[mdn:string-indexof]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf
[mdn:array-indexof-polyfill]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
[mdn:split]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
[jquery:inarray]: https://api.jquery.com/jQuery.inArray/
[breakupwithie8]: http://breakupwithie8.com/