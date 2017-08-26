---
layout: post
title:  "Build a Simple Validator Service in Javascript"
date:   2017-08-27 00:20:00 +0200
---

**Data validation is a pain**. Not only is it hard to do it right, but it can also be difficult to implement without making a mess. When trying to validate data before saving it, it's easy to pollute methods and violate many programming best practices.

For all those reasons, a much better way would be to handle validation via a **validator service**. In programming, a [service][wiki:sop] is a unit that externalizes business logic from entities.

Using services is a great way to keep a clean codebase by breaking down responsibilities. A validator service will allow us to avoid having to explicitly validate data ourselves in our methods. Instead, we'll create a reusable unit we can rely on to build the foundations of our program.

## The world before using a validator service

Let's say we're building a simple model. Until now, when we wanted to validate data before setting it, our model's setter methods looked something like this:

{% highlight js %}
var Model = function() {
    this.name = '';
}

Model.prototype.setName = function(name) {
    if (typeof name === 'string') {
        this.name = name;
    }
}
{% endhighlight %}

Meh. I don't know about you, but I dislike having the entire content of a method wrapped into an `if` statement. If the *whole* purpose of my method is conditional, it makes me feel like I skipped a step. Like there's something I need to take care of *beforehand*. Plus, do you imagine what we'll need to do if we have to **add** rules?

{% highlight js %}
Model.prototype.setName = function(name) {
    if (typeof name === 'string' && name !== '' && ...) {
        this.name = name;
    }
}
{% endhighlight %}

Gross. Imagine if we wanted to set several values, like all the properties of a single object, in the same method? I don't even want to figure out what it would look like.

And in fact, there's much more than one problem to this code structure:

- It's **hard to read**. As seen above, we can quickly end up with many successive or imbricated `if` statements, bloated with complex validation rules. To change it you'd have to spend time understanding what's going on, then perform your edit, while making sure you're not breaking anything.
- It’s **repetitive**. Chances are all your setter methods will have one or more `if` statements that pretty much do the same thing. This goes against the fundamental [DRY principle][wiki:dry], which states *"every piece of knowledge must have a single, unambiguous, authoritative representation within a system"*. The goal is for us to keep every change to this knowledge in sync across the entire program. If you have repetitive code to check if a value is not empty, for example by doing `value !== ''`, and then want to reinforce it by adding `&& value !== null && typeof value !== 'undefined'`, you'll have to find every occurrence of your former code and update it. This is tedious, time-consuming, has low added-value, and prone to bugs.
- It **violates SRP**. The [single responsibility principle][wiki:srp] states *"a class should have only one reason to change"*. In the above example, our method does two things: it validates data and it assigns it if the test passes. We could even say it does more than that because it stores validation rules for the model's `name` property (making it impossible to use elsewhere without duplicating code). The point is, the method has more than one responsibility, and this makes it more difficult to test, reuse, read and refactor.
- It **couples logic and data**. Right now every time we need to change the validation rules for this method, we'll have to touch the `if` statement. As a direct consequence of violating SRP, the method couples two things that should be separate: a logic mechanism that should never change, and variable data.

If we want to build a clear, solid and scalable program, this is **everything we want to avoid**. What we want is something with a validation mechanism that's set once in a generic way **so we can reuse it**. We also want to store our validation rules separately, somewhere where it makes more sense, and in a way that's **easily editable**. Finally, we want validation to be "invisible": it must be done under the hood and never appear explicitly in our setter methods.

## Starting with what you want

When I'm tackling a new problem and I don't know where to start, my method of choice is **reverse engineering**. I start with what I want my final code to be and I backward build to make it work.

Here's how we'd ideally want to setup the model:

{% highlight js %}
// Model.js

var Model = function() {
    this.name = {
        value: null,
        validator: ['isString', 'isNotEmpty']
    };
    this.age = {
        value: null,
        validator: ['isInt']
    };
}
{% endhighlight %}

**This would be perfect**. It doesn't work yet, but this is what we'd want our validator to deal with in the end. Instead of assigning values directly to a variable, we decide every property is an object with at least two sub-properties: its actual **value**, and an array of its **validation rules**. This is legible, it has a standard format and we can easily add, change or remove rules. We don't have to worry about the actual validation system that will handle them.

From here, let's start thinking about how we can build our `Validator` object. We want to validate data from an array of strings. So, for every rule, we need a dedicated method that uses the **exact same name**.

{% highlight js %}
// Validator.js

var Validator = function() {};

Validator.prototype.isString = function(value) {
    if (typeof value === 'string') {
        return true;
    }
    return false;
};

Validator.prototype.isNotEmpty = function(value) {
    if (value !== '' && value !== null && typeof value !== 'undefined') {
        return true;
    }
    return false;
};

Validator.prototype.isInt = function(value) {
    return Number.isInteger(value);
};
{% endhighlight %}

Every validation method follows the same model: it takes a value, makes sure it's valid and returns a boolean. Instead of using messy `if` statements directly in setter methods, we have a much cleaner way to validate data:

{% highlight js %}
var validator = new Validator();

validator.isString('Iggy Pop'); // returns true
validator.isInt('10'); // returns false
{% endhighlight %}

Now, this is nice but we don't actually want to do it by hand. We want to list out rules in the model and for them to be automatically validated. So for this, we need a method:

{% highlight js %}
// Validator.js

Validator.prototype.validate = function(value, rules) {
    var self = this;
    return rules.every(function(rule) {
        return self[rule](value);
    });
};
{% endhighlight %}

Don't freak out, I'll explain 😁 What we want is for our value to be checked against a set of rules. This could be one rule or a thousand, which is why it's ideal to have rules listed in an array. If at least one rule doesn't pass we need to return `false`, else we'll return `true`.

Our method takes two arguments: a value to test, and a set of rules as an array. Each rule must be the exact name of the validator's method that needs to be called, as a `string`.

We're using the native Javascript method `Array.prototype.every()`. As explained on [MDN][mdn:every], it *"tests whether all elements in the array pass the test implemented by the provided function"*. We use it to call every rule one after the other, and we pass it the value we want to test. Since `every()` needs **every** (duh!) test to return `true` to itself return `true`, we can simply return it.

### And what about this `self[rule](value)` weirdness?

This line is what's going to call the appropriate validator method for each rule. Let's break this down:

- We defined the `self` variable two lines prior, and it refers to `this` in the context of the `Validator` object. As explained by Douglas Crockford in chapter 4 of [JavaScript: The Good Parts][books:javascript-the-good-parts], *"When a function is not the property of an object, then it is invoked as a function [...] When a function is invoked with this pattern, this is bound to the global object. This was a mistake in the design of the language."* When `Validator.prototype.validate()` is invoked, `this` refers to `Validator` **but** the scope changes within the callback function of `every()`. Because it's using the function invocation pattern, using `this` would refer to `window` instead of `Validator`. To circumvent that, we stored the value of `this` in a variable while we still were in the desired context. Now we can use the variable within the callback and it will refer to the `Validator` object.
- `rule` is the current element being iterated on by `every()`. It successively refers to each rule in the array. Javascript treats functions as objects, so we can access function members the exact same way: using either the dot or bracket notation. Here we use the current `rule` as the key, within brackets, to call the right method.
- `value` is the argument being tested. It's wrapped in parentheses because the member we're accessing is a function. We're using an invocation operator to invoke it and we pass `value` as an argument.

At each loop, we iterate over a new rule from the `rules` array and we use it to call the name-matching function. So with the `['isString', 'isNotEmpty']` array, the loop is calling `Validator.prototype.isString()` then `Validator.prototype.isNotEmpty()`, and passing them the `value`.

## A step further

We have a good, working system. We can use our validator either to test a value with one rule or go with the `validate()` method for a whole set of rules.

{% highlight js %}
var validator = new Validator();

validator.validate(value, key.validator);
{% endhighlight %}

Remember the checklist we defined earlier as the ideal system we'd want to build? Let's get back to it and see if we fulfilled the contract. We wanted:

- ✅ something with a validation mechanism that's set once in a generic way and can be reused
- ✅ store our validation rules separately and in a way that's easily editable
- validation to be "invisible" in our setter methods

We may have a neat way to validate data, but we still need to wrap it inside an `if` statement to make it work.

{% highlight js %}
// Model.js

var Model = function() {
    this.name = {
        value: null,
        validator: ['isString', 'isNotEmpty']
    };
    this.validator = new Validator();
}

Model.prototype.setName = function(name) {
    if (this.validator.validate(name, this.name.validator)) {
        this.name.value = name;
    }
}
{% endhighlight %}

It's much better than before but still not ideal. Sure, if we need to change the validation rules we won't have to touch that `if` statement. Yet, we're still explicitly doing two different things in our method. This means we'll need to do it in every new setter method, which is repetitive and not as legible as it could be.

Let's try to think about a method that would do it all for us: check if the validation passes, and set the data if it does. We'd only have to pass the value and the object property to assign it to, and it would handle all the heavy lifting for us.

{% highlight js %}
// Model.js

Model.prototype.set = function(value, key) {
    if (this.validator.validate(value, key.validator)) {
        key.value = value;
        return true;
    }
    return false;
};
{% endhighlight %}

Here we have a dedicated method `Model.prototype.set()`. It takes two arguments: the value to test and the key to assign it to. The method will call the validator's `validate()` method and pass the value and the key's `validator` property. If the test passes, the value will be assigned to the key's `value` property and return `true`. Else, it will return `false`.

Now instead of having an `if` statement in our `setName()` method, we can simply call the `set()` method and rely on it to perform the assignment if the tests pass. We can look at it as a "safe" and generic setter method.

{% highlight js %}
// Model.js

Model.prototype.setName = function(name) {
    this.set(name, this.name);
};
{% endhighlight %}

That's it: **every need is met** 🎉 The code is clean, it's a breeze to read, and there's no sign of explicit validation. By using a service, we have not only automated recurring logic and made it easier to maintain, but we have freed our model from clutter. Unless we have to add new validation methods, there's no reason for us or any newcomer to even open the validator file. All we have to do is **use it**. We don't really have to understand the internals to make it work, but rather rely on it as a black box. This makes the learning curve of the project a lot more gentle.

Another great thing is how we created a clean bridge between the generic validator and our specific model with `Model.prototype.set()`. If we wanted to use the validator with another model, or any other function, but they had a different way of storing validation rules, **we could still do it**. All we'd have to do is create another bridge. The model's `set()` method binds the validator to itself based on how it's built, but the validator remains generic. We haven't specialized our validator, and we have a clean, reusable way to validate then set data in the model.

## Full code

{% highlight js %}
// Validator.js

var Validator = function() {};

Validator.prototype.validate = function(value, rules) {
    var self = this;
    return rules.every(function(rule) {
        return self[rule](value);
    });
};

Validator.prototype.isString = function(value) {
    if (typeof value === 'string') {
        return true;
    }
    return false;
};

Validator.prototype.isNotEmpty = function(value) {
    if (value !== '' && value !== null && typeof value !== 'undefined') {
        return true;
    }
    return false;
};

Validator.prototype.isInt = function(value) {
    return Number.isInteger(value);
};

// any other rule you want to add
{% endhighlight %}

{% highlight js %}
// Model.js

var Model = function() {
    this.name = {
        value: null,
        validator: ['isString', 'isNotEmpty']
    };
    this.age = {
        value: null,
        validator: ['isInt']
    };
};

Model.prototype.set = function(value, key) {
    if (this.validator.validate(value, key.validator)) {
        key.value = value;
        return true;
    }
    return false;
};

Model.prototype.setName = function(name) {
    this.set(name, this.name);
};

Model.prototype.setAge = function(age) {
    this.set(age, this.age);
};
{% endhighlight %}

## References

- [Service-oriented programming on Wikipedia][wiki:sop]
- [Don't repeat yourself principle on Wikipedia][wiki:dry]
- [Single responsibility principle on Wikipedia][wiki:srp]
- [JavaScript: The Good Parts by Douglas Crockford][books:javascript-the-good-parts]
- [`Array.prototype.every()` on MDN][mdn:every]

[wiki:sop]: https://en.wikipedia.org/wiki/Service-oriented_programming
[wiki:dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[wiki:srp]: https://en.wikipedia.org/wiki/Single_responsibility_principle
[books:javascript-the-good-parts]: https://books.google.fr/books?id=PXa2bby0oQ0C&lpg=PP1&hl=fr&pg=PA26#v=onepage&q&f=false
[mdn:every]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every