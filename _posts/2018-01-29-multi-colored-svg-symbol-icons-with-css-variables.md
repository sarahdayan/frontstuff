---
layout: post
title: "Multi-Colored SVG Symbol Icons with CSS Variables"
date: 2018-01-29 08:00:00 +0100
comments: true
---

Long gone are the days of using images and CSS sprites to make icons for the web. With the explosion of web fonts, icon fonts have become the number one solution for displaying icons in your web projects.

Fonts are vectors, so you don't have to worry about resolution. They benefit from the same CSS properties as text. As a result, you have full control over size, color, and style. You can add transforms, effects, and decorations such as rotations, underlines or shadows.

![Font Awesome homepage]({{ "/assets/2018-01-29/font-awesome.png" }})

No wonder why projects like Font Awesome have been downloaded [more than 15 million times on npm alone][npm-stats:font-awesome] to this day.
{:.caption}

**Icon fonts aren't perfect though**, which is why a growing number of people prefer using inline SVG images. CSS Tricks wrote a [list of areas where icon fonts fall short compared to native SVG elements][css-tricks:icon-fonts-vs-svg]: sharpness, positioning, or even failures because of cross-domain loading, browser-specific bugs, and ad-blockers. Now you can circumvent most of these issues, and usually, icon fonts are a safe choice.

Yet, there's one thing that remains absolutely impossible with icon fonts: **multicolor support**. Only SVG can do this.

***TL;DR**: this post goes in-depth in the how and why. If you want to understand the whole thought process, read on. Otherwise you can look at the final code on [CodePen][codepen:svg-symbol-demo].*

## Setting up SVG symbol icons

The problem with inline SVG is how verbose they are. You don't want to copy/paste all that amount of coordinates every single time you need to use the same icon. This would be repetitive, hard to read and a pain to maintain.

With SVG symbol icons, you have one copy of each SVG element, and you instantiate them anywhere with a reference.

You start by including the SVG inline, hide it, wrap it in a `<symbol>` and identify it with an `id` attribute.

{% highlight html %}
<svg xmlns="http://www.w3.org/2000/svg" style="display: none">
  <symbol id="my-first-icon" viewBox="0 0 20 20">
    <title>my-first-icon</title>
    <path d="..." />
  </symbol>
</svg>
{% endhighlight %}
The full SVG markup is included once and hidden in the HTML.
{:.caption}

Then, all you have to do is instantiate the icon with a `<use>` element.

{% highlight html %}
<svg>
  <use xlink:href="#my-first-icon" />
</svg>
{% endhighlight %}
This will display an exact copy of your original SVG icon.
{:.caption}

![Instanciated SVG symbol icon]({{ "/assets/2018-01-29/instanciated-svg-symbol-icon.png" }})

**That's it!** Pretty nice, right?

You probably noticed the funny `xlink:href` attribute: this is the link between your instance and the original SVG.

It's important to mention that `xlink:href` is a deprecated SVG attribute. Even if most browsers still support it, **you should use `href` instead**. Now the thing is, some browsers like Safari don't support SVG resource references through the `href` attribute, so you still need to provide `xlink:href`.

To be safe, provide both attributes.

## Adding some color

Unlike with fonts, `color` doesn't have any effect on SVG icons: you must use the `fill` attributes to define a color. This means they won't inherit parent text color like icon fonts do, but you can still style them in CSS.

{% highlight html %}
<svg class="icon">
  <use xlink:href="#my-first-icon" />
</svg>
{% endhighlight %}

{% highlight css %}
.icon {
  width: 100px;
  height: 100px;
  fill: red;
}
{% endhighlight %}

From here, you can create other instances of the same icon with a different fill color.

{% highlight html %}
<svg class="icon icon-red">
  <use xlink:href="#my-first-icon" />
</svg>

<svg class="icon icon-blue">
  <use xlink:href="#my-first-icon" />
</svg>
{% endhighlight %}

{% highlight css %}
.icon {
  width: 100px;
  height: 100px;
}
.icon-red {
  fill: red;
}
.icon-blue {
  fill: blue;
}
{% endhighlight %}

It works, but this isn't *exactly* what we want. So far, all we did can be achieved with a regular icon font. What we want is have a **different** color for each *part* of the icon. We want to fill each *path* with a different color, without altering other instances, and we want to be able to override it if necessary.

At first, you might be tempted to rely on specificity.

{% highlight html %}
<svg xmlns="http://www.w3.org/2000/svg" style="display: none">
  <symbol id="my-first-icon" viewBox="0 0 20 20">
    <title>my-first-icon</title>
    <path class="path1" d="..." />
    <path class="path2" d="..." />
    <path class="path3" d="..." />
  </symbol>
</svg>
{% endhighlight %}

{% highlight html %}
<svg class="icon icon-colors">
  <use xlink:href="#my-first-icon" />
</svg>
{% endhighlight %}

{% highlight css %}
.icon-colors .path1 {
  fill: red;
}
.icon-colors .path2 {
  fill: green;
}
.icon-colors .path3 {
  fill: blue;
}
{% endhighlight %}

**This won't work.**

We're trying to style `.path1`, `.path2` and `.path3` as if they were nested in `.icon-colors`, but technically speaking **they're not**. The `<use>` element isn't a *placeholder* that gets replaced by your SVG definition. It's a *reference* which clones the content it's pointing to into the [**shadow DOM**][mdn:shadow-dom] 😱

**What can we do then?** How can we affect children content in a scoped way when said children aren't in the DOM?

## CSS variables to the rescue

In CSS, [some properties][mdn:css-inheritance] are inherited from ancestors to children. If you assign a text color to the `body`, all the text in the page will inherit that color until they're overridden. The ancestor isn't aware of the children, but the *inheritable* styles are still propagated.

In our early example, we inherited the `fill` property. Look again, you'll see that the class in which we declared a `fill` color is appended on the *instances*, not the definitions. This is how we were able to get different colors for each instance of a single definition.

Now here's the problem: we want to pass *different* colors to *different* paths of the original SVG, but there's only one `fill` attribute we can inherit from.

Meet **CSS variables**.

CSS variables are declared within rulesets just like any other property. You can name them anything you want, and assign them any valid CSS value. Then, you declare it as a *value* for itself, or any child property, and **it will be inherited**.

{% highlight css %}
.parent {
  --custom-property: red;
  color: var(--custom-property);
}
{% endhighlight %}
All children of `.parent` will have red text.
{:.caption}

{% highlight css %}
.parent {
  --custom-property: red;
}
.child {
  color: var(--custom-property);
}
{% endhighlight %}
All `.child` nested in `.parent` elements will have red text.
{:.caption}

Now let's apply this concept to our SVG symbol. We'll use the `fill` attribute on each path of the SVG definition, and set them to different CSS variables. Then, we'll assign them different colors.

{% highlight html %}
<svg xmlns="http://www.w3.org/2000/svg" style="display: none">
  <symbol id="my-first-icon" viewBox="0 0 20 20">
    <title>my-first-icon</title>
    <path fill="var(--color-1)" d="..." />
    <path fill="var(--color-2)" d="..." />
    <path fill="var(--color-3)" d="..." />
  </symbol>
</svg>
{% endhighlight %}

{% highlight html %}
<svg class="icon icon-colors">
  <use xlink:href="#my-first-icon" />
</svg>
{% endhighlight %}

{% highlight css %}
.icon-colors {
  --color-1: #c13127;
  --color-2: #ef5b49;
  --color-3: #cacaea;
}
{% endhighlight %}

And... **it works**! 🎉

![Multi-colored SVG symbol icon]({{ "/assets/2018-01-29/multi-color-svg-symbol-icon.png" }})

From now on, all we need to create an instance with a different color scheme is to create a new class.

{% highlight html %}
<svg class="icon icon-colors-alt">
  <use xlink:href="#my-first-icon" />
</svg>
{% endhighlight %}

{% highlight css %}
.icon-colors-alt {
  --color-1: brown;
  --color-2: yellow;
  --color-3: pink;
}
{% endhighlight %}

If you still want to have monochrome icons, **you don't have to repeat the same color on every CSS variable**. Instead, you can declare a single `fill` rule: because CSS variables aren't defined, it will fall back on your `fill` declaration.

{% highlight css %}
.icon-monochrome {
  fill: grey;
}
{% endhighlight %}
Your `fill` declaration will work because the `fill` attributes on the original SVG are set with undefined CSS variables values.
{:.caption}

## What to name my CSS variables?

There usually are two routes you can take when it comes to naming things in CSS: **descriptive** or **semantic**. Descriptive means calling a color *what it is*: if you're storing `#ff0000`, you'd call it `--red`. Semantic means calling the color by *how it's applied*: if you're using `#ff0000` for the handle of a coffee cup, you'd call it `--cup-handle-color`.

Descriptive names might be your first instinct. It feels DRYer since `#ff0000` can be used for other things than the handle of the coffee cup. A `--red` CSS variable is reusable for other icon paths that need to be red. After all this is how utility-first CSS works and [it's a fine system]({{ site.baseurl }}{% link _posts/2018-01-15-in-defense-of-utility-first-css.md %}).

Problem is, in our case **we can't apply granular classes to the elements we want to style**. Utility-first principles can't apply because we have a single reference for each icon, and we have to style it through class variations.

Using semantic class names, like `--cup-handle-color` for example, makes more sense for this use case. When you want to change the color of a part of an icon, you instantly know what it is and what to override. The class name will remain relevant, no matter what color you assign.

## To default or not to default

It's tempting to make the multi-colored version of your icons be their default state. This way, you could use them with no need for extra styling, and you would add your own classes only when necessary.

There are two ways to achieve that: **:root** and **var() default**.

### :root

You can define all your CSS variables on the `:root` selector. This keeps them all in one place and allows you to "share" similar colors. `:root` has the lowest priority, so it remains easy to override.

{% highlight css %}
:root {
  --color-1: red;
  --color-2: green;
  --color-3: blue;
  --color-4: var(--color-1);
}

.icon-colors-alt {
  --color-1: brown;
  --color-2: yellow;
  --color-3: pink;
  --color-4: orange;
}
{% endhighlight %}

However, **there are major drawbacks with this method**. First, keeping color definitions separate from their respective icons can be confusing. When you decide to override them, you have to go back and forth between the class and the `:root` selector. But more importantly, **it doesn't allow you to scope your CSS variables**, thus keeps you from reusing the same names.

Most of the time, when an icon only uses one color, I use the `--fill-color` name. It's simple, understandable, and it makes sense to use the same name for all icons that only need one fill color. If I have to declare all variables in the `:root` declaration, I can't have several `--fill-color`. I'll be forced to define `--fill-color-1`, `--fill-color-2`, or use namespaces like `--star-fill-color`, `--cup-fill-color`.

### var() default

The `var()` function, which you use to assign a CSS variable to a property, can take a default value as a second argument.

{% highlight html %}
<svg xmlns="http://www.w3.org/2000/svg" style="display: none">
  <symbol id="my-first-icon" viewBox="0 0 20 20">
    <title>my-first-icon</title>
    <path fill="var(--color-1, red)" d="..." />
    <path fill="var(--color-2, blue)" d="..." />
    <path fill="var(--color-3, green)" d="..." />
  </symbol>
</svg>
{% endhighlight %}

Until you define `--color-1`, `--color-2` and `--color-3`, the icon will use the default values you set for each `<path>`. This solves the global scope issue we have when using `:root`, but be careful: **you now have a default value and it's doing its job**. As a result, you can't use a single `fill` declaration to define monochrome icons anymore. You'll have to assign the color to every CSS variable used on the icon, one by one.

Setting default values can be useful, but it's a tradeoff. I suggest you don't make it a habit, and only do it when it makes sense for a given project.

## How browser-friendly is all that?

[CSS variables are compatible with most modern browsers][caniuse:css-variables] but as you probably expect it, Internet Explorer doesn't support it **at all**. Not even IE11, and since development was discontinued in favor of Edge, there's no chance it will ever get up to speed.

Now, not because a feature isn't supported by a browser you need to cater to means you have to rule it out altogether. In such cases, go for **graceful degradation**: offer multi-colored icons to modern browsers, and provide a fallback fill color for older ones.

What you want to do is set a declaration that will only work if CSS variables aren't supported. This can be achieved by setting the `fill` property to the fallback color: if CSS variables are supported, it won't even be taken into account. If they're not, your `fill` declaration will apply.

If you're using Sass, this can be abstracted into a `@mixin`.

{% highlight scss %}
@mixin icon-colors($fallback: black) {
  fill: $fallback;
  @content;
}
{% endhighlight %}

We can now define color schemes without worrying about browser compatibility.

{% highlight scss %}
.cup {
  @include icon-colors() {
    --cup-color: red;
    --smoke-color: grey;
  };
}

.cup-alt {
  @include icon-colors(green) {
    --cup-color: green;
    --smoke-color: grey;
  };
}
{% endhighlight %}
Passing the CSS variables in the mixin through `@content` is optional. If you do it outside, the compiled CSS will be the same. Yet this can be helpful to package it all in one place: you can fold snippets in your editor and visually identify declarations that go together.
{:.caption}

Check out this pen on different browsers. On up-to-date versions of Firefox, Chrome, and Safari, the last two cups will respectively be red with grey smoke and blue with grey smoke. On Internet Explorer and Edge before version 15, the third cup will be all red and the fourth will be all blue! ✨

<p data-height="400" data-theme-id="0" data-slug-hash="GOzaEQ" data-default-tab="result" data-user="sarahdayan" data-embed-version="2" data-pen-title="Multi-Colored SVG Symbol Icons with CSS Variables" class="codepen"><em>See the Pen <a href="https://codepen.io/sarahdayan/pen/GOzaEQ/">Multi-Colored SVG Symbol Icons with CSS Variables</a> by Sarah Dayan (<a href="https://codepen.io/sarahdayan">@sarahdayan</a>) on <a href="https://codepen.io">CodePen</a>.</em></p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

If you want to learn more about SVG symbol icons (and SVG in general), I **strongly** suggest you read [everything by Sara Soueidan][sara-soueidan:blog]. And if you have any question about CSS symbol icons, don't hesitate to hit me up on [Twitter][twitter:frontstuff_io]!

[caniuse:css-variables]: https://caniuse.com/#feat=css-variables
[codepen:svg-symbol-demo]: https://codepen.io/sarahdayan/pen/GOzaEQ
[css-tricks:icon-fonts-vs-svg]: https://css-tricks.com/icon-fonts-vs-svg
[mdn:css-inheritance]: https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance
[mdn:shadow-dom]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM
[npm-stats:font-awesome]: http://npm-stats.com/~packages/font-awesome
[sara-soueidan:blog]: https://www.sarasoueidan.com/blog
[twitter:frontstuff_io]: https://twitter.com/{{ site.twitter_username }}