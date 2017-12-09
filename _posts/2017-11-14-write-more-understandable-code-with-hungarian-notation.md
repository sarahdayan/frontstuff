---
layout: post
title:  "Write More Understandable Code With Hungarian Notation"
date:   2017-11-14 00:09:00 +0200
comments: true
---

It happens all the time: you start a new project and everything goes smoothly. You have firm control of your codebase and productivity is on point. Then another project comes along, and before you know it six months have passed before you come back to that older project. Suddenly it's not that clear anymore. What does this class do? What's the type of this variable? Worse: now your colleagues have to build upon your work and you have a hard time giving them clear explanations.

This is a common problem in software engineering. We humans have great minds but terrible memory. As [Scott Berkun][scott-berkun] puts it, *"we have such bad memory that we forget we have bad memory"*. Our brain constantly switches from one thing to another, and unless we have something, some trigger to get back on track, it requires a significant amount of work to get all pieces together again.

That trigger is called **context**, and fortunately for us, there's a great way to implement it in our codebase.

Hungarian notation is a naming convention that consists of prefixing to indicate either **type** (*systems*) or **use** (*apps*). This may sound like an obscure and barbaric term for such a simple concept, but you've probably seen it before without even knowing.

In this article, we'll cover Hungarian notation in **JavaScript** and **CSS**.

## Hungarian notation in JavaScript

{% highlight js %}
const $text = $('.text');
{% endhighlight js %}

The above naming convention is pretty widespread when using jQuery. Prefixing variables that store a jQuery object with a `$` makes it easier to know what it is a few dozen lines later. This is an example of **type prefixing**: the `$` tells us our variable is a jQuery object.

This does absolutely nothing to our variable though: **it behaves the exact same way as any other**. Also, prefixing doesn't type a variable: you could have stored an integer there and it would work the same. Hungarian notation is by humans, for humans. If you do it wrong, your browser/compiler won't insult you (but your coworkers might 😆).

{% highlight js %}
const _isPublished = true;
{% endhighlight js %}

Here's another well known prefixing convention in JavaScript, this time to indicate a variable is **private**. This is an example of **use prefixing**: the `_` tells us our variable is meant to be private.

Again, prefixing a variable this way **absolutely doesn't make it private**. You can *achieve* privacy via several patterns in JavaScript, but the language itself doesn't natively support that concept. Don't go thinking that prefixing a variable makes it "safe". If you need privacy, make sure you build your code that way. If anything, the `_` prefix is here to tell you a resource was *meant* to be private, therefore probably can't be invoked directly, and even if it does, shouldn't because it might change or disappear.


### A step further

In [this JavaScript implementation of the Luhn algorithm][gist:4075533], the author used a more traditional version of the Hungarian notation: **type prefixing with the type's first letter**.

{% highlight js %}
// Original code by DiegoSalazar gist.github.com/DiegoSalazar/4075533
// Cropped for brevity

...

var nCheck = 0, nDigit = 0, bEven = false;
value = value.replace(/\D/g, "");

for (var n = value.length - 1; n >= 0; n--) {
  var cDigit = value.charAt(n),
      nDigit = parseInt(cDigit, 10);

  if (bEven) {
    if ((nDigit *= 2) > 9) nDigit -= 9;
  }

  nCheck += nDigit;
  bEven = !bEven;
}

return (nCheck % 10) == 0;

...
{% endhighlight %}

If you're not used to it, **this may look odd**. Past that first impression, it becomes a lot clearer to spot which variable is a boolean, which one is a number and which one is a string (even if our JavaScript programmer here decided to go with `c`, presumably for `char`).

Hungarian notation is considered helpful for loosely and dynamically typed languages like JavaScript, that also doesn't benefit from type hinting. Ask a developer to improve this algorithm, all the type prefixes would certainly save them some time.

### Do I need to prefix all my variables?

My personal opinion is **no**. Most of the time you can get away with a properly named variable, or short functions and methods (which you should strive for anyway). **Clean code starts with expressive variables**, and your job is to make sure these names are enough.

I still believe Hungarian notation is interesting for **use prefixing** (*apps*). Intended use isn't necessarily something you can find out from a variable name or by looking around in the code. **Type prefixing** (*systems*) remains helpful for complex algorithms, other than that don't overdo it.

## Hungarian notation in CSS

There are many ways to keep your CSS under control these days. Methodologies like OOCSS, BEM or atomic CSS are great at abstracting rules into expressive and modular components. Besides that, architectures like SMACSS or ITCSS do an amazing job at structuring the building blocks of your CSS codebase.

Problem is, while CSS class names can tell you what kind of component they are, the role they play in the *architecture* of your project is a lot harder to define when you're reading the HTML.

{% highlight html %}
<div class="card shadow media">
  ...
</div>
{% endhighlight %}

In this example, the responsibility of each class is unclear. If you're not familiar with this codebase, it could be nerve-wracking and time-consuming to find out what to remove to disable a specific style, and what you can safely edit without breaking something somewhere else.

### Namespaces, namespaces everywhere

I'm a big fan of Harry Robert's (yet unpublished) [ITCSS architecture][creative-bloq:itcss]. In ITCSS, you chunk the CSS codebase into logical layers. The three final ones is where we define actual classes: **objects**, **components**, and **utilities**.

- **Objects** are abstract, undecorated, structural elements. They usually can be reused from a project to another, and are used to build actual styles upon. You may need to add modifiers, but an object usually is immutable. A `.media-element` class that puts an image and a text box side by side and make them use 100% of the width, or a `.list` that removes bullets and left padding, are good examples of **objects**.
- **Components** are concrete, specific UI elements that define the look and feel of your design. Some **components** are independent, while others may rely on **objects**. A `.button` is a great example of a **component**.
- **Utilities** are small rulesets that help you either build a larger component (that's especially true if you're using an atomic CSS approach) or override styles from higher layers. **Utilities** usually don't have abstract names like **objects** or **components**, but are rather named after their *function*. `.hidden` or `.text-center` are typical **utilities**.

Let's use Hungarian notation on our classes: objects will start with `o-`, components with `c-` and utilities with `u-`. From there, this is how our HTML would look like:

{% highlight html %}
<div class="c-card u-shadow o-media">
  ...
</div>
{% endhighlight %}

**That's much easier to read**. Now we know at a glance what each class is responsible for. If you need to change the order in which the image and text content are displayed, you'll add a modifier to the `.o-media` object. If the background color has to to change, it will be applied on the `.c-card` component. Finally, if the box-shadow needs to go, you'll remove the `.u-shadow` utility.

Harry Roberts dives way deeper into prefixing methods in his own article [More Transparent UI Code with Namespaces][css-wizardry:namespaces]. I **strongly** encourage you to read it (and everything Harry wrote) if you're serious about building robust CSS architectures. There are some pretty interesting prefixes in there, such as `js-` to safely define all JavaScript hooks with no risk of breaking stuff if you remove a class, or `qa-` for automated functional testing with web drivers like Selenium.

### Do I need to prefix all my classes?

Contrary to JavaScript, I would recommend **prefixing all your CSS classes**. While JavaScript is contained to its own codebase, CSS classes live outside of their stylesheets, right on HTML tags, where you lose all context.

Use prefixing doesn't only give you back that lost context, it also enforces the methodology and architecture you picked by making it more visible and explicit. You have everything to gain by trying it out.

[scott-berkun]: http://scottberkun.com/
[gist:4075533]: https://gist.github.com/DiegoSalazar/4075533
[creative-bloq:itcss]: http://www.creativebloq.com/web-design/manage-large-css-projects-itcss-101517528
[css-wizardry:namespaces]: https://csswizardry.com/2015/03/more-transparent-ui-code-with-namespaces/