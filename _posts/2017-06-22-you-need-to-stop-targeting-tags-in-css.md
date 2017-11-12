---
layout: post
title:  "You Need to Stop Targeting Tags in CSS"
date:   2017-06-23 00:01:00 +0200
comments: true
---

CSS seems easy to most developers. Because of its apparent simplicity, and because it's so flexible, you can easily bend it to your needs and make it work. Problem is, it often makes up for a lack of knowledge of how the language works and it doesn't push you to try and write better code.

If you look into CSS methodologies like [BEM][bem]{:target="_blank"} or [SMACSS][smacss]{:target="_blank"}, one of the first things you'll be told is **not to style on tag names** and use classes instead. This can be a big rebuttal when you're not used to it. Why add classes when you could simply target tag names? Why increase the size of your HTML and CSS files instead of using what's already there and works perfectly?

### Tags are agnostic

A `div` or a `strong` are abstract entities. They're not aware of your project's context. They don't *know* what they're being used for. Some of them have a functional purpose (an `a` to create a hyperlink, a `form` to submit user input, etc.) but this is nothing more than a reusable, context-unaware component. Picking an HTML tag over another makes sense semantically, or when it comes to either accessibility or SEO. They're a set of tools to help you give structure your content. They're not responsible for what the app looks like **and they should never be**.

Let's take the following piece of HTML:

{% highlight html %}
<div class="element">
    <div>
        <h2>Title</h2>
        <p>Text</p>
        <p>Text</p>
        <ul>
            <li>List item</li>
            <li>List item</li>
        </ul>
        <div>
            <h2>Title</h2>
            <p>Text</p>
            ...
        </div>
    </div>
    <div>...</div>
</div>
{% endhighlight %}

Let's say we need all the `p` from the direct `div` children to be blue. The most straight-forward way to do it would probably be something like:

{% highlight css %}
.element > div p {
    color: blue;
}
{% endhighlight %}

Instead of adding a `.blue-text` class on the right `p` and do:

{% highlight css %}
.element .blue-text {
    color: blue;
}
{% endhighlight %}

Makes sense right? You're using the existing DOM structure, you're unleashing the power of CSS operators, you're not adding unnecessary classes, and it works. But the problem here is that you're giving *meaning* to a specific DOM element based on its type. You're locking down the structure of your HTML for styling purposes. This may not seem like a big deal, but it's actually **a major problem for scalability**.

When you add CSS directly on tags, your markup can't change. Your style is tightly coupled to your DOM, and any change increases the risk of breaking things. Let's say you now need to wrap your `h2` and the two `p` in another `div` (because they need a border all around them, for example). We now have to edit our CSS to make sure it still works.

{% highlight css %}
.element > div > div p {
    color: blue;
}
{% endhighlight %}

This is getting messy.

Now let's say that later in our project, we need the `p` from the last direct children `div` not to be blue anymore. This wasn't planned, but now it's required. Again, you'll have to edit the CSS:

{% highlight css %}
.element > div > div:not(:last-child) p {
    color: blue;
}
{% endhighlight %}

Anyone with basic CSS knowledge can see it's getting out of hands, and impossible to understand without comments.

Now for some reason, we need to switch the two `p` with an unordered list. Again, you have to edit the CSS:

{% highlight css %}
.element > div > div:not(:last-child) li {
   color: blue;
}
{% endhighlight %}

But now we have a conflict with the existing unordered list, that isn't supposed to be styled the same way. And what if on top of that, we need to use some jQuery plugin that throws in some additional HTML on which we have no control?

**This is the definition of unscalability**. Not only you shouldn't have to revise your CSS to make sure things don't break every time you make a change somewhere else, but you also shouldn't have such a rigid link between two distinct parts of your project. Keeping things decoupled is one of the fundamental principles of programming, and it's time we understand **CSS is no exception**.

If you start thinking of your UI as a collection of components, it means they need to be reusable. But not because they are reusable means they should always have the exact same structure. Let's take the example of a media object:

{% highlight html %}
<div class="media">
    <img src="..." alt="...">
    <div>
        <h2>Title</h2>
        <time>Datetime</time>
        <p>Content</p>
    </div>
</div>
{% endhighlight %}

This is the base. It defines the **concept of my component**: its structure and its elements. I can reuse it as much as necessary with different content.

But a well-conceived component is also **flexible and extendable**. For example, I should totally be able to do this:

{% highlight html %}
<article class="media">
    <div>
        <time>Datetime</time>
        <h3>Title</h3>
        <ul>
            <li>Content</li>
            <li>Content</li>
        </ul>
    </div>
    <video>
        <source src="..." type="video/mp4">
    </video>
</article>
{% endhighlight %}

If you're styling on tags, chances are you'll need to edit your CSS for the above component to look right. This would result in chained rulesets such as:

{% highlight css %}
.media h2, .media h3 {
    ...
}
.media img, .media video {
    ...
}
{% endhighlight %}

This is hard to read, tedious to maintain and it makes the file a lot heavier (not to mention bad for performance, but let's not get ahead of ourselves).

Instead, by using classes, you add a context layer onto agnostic tags and you automatically exclude what shouldn't be styled the same way. You create a clean bridge between your HTML and your CSS.

{% highlight html %}
<div class="media">
    <img class="media-object" src="..." alt="...">
    <div class="media-body">
        <h2 class="media-title">Title</h2>
        <time class="media-datetime">Datetime</time>
        <p class="media-content">Content</p>
    </div>
</div>
{% endhighlight %}

With the above HTML structure and well-written styles that rely on those classes, you can implement any variation without even opening your CSS file. The component is a lot more readable, scalable, and versatile.

Now you may be wondering *"Alright, I get that I should use more classes, but does this mean I need to use them everywhere?"* This leads us to our second problem.

## Performance issues

What would you say if you had to explain the following piece of code to someone who doesn't know CSS?

{% highlight css %}
.element a {
    color: orange;
}
{% endhighlight %}

Probably something like *"I'm looking inside every `.element`, I target all the `a` tags in there and give them the color `orange`."*

And you'd be wrong.

You may read from left to right, but your browser engine reads your CSS from **right to left**. It evaluates every ruleset starting from the rightmost selector then traces back to the left through the parent selectors to define if it's a match or if it should discard the rule. So when the browser reads our piece of CSS it actually goes like *"I'm looking for all the `a` tags, then I'm making sure they're nested in an `.element`, and if that's the case, I apply the color `orange` to them."*

This may not sound like it really matters, but the way your browser interprets your code has a **major impact on performance**. In our case, it starts by targeting **all** `a` tags in your page and then it applies or discards the style depending on what their ancestors are. This eats up a lot more memory than if you had a class on the specific elements you want to style, and targeted them directly:

{% highlight css %}
.primary-links {
    color: orange;
}
{% endhighlight %}

Here, the browser only searches for tags with the `.primary-links` class and applies the corresponding styles. If an element in your HTML document doesn't have the class, it won't even be crawled.

Now following that logic, there's one case when styling on tags can actually make sense: when absolutely **all** tags of a certain type need to be styled the same way (or when there's only one of them in the DOM, like `html` or `body`). There's a great chance that all `strong` tags in your project are supposed to be bold and that all `em` are supposed to be in italics. Here it would be perfectly acceptable to style directly on tags because you need a unified behavior on **all** elements. Performance-wise, adding a class to all tags of a same type and styling on this class (e.g.: creating a `.bold` class and applying it on every `strong` tag) would have the exact same effect as styling directly on the tag, because you're selecting them all anyway. Yet, it adds more code and is tedious to maintain, so styling directly on tags would be the best option here.

Of course, it doesn't prevent you from creating a class on the exact same model so you can still use it on elements of another type:

{% highlight css %}
strong, .bold {
    font-weight: bold;
}
{% endhighlight %}

{% highlight html %}
<p>A sentence with some <strong>bold</strong> text in it.</p>
<ul>
    <li class="bold">A bold list item</li>
    <li>a regular list item</li>
</ul>
{% endhighlight %}

## Exceptions & compromises

Methodologies, design patterns and best practices are crucial in programming. It's what helps you save time by using tried and true solutions and ship more robust programs. Yet it's important not to get too caught up in it and lose sight of why you got in the game in the first place: **solving problems**. Rules and recommendations are here to help you write better code, but they aren't an end in themselves.

For this blog, I'm using [Eric Meyer's Reset CSS][meyer-reset]{:target="_blank"} as a base so I can start off with a perfectly clean slate. By definition, a reset or a normalizer applies CSS rules on tags to remove user agent's default styling. This isn't *awesome* for performance. A more performance-friendly way to do it would be to add classes and reset unwanted styles directly on them. But let's face it: **using a reset is really, really convenient**. It saves you time, headaches, and is a trustworthy base for you to start on and style freely.

Another good case is when you're working on a CMS. If the website you're developing is supposed to receive content from non-developers, you can't ask them to add classes on elements. Even for this blog, there's no way I'm adding classes to all `a` or `blockquote` every time I'm writing an article: this would be ridiculous and time-consuming. This is clearly a case where we can make a compromise.

To make sure my global styles don't bleed on the rest of my website, I usually namespace my editable areas. This way I define a scope for my styled tags and I can use them anywhere I need by simply wrapping my content area in a tag with the proper class.

{% highlight html %}
<div class="cms">
    <!-- This is where the content will be outputted -->
</div>
{% endhighlight %}

{% highlight css %}
.cms p {
    margin-bottom: 15px;
}

.cms a {
    color: red;
}
...
{% endhighlight %}

In the end, it all comes down to your judgment as a developer. Ask yourself: is my style really that global? Or global *enough* to deserve being assigned globally and overridden later? Is my app a component-rich environment that will scale or a simple static website that will never move? Do I have a lot of code in my page and a humongous stylesheet, or a hundred lines of HTML and 2KB of CSS?

If you're still skeptical, I encourage you to try this method on a side project: keep styled tags to a bare minimum (a base of maximum ten selectors, for example) and use classes for everything else. I guarantee you'll be surprised by how confident you'll feel about scaling because of how little to no styling conflicts you'll encounter, as well as how little you'll have to maintain your CSS codebase to keep it healthy.

[meyer-reset]: https://meyerweb.com/eric/tools/css/reset/
[bem]: https://en.bem.info/methodology/
[smacss]: https://smacss.com/