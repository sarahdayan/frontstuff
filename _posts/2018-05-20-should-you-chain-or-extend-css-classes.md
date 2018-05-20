---
layout: post
title:  "Should You Chain or Extend CSS Classes?"
date:   2018-05-20 16:50:00 +0200
---

If you’re building an app or a website that changes often, modular CSS methods solve many issues. Instead of copying your HTML structure in CSS and decorate it, you create consumable libraries of components. The latter makes projects more scalable and keeps the CSS codebase under control.

CSS modularity relies on composition, which inevitably fattens the HTML. This collateral effect can be a significant rebuttal for many people because of the "bloat" it creates. In this article, we'll compare two techniques: **chaining** and **extending**. We'll see what they provide and what their shortcomings are so that you can make more thoughtful choices.

## Chaining

Chaining CSS classes means **composing the desired look by adding granular modifiers together onto an HTML selector**. The composite styles create the final visual outcome, which is the default behavior with most modular CSS methodologies.

Let's take the following OOCSS code for a button:

{% highlight css %}
.btn {
  display: block;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
}
.btn-default {
  border: 3px solid grey;
}
.btn-primary {
  background: purple;
  color: white;
}
{% endhighlight %}

If you were to chain modifiers, your HTML would look like this:

{% highlight html %}
<button class="btn btn-primary">Primary button</button>
<button class="btn btn-default">Default button</button>
{% endhighlight %}

Now let's do something a bit more complex, this time with BEM:

{% highlight html %}
<div class="media-object media-object--reverse media-object--outlined">
  <div class="media-object__media">
    <img class="media-object__img media-object__img--faded img img--square" src="..." alt="...">
  </div>
  <div class="media-object__body">...</div>
</div>
{% endhighlight %}

Here we have a lot more interacting classes:

- The `.media-object` block has several modifiers (`.media-object--reverse` and `.media-object--outlined`).
- The `.media-object__img` element has one modifier (`.media-object__img--faded`).
- The `.media-object__img` element is also an `.img` block with its own modifier (`.img--square`).

### Pros

The top highlight of chaining classes is **separate responsibility**. It keeps your CSS codebase clean, light, comfortable to read, and non-repetitive. What each class does is crystal clear, you immediately know what you should use and what you shouldn't. **It also prevents dead code: since you're dealing with building blocks, everything is potentially useful.** When you remove a component, you only need to remove the HTML.

Separate modifiers are great to represent state; thus it makes life easier for JavaScript engineers. All they have to do is add and remove classes.

On large projects, **this method can save you a lot of time**. 

### Cons

One of the most recurring issues people have with modular CSS is that it creates "class madness" in the HTML. Strictly speaking, this is true.

Design patterns that split responsibilities almost always result in more files and verbose code. CSS is no exception: **if you pick a method that's supposed to make your codebase more maintainable, the counterpart is lengthy HTML files**.

Having to type much code is becoming less and less of a problem these days, as most editors and IDEs offer powerful autocompletion. Now, it's still more code to write every time you make a new page or compose a new component. Over time, this can induce a feeling of clutter and redundancy that will put-off some developers.

## Extending

If you don't want to chain classes, you can extend them. We still have the same separate blocks, but instead of chaining them in the HTML, **we inherit the properties of the base class to its modifiers**. This way, we can use them all at once.

Let's use the `@extend` function in Sass to do so:

{% highlight scss %}
.btn {
  display: block;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
  &-default {
    @extend .btn;
    border: 3px solid grey;
  }
  &-primary {
    @extend .btn;
    background: purple;
    color: white;
  }
}
{% endhighlight %}

This will turn into the following CSS snippet:

{% highlight css %}
.btn,
.btn-default,
.btn-primary {
  display: block;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
}
.btn-default {
  border: 3px solid grey;
}
.btn-primary {
  background: purple;
  color: white;
}
{% endhighlight %}

With the above CSS, our HTML would look like this:

{% highlight html %}
<button class="btn-primary">Primary button</button>
<button class="btn-default">Default button</button>
{% endhighlight %}

Instead of having a slew of seemingly repetitive classes, we only have one. It has an explicit name and keeps the code readable. We can still use `.btn` alone but if we need a variation of it, we only need to append the modifier part on it instead of chaining a new class.

### Pros

**The highlight of this method is a clutter-free, more readable, and lighter HTML.** When you go for modular CSS, you also decide to do more HTML and less CSS. The CSS becomes a library instead of a list of instructions. Thus, you spend more time in the HTML, which is why you may want to keep it light and easy to read.

### Cons

Your CSS may *look* DRY, especially if you're using a pre-processor, but **extending classes results in a much heavier CSS file**. Plus, you don't have much control over what happens: every time you use `@extend`, the class definition is moved to the top and added to a list of selectors sharing the same ruleset. This process can result in weird style overrides and a lot more generated code.

There's also the case of wanting to use several modifiers together. With the extend method, you don't compose in the HTML anymore. You're left with one solution if you're going to create new combinations: create even more classes by extending modifiers. **This is hard to maintain and results in more code.** Every time you need to blend classes, you'll need to edit the CSS and create a potentially non-reusable new rule. If you ever remove the HTML that uses it, you'll also have to delete the CSS class.

## Afterthoughts

**Modular CSS comes at the price of more verbose HTML,** but it's not much to pay for all the benefits it provides. If you've already determined you need modularity, don't shoot yourself in the foot by using incompatible practices. It will result in more work for half the benefits. Inheritance is tempting, but [composition has more than once been recognized as a far better strategy][wiki:composition-over-inheritance].

HTML "bloat" is not that big of a deal when you look at its actual impact. Modularity inevitably creates more code, the method you pick only determines *where* it goes. From a performance standpoint, [more HTML is far better than more CSS][frontstuff:in-defense-of-utility-first-css].

**Don't focus on small things that don't matter.** Instead, leverage tools that help you write and navigate code more efficiently look at the big picture and make choices based on facts, not personal preferences.

[wiki:composition-over-inheritance]: https://en.wikipedia.org/wiki/Composition_over_inheritance
[frontstuff:in-defense-of-utility-first-css]: {% post_url 2018-01-15-in-defense-of-utility-first-css %}#it-bloats-the-html
