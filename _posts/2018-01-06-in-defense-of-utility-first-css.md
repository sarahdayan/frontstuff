---
layout: post
title: "In Defense of Utility-First CSS"
date: 2018-01-15 23:11:00 +0200
comments: true
---

***"Favor composition over inheritance"***. This piece of wisdom from [*Design Patterns*][wiki:design-patterns], one of the most influential software engineering books, is the foundation of **utility-first CSS**. It also shares many principles with **functional programming**: immutability, composability, predictability, and avoidance of side-effects. The goal behind all those fancy terms is to write code that's **easier to maintain and to scale**.

Despite its growing popularity, utility-first CSS still hasn't convinced everyone. While some [praise it][jon-gold:functional-css], others have been [vividly critical][zeldman:kiss-my-classname] about such a practice. **I used to be in the latter group**. I was a BEM fan, sold to an approach I adopted for its advantages and ended up rooting for like we do for a sports team. I rejected utility-first because it was implying my beloved and familiar approach wasn't good anymore.

Since then, I've dived *a lot* deeper into the topic. I studied design patterns and functional programming, and this allowed me to **radically revise my judgment**.

[CSS Tricks][css-tricks:atomic-css] and [Adam Wathan][adam-wathan:utility-classes] did a brilliant job at taking us on a journey from "regular" CSS to utility-first, and explaining the "why" behind it. Rather than paraphrasing, I'll focus on **the recurring criticism of utility-first** and debunk common misconceptions.

## "Might as well use inline styles"

The gut reaction people usually have when they see utility-first CSS is to compare it to applying CSS rules to HTML nodes through the `style` attribute. This way of styling is unanimously considered a bad practice, and we have since moved on to separate stylesheets and class abstractions. 

**Utility-first CSS is no different**. All styles are defined and maintained separately. This allows code reuse, usage of pseudo-classes, pseudo-elements, pre-processors and browser caching. Yet, atomic CSS detractors hurriedly associate it to inline styles. Atomic classes are small, they often have only one rule, and they're named in a *functional* way instead of being *semantic*.

All that being said, just because it *looks* the same doesn’t mean it *is* the same. Understanding how both practices differ is key to grasping the benefits of utility-first.

**Inline styles allow you to do anything you want**. You don't have to follow any pre-existing definition. You're re-writing everything from the ground up every time you style a new HTML node. Similar elements end up with duplicate code, which makes the page unnecessarily heavier. If you're not careful, it's easy to ignore pre-existing solutions and reinvent the wheel every time.

{% highlight html %}
<h2 style="font-size: 16px; font-weight: bold; color: purple">Stranger Things</h2>
<p style="font-size: 13px; font-style: italic">Stranger Things is an American science fiction-horror web television...</p>
<h2 style="font-size: 16px; font-weight: bold; color: purple">Game of Thrones</h2>
<p style="font-size: 13px; font-style: italic">Game of Thrones is an American fantasy drama television...</p>
{% endhighlight %}
Unnecessarily verbose, heavier file size, multiple sources of truth for a single design concept.
{:.caption}

{% highlight html %}
<button style="padding: 5px 8px; font-size: 13px">Button</button>
<button style="padding: 0 8px; font-size: 13px; line-height: 23px">Button</button>
<button style="display: flex; padding: 0 8px; font-size: 13px; height: 23px; align-items: center">Button</button>
{% endhighlight %}
Three attempts at solving the same problem. This is easily induced by the absence of a single source of truth, and likely to cause visual inconsistencies.
{:.caption}

**Utility classes expose a well-defined API that you can use to compose more complex components**. You're not re-writing styles; instead, you're relying on classes that define styles and behaviors once and for all.

{% highlight html %}
<h2 class="font-16 font-bold font-purple">Stranger Things</h2>
<p class="font-13 font-italic">Stranger Things is an American science fiction-horror web television...</p>
<h2 class="font-16 font-bold font-purple">Game of Thrones</h2>
<p class="font-13 font-italic">Game of Thrones is an American fantasy drama television...</p>
{% endhighlight %}

{% highlight css %}
/* Font sizes */

.font-13 { font-size: 13px }
.font-16 { font-size: 16px }
...

/* Font styles */

.font-bold { font-weight: bold }
.font-italic { font-style: italic }
...

/* Font colors */

.font-purple { color: purple }
...
{% endhighlight %}

Using a defined set of existing CSS rules, no matter how atomic they are, forces you to pick styles from a **limited list**. You're not granted total freedom like you are with inline styles. You're maintaining a consistent catalog of *allowed* styles on the one hand, and using them to *compose* larger components on the other hand. This approach enforces consistency by limiting you in the ways you can style elements in your project: instead of having access to 16+ million colors, you only have access the number of colors defined in your theme.

It also provides a **single source of truth**: instead of re-declaring the same `color` for each element that uses it, you define it once in a class and use that class wherever you need it. In addition to that, using separate styling (with atomic classes or not) gives you access to pseudo-classes and pseudo-elements, pre-processors, caching... a whole load of benefits that aren't available with inline styles.

You may argue that it doesn't matter if atomic styles are limited: carelessly mixing them may result in inconsistent layouts like with inline styles. But that's **a human issue, not a technical one**. You get the exact same problem with any approach, and any language for that matter, whether you're able to scope or not: if you don't follow the rules, style guides and best practices that your team put in place, you're the one to blame. Not the program, not the language, and not the architecture.

## "It violates separation of concerns"

One of the biggest arguments against functional CSS is that it goes against separation of concerns. That CSS should strictly be in charge of the styling, and HTML should semantically structure the page. That by using atomic classes and composing components in the HTML, you're somewhat delegating styling to the HTML instead of doing it in CSS.

**This is an extreme, and ultimately warped, vision of what "separation of concerns" means.**

I remember a few years back, I was on a job interview with a front-end developer who told me everything about his sheer disdain for Bootstrap. According to him, using extra markup to create a grid was a heresy: that's a job for CSS, and CSS only. HTML should be 100% oblivious to how it's rendered.

The problem with that kind of thinking is that it's **deeply impractical**. It raises design principles to a dogmatic level, ignoring concrete use-cases and context. It pushes you to be more concerned about checking all the "good practice" checkboxes than solving actual problems. 

Adam Wathan [explains it well (see: "Separation of concerns" is a straw man)][adam-wathan:utility-classes]: when it comes to HTML and CSS, you can't look at it from a strict "separation of concerns" perspective. **It's a "which depends on which" relationship**.

**Make no mistake:** just because style composition is performed in the HTML *document* doesn’t mean it's done *in HTML*. We're not using *style* or *align* attributes on HTML nodes. We're assembling pieces that we defined in a proper stylesheet, *in CSS*. Our HTML becomes a *consumer* of our CSS "API". As Vue.js explains it in their [documentation][vuejs:separation-of-concerns], separation of concerns doesn't equal separation of file types. Your styles can be composed on HTML nodes, **it's still a CSS job**.

## "It bloats the HTML"

When people mention code bloat, they usually mean one of two things (or both): code that's [**hard to read**](#its-ugly-and-hard-to-read), and a **heavier codebase**.

The complexity of your layout has to exist *somewhere*. A component-first approach doesn't remove "bloat", it only *deports* it to the stylesheet. Even so, because your larger components reuse the same atomic styles as others, **you inevitably end up with duplicate code**.

{% highlight scss %}
$green: #74b759;

.component {
  &-title {
    color: $green;
    font-weight: bold;
  }
}

.widget {
  &-title {
    color: $green;
    font-style: italic;
  }
}

.footer {
  &-links {
    color: $green;
    text-decoration: underline;
  }
}
{% endhighlight %}
Even with Sass, you get duplicate rules in the source code. `@mixin` can help, but you still get duplicates in the compiled CSS.
{:.caption}

Now I know what you're thinking. We got `@extend`. That's an ideal use case for it, right? Not so fast.

`@extend` may avoid ruleset duplication in the compiled CSS, but the mega comma-separated selector it will generate could end up being **a lot heavier than if you had duplicated the rule**. So much for avoiding bloat. You're also concatenating unrelated classes **and moving them all to the top**, where the first `@extend` takes place. This can quickly result in specificity issues and odd overrides. Not to mention that you can't `@extend` an outer class or placeholder from within a media query. So yeah, definitely not a silver bullet.

From a file size standpoint, **you shouldn't worry about repeated class names in the HTML**. That's what Gzip is for. The *deflate* algorithm was [specifically made][gzip:algorithm] to handle duplicate strings, so there's no point in trimming away characters in your HTML. The resulting file size will make **little to no difference** whether you use a few or a lot of classes.

On the other hand, the more a *selector* is repeated in a stylesheet, **the more work your browser has to do to resolve all styles**. If you have a single `.title-green` class for a given style, it simply matches all `.title-green` in the page. But if you have many classes doing the same thing (using `@mixin`) or similar selectors doing different things (using `@extend`), the more expensive it will be for the browser to match.

HTML "bloat" doesn't matter, **but CSS does**. The network and engine don't care how many classes you have in your HTML, but the way you write your CSS counts. If your decision-making process revolves around performances, make sure you focus your attention on the right things.

## "BEM is enough"

OOCSS and all derived methods (SMACSS, BEM, etc.) drastically improved how we handle CSS. Utility-first CSS is itself an heir of this approach: it, too, defines reusable *objects*.

The problem with BEM is that it focuses on **building components first**. Instead of looking for the smallest, unsplittable patterns, you're building *blocks* and their child *elements*. BEM does an excellent job at namespacing and preventing style leaks, but its component-first nature inevitably leads to [premature abstraction][wikic2:premature-abstraction]: you make a component for a certain use-case and end up never reusing it (a navbar component, for example).

BEM encourages you to use *modifiers* to handle component variations. This may seem smart at first, yet unfortunately leads up to other problems: you end up creating tons of modifiers you only use once for a specific use-case. **Worse:** from one component to another, you might end up with similar modifiers, further breaking the [DRY][wiki:dry] principle.

{% highlight css %}
.card {
  background: white;
  border: 1px solid grey;
  text-align: justify;
}

.card--left {
  text-align: left;
}

.card--right {
  text-align: right;
}

.tooltip {
  background: black;
  color: white;
  text-align: center;
}

/* Oops, looks like duplicate rules down there! */

.tooltip--left {
  text-align: left;
}

.tooltip--right {
  text-align: right;
}
{% endhighlight %}

At scale, components can become hard to change without breaking instances throughout a project. Premature abstraction keeps components from evolving and splitting into independent entities if they need to. Modifiers multiply as an attempt to fix it, resulting in non-reusable variations for unicorn use-cases, and undo band-aids when we realize our component does too much.

BEM is a great attempt at fixing inherent CSS problems, but making it the core CSS approach of your project brings all the problems you meet when favoring inheritance over composition.

## "It's a whole other language to learn on top of CSS"

This statement can be said of any naming system for any specific project, **whatever methodology you pick**. Your CSS class names ecosystem is a layer of abstraction on top of pure CSS. Whether you're using semantic names like `.card` or functional ones like `.bg`, new contributors will need to familiarize themselves with what does what and when to use it.

You can't escape having to use a naming interface between your HTML and CSS, unless you're willing to either describe your exact markup in CSS or write inline styles. Ultimately, functional class names are [easier to understand because](#its-ugly-and-hard-to-read) they describe the style. You know what they do without having to lookup the actual styles, while semantic names force you to either look at the rendering or browse code.

## "It's unmaintainable"

When people say utility-first CSS is unmaintainable, they often mention that when something changes in the design, you have to change it everywhere. You have buttons with regular corners and you decide to make them rounded, so you need to add the `.rounded-corners` utility class on every button in the code. Yet, the whole point of utility-*first* is that you **start** composing with utility classes, and **then** create components when you start identifying repetitive patterns.

A button is an ideal and most obvious candidate for being abstracted into its own component. You might not even need to go through the "utility-first, then component" phase for this case. When it comes to larger components, favoring composition *first* is the best choice for maintainability. Why? **Because it's safer to add or remove classes on a specific HTML node** than to add or remove styles in a class that applies on many elements.

Too many times have I been subjected to changing designs, and had to duplicate existing components to make them behave differently because I had no other choice. Even when a designer supplies all designs at the beginning of a project, and even if you do a great job at identifying components before you code, **you can't predict the future**.

Let's say initial designs have white cards with an inset box shadow and a little ribbon in the corner.

{% highlight css %}
.card {
  position: relative;
  background: white;
  padding: 22px;
  border: 1px solid lightgrey;
  text-align: justify;
  border-radius: 5px;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, .2);
  overflow: hidden;
}

.card::after {
  position: absolute;
  top: -11px;
  right: 9px;
  display: block;
  width: 10px;
  height: 50px;
  background: red;
  transform: rotateZ(-45deg);
  content: '';
}
{% endhighlight %}

{% highlight html %}
<div class="card">...</div>
{% endhighlight %}

This solution is simple, semantic and reusable. You handle everything in CSS and only have minimal HTML to write. But suddenly you get new designs for new pages, and they're using the card without the ribbon. Now you have to find a way to remove the ribbon for these new cards.

{% highlight css %}
.card-no-ribbon::after {
  display: none;
}
{% endhighlight %}

Problem is, this class is *undoing* something that was previously designed. Having to *add* a class to *remove* a feature is an anti-pattern: **it's counter-intuitive and hard to maintain**. When you decide to change how the base class behaves, you need to keep an eye on the undo modifier to make sure it still works.

We now need to add another ribbon to the bottom left.

{% highlight css %}
.card::before,
.card::after {
  /* shared code */
}

.card::before {
  top: -11px;
  right: 9px;
}

.card::after {
  bottom: -11px;
  left: 9px;
}
{% endhighlight %}

But now we need to update `.card-no-ribbon`!

{% highlight css %}
.card-no-ribbon::before,
.card-no-ribbon::after {
  display: none;
}
{% endhighlight %}

This, right here, **is the fragile base class anti-pattern in action**. Because your base class was abstracted too soon, is doing too much, and now needs to evolve, you can't edit it without worrying about possible side-effects. If new people start contributing to the project, those risks multiply by ten.

The only option you have left this stage is to do a refactor: have a nude `.card` as the base class, and add the ribbons with `.card--top-ribbon` and `.card--bottom-ribbon` modifiers. But now you have to edit all the existing `.card`s in your code that *do* need to have a ribbon.

**Early refactors are a pretty good indicator of unmaintainability**.

You could argue that a smart developer *could* have seen it coming. That they *should* have made a naked `.card` base class and a `.card--ribbon` modifier, right from the start. 

**That's actually making a case *in favor* of utility-first and composition**. 

You're taking the decision to break down a given design element that you deemed too monolithic, so it's easier to scale. **That's a good call.** The more you go, the more you'll realize this leads to utility-first. You might think it doesn't, and that your job is to *foresee* what is the bare minimum for a given component, but unless you own a crystal bowl this is a risky assessment. Plus, this is short-sighted: what if parts of your component need to be extended to other components? Like, what if you now need buttons with ribbons? If you duplicate the `.card--ribbon` class, your code isn't DRY anymore. Which makes it even more unmaintainable. So? Make a mixin and import it into both modifiers? Again, that's extra work and "wet" code.

The best solution for this use-case is to write a single utility class for the ribbon, and modifiers for sizes and colors if necessary. This allows you to have **a single source of truth** and use the ribbon anywhere you want to. If tomorrow you need to put ribbons on avatars, panels, unordered lists, modals, you can do it without having to write a single extra line of CSS.

**This is the definition of scalability and maintainability**. All you have to do is reuse the available code you wrote *proactively*, instead of having to tweak existing code *reactively*.

{% highlight css %}
.ribbon {
  position: relative;
  overflow: hidden;
}

.ribbon::after {
  position: absolute;
  display: block;
  top: -11px;
  right: 9px;
  width: 10px;
  height: 50px;
  background: red;
  transform: rotateZ(-45deg);
  content: '';
}
{% endhighlight %}
By breaking down designs into small elements, we write much more reusable code.
{:.caption}

Calling utility-first CSS "unmaintainable" is absolutely inaccurate. In fact, **it may be the most maintainable and scalable CSS methodology to this day.**

**You can't predict the future**. This is why you should always favor composition over inheritance. A good sign of a healthy and scalable codebase to **how things go when you need to change it**. If a new change makes you anxious because you might break something, it's a sign of poor design. But I would go a step further and say that if you need to write new CSS to make an existing component do something that another component already does, your code isn't as scalable as you think it is.

If you need to reuse behavior that exists somewhere, **you shouldn't have to write new code**. You should be able to trust and use what you already wrote and go from there. You have one source of truth on which you can rely, instead of two or more slight variations that you must not forget to keep up to date. **This is the definition of maintainability.**
 
## "It's ugly and hard to read"

Do you remember the uproar when BEM started to become popular? I do. I remember many people who were rejecting the whole thing only because of its syntax. Praising the model, but disgusted to the idea of chaining two underscores or two hyphens.

As humans, it's in our nature to be easily put off by what we're not familiar with. Yet, letting subjective cosmetic considerations come in the way of a potentially useful technique is where developers should draw the line. Our job is to **solve problems**. Our main concern should be **the end user**. Look at the source code of many big projects, most of them have ended up adopting BEM. Chances are not all their front-end developers were sold at the beginning.

Overcoming initial feelings, especially if driven by personal preference, isn't that hard **when you're putting the success of a project first**.

Now on the topic of legibility, I get that long strings of classes can be "scary" when you open a file for the first time. This is not an insurmountable task though. More verbose code is a trade-off of composition, but it's a **much lesser inconvenience than unscalability**.

I don't use shorthands like `.pt-8` or `.bb-lemon` in my own code. I favor full-length class names like `.padding-top-8` and `.border-bottom-lemon` which are much easier to read. Autocomplete solves the problem of having to type long class names, and there are tools you can use to re-hash class names into smaller ones for production. I doubt this will make any significant change to your performances but hey, if it makes you feel good to shave bytes away, knock yourself out 😊

Ultimately, the nature of functional class names might actually be **more expressive**. It's easy for your brain to make a connection between such a class and what's happening on screen. Even if you don't get to see how it renders, you can get a pretty good idea of what `.hidden` or `.opacity-6` are supposed to do.

{% highlight html %}
<blockquote class="border-thick-left-red padding-left-medium font-navy">
  <p>You know how they call a Quarter Pounder with Cheese in Paris?</p>
</blockquote>
{% endhighlight %}
Stylistically speaking, it's pretty easy to know what's going on here.
{:.caption}

Semantic class names don't convey the same thing. It works for small components like buttons or alerts, which are common enough to be easily recognized. Yet, the bigger and the more complex a component gets, the less obvious it is to know what class name maps to what element on the screen, or what it looks like.

{% highlight html %}
<div class="entry">
  <h2 class="entry-title">The Shining</h2>
  <div class="widget widget-lead">
    <div class="widget-content">
      <p>His breath stopped in a gasp. An almost drowsy terror stole through his veins...</p>
    </div>
    <div class="author">
      <img class="author-avatar" src="...">
      <h3 class="author-name">Stephen King</h3>
      <p>Stephen Edwin King (born September 21, 1947) is an American author of horror, supernatural fiction, suspense, science fiction, and fantasy...</p>
      <div class="btn-group">
        <a class="btn" href="#">Website</a>
        <a class="btn" href="#">Twitter</a>
      </div>
    </div>
  </div>
</div>
{% endhighlight %}
Harder to know what class does what without going through the stylesheet.
{:.caption}

In that way, functional classes are a lot easier to understand than semantic class names. They demand less catching up time, less file-switching and ultimately give you the very bit of information you're looking for anyway when dealing with them.

## "It's not how you write CSS"

**CSS specificity is a *feature*, not a bug.** Use it correctly, and it will give you amazing control.

That's what CSS veterans say when yet another article about the dangers of specificity pops up. And technically **they're right**: the CSS priority system isn't an accident. It usually bothers people who don't master CSS because of the lack of scope, but not because a language doesn't behave like you're used to means it's broken. Nested CSS rules are like `!important`: they're handy, but have been so poorly used for years that we now see it as something to *avoid*.

Specificity should be used **proactively**, not reactively. They should be *design decisions*, not a quick fix for when your styles don't apply. Harry Roberts explains it well in [CSS Guidelines][cssguidelines:specificity]: *"the problem with specificity isn’t necessarily that it’s high or low; it’s the fact it is so variant and that it cannot be opted out of: the only way to deal with it is to get progressively more specific"*.

Specificity is a powerful tool, but it needs to be used with the uppermost caution and a good long-term vision of the project. Use them wrong, and you'll feel the pain of having to go back. Keeping specificity low avoids problems altogether: it relies solely on source order, which is [a lot easier to manage][xfive:itcss]. With atomic CSS, if a style doesn't apply, fixing it is as simple as adding or removing a class on an HTML node. You don't have to call your stylesheet's structure into question, which is **a lot easier and safer to manage**.

{% highlight css %}
.color-navy {
  color: navy;
}

.color-red {
  color: red;
}
{% endhighlight %}

{% highlight html %}
<div class="color-red color-navy">
  <p>- Whose motorcycle is this?</p>
  <p>- It's a chopper baby.</p>
  <p>- Whose chopper is this?</p>
  <p>- It's Zed's.</p>
  <p>- Who's Zed?</p>
  <p>- Zed's dead baby, Zed's dead.</p>
</div>
{% endhighlight %}
Want the text to be navy? No need to touch the CSS. Simply remove the `.color-red` class from the encompassing `<div>`. If you need one of the children to be red, then move the `.color-red` on it.
{:.caption}

> *"If a feature is sometimes dangerous, and there is a better option, then always use the better option."* — Douglas Crockford

Using specificity or not isn't about showing how well you master CSS and how *you*, unlike others, can keep it under control. It's about **understanding the advantages and flaws of the features at your disposal**, and making choices in the best interest of the project.

## "You end up with plenty of unused CSS"

Let's say you're using Sass maps to [generate your utility classes][frontstuff:sass-maps]. Colors, font sizes, backgrounds, everything is automatically compiled into proper, ready-to-use CSS. Problem is, if you don't *use* everything, you're left with useless extra bytes in production. This can easily be fixed with [UnCSS][github:uncss].

UnCSS is great at dusting off your stylesheets, but it comes with **two caveats**: it only works on HTML files (so, no PHP and no template files) and it only takes into account the JavaScript that's executed on page load (not classes added on user interactions, for example). If you're using a language like PHP to render your pages, you can add a job in your deployment workflow that compiles pages into temporary HTML and runs UnCSS on them. For the second issue, you can use the `ignore` option to list out that are classes added on user interaction.

Now it's also important to **ponder this issue**. The cost of unused classes is heavier stylesheets (longer to download) and longer parse time. If you have **a lot**, and by that I mean a large percentage of your total styles, of unused classes, **this can hurt performances**. If you only have a few here and there, **the impact will be negligible**.

Maintaining your CSS codebase is your job as a developer. No matter what methodology you go with, you have to keep an eye on the project and make sure to remove dead code when things change. 

**Being careless with that is how you end up with plenty of unused classes, not because you're generating some of them**. 

Need a text color class only for the main color? Make a class for this one only. Need backgrounds for most colors in the theme, yet unsure you'll use them all right away? Generate the damn classes. They'll be ready when you need them, you won't have to maintain them when you add new colors, and the extra code will cost *nothing*. **This is not where your app's bottlenecks are**. If you're having performances issues, there are a million other things to consider before even looking into your CSS.

## "It makes it hard to know what's available to use"

When your CSS codebase is a large collection of small utility classes, reading the source code won't help you get a good overview of the available styles. But **is it the role of the source code anyway**?

It certainly isn't. That's what **style guides** are for.

Exploring source code is *far* from being enough to get a good understanding of how a full API is designed. This isn't limited to atomic CSS: OOCSS or BEM projects, even small ones, can reach a level of sophistication which requires at least a `README`. 

Can you imagine having to crawl back in an unminifed version of the master Bootstrap stylesheet every time you don't remember if this is `.col-md-offset-6` or `.col-offset-md-6`? Would anyone new to Bootstrap understand what such a class means without a little literature on how the grid works? Documentation, style guides, and API references are designed to help us make sense of complex systems. Sure, it doesn't mean documentation should justify poor design and unclear naming conventions, but thinking you should be able to understand an entire project only by reading the source code is pure fantasy.

There are plenty of tools out there to help you generate documentation right from your code. I use [KSS][kss] for most of my projects, but CSS-Tricks shares a [list of alternatives][css-tricks:documenting-css]. Give it a try!

## "Utility classes should be used along with components"

**Yes**. Absolutely. That's precisely why it's called utility-*first* and not utility-*only*.

Utility-first isn't about ditching components altogether. It means you should start off with utility classes, make the most of them, and only abstract when you see repeating patterns. You're allowing your project to grow while remaining flexible, and identify actual components over time, when patterns start to emerge.

It is crucial to understand that a component isn't *just* a similar-looking "block" that you *can* reuse. It's a pattern that is strongly tied to your specific project. Sure, you're probably going to use tons of `.btn` and `.modal`, so it makes sense to abstract them early on. But are you positive you're going to ever reuse `.testimonial`? Or at least reuse it *enough* to make it worth being a new component? Will it always look like this in every context, or is it specific to the homepage? Keep your options open. It's a lot easier to later abstract a composite style into a component than to try and undo one.

## "It makes redesigning/theming a nightmare"

Because atomic CSS is strongly tied to your design, this can make things more difficult when you have to do a redesign or develop an alternate theme. It's far from impossible though, and there are a few things you can do to make your utility-first CSS more suited to facing these kinds of needs.

You can start by keeping class names not too specific: instead of `.margin-bottom-8`, you can use a more abstract name like `.margin-bottom-xxs`. This way you can change the value without making the names invalid.

Another approach would be to create **aliases**. Imagine you're building an app that has light and dark mode: some colors would change, some others wouldn't. We don't want to make all our color utilities contextual: `.background-primary` and `.background-secondary` don't tell us what color is behind the class. You don't want an entire color system like that. Yet, you could still have color utilities with proper color names (`.background-lime` or `.background-red`), and also generate aliases for those which might need to change for theming purposes.

{% highlight css %}
/* Backgrounds */

.background-lime {
  background: #cdf2b0;
}

.background-off-white, .background-light {
  background: #ebefe8;
}

.background-dark-grey, .background-dark {
  background: #494a4f;
}

/* Colors */

.color-lime {
  color: #cdf2b0;
}

.color-off-white, .color-light {
  color: #ebefe8;
}

.color-dark-grey, .color-dark {
  color: #494a4f;
}
{% endhighlight %}

{% highlight html %}
<div class="background-light">
  <h2 class="color-lime">Ezekiel 25:17</h2>
  <p class="color-dark">The path of the righteous man is beset on all sides by the inequities of the selfish and the tyranny of evil men...</p>
</div>
{% endhighlight %}

From here, all you have to do is write a JavaScript function that toggles all `.*-light` and `.*-dark` classes. And for elements that don't need to change, you can use the original color classes.

This method works well, but if you have a lot of classes to switch it may end up hurting performances. DOM manipulations are expensive, you want to reduce them as much as possible if you can. Hopefully, there's a nifty technique involving CSS variables (thanks to Adam Wathan for coming up with it) which makes everything simpler.

{% highlight css %}
:root {
  --green: #42f49b;
  --off-white: #ebefe8;
  --dark-grey: #494a4f;
}

.theme-dark {
  --background: var(--dark-grey);
  --text: var(--off-white);
}

.theme-light {
  --background: var(--off-white);
  --text: var(--dark-grey);
}

.color-lime {
  color: var(--green);
}

.color-theme {
  color: var(--text);
}

.background-theme {
  background: var(--background);
}
{% endhighlight %}

{% highlight html %}
<div class="theme-light">
  <div class="background-theme">
    <h2 class="color-lime">Ezekiel 25:17</h2>
    <p class="color-theme">The path of the righteous man is beset on all sides by the inequities of the selfish and the tyranny of evil men...</p>
  </div>
</div>
{% endhighlight %}

We defined colors with CSS variables and assigned different values for each context. Depending on the encompassing class, [all colors will change thanks to ancestor inheritance][jsfiddle:hurmktbz]. If you were to allow theme switching, all you'd have to do is change `.theme-light` into `.theme-dark` on the parent `<div>`, and all colors would adapt.

This technique only works if you don't have to support Internet Explorer and Edge below version 15. Otherwise, go for the first technique and use CSS ancestor inheritance system to avoid having to toggle too many variables. If you have to assign a text color to an entire block, **set it on the parent instead of the children**.

{% highlight html %}
/* Nope */
<div class="background-light">
  <h2 class="color-lime">Ezekiel 25:17</h2>
  <p class="color-dark">The path of the righteous man is beset on all sides by the inequities of the selfish and the tyranny of evil men.</p>
  <p class="color-dark">Blessed is he, who in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brother's keeper and the finder of lost children.</p>
  <p class="color-dark">And I will strike down upon thee with great vengeance and furious anger those who would attempt to poison and destroy my brothers.</p>
  <p class="color-dark">And you will know my name is the Lord when I lay my vengeance upon thee.</p>
</div>

/* Yes */
<div class="background-light color-dark">
  <h2 class="color-lime">Ezekiel 25:17</h2>
  <p>The path of the righteous man is beset on all sides by the inequities of the selfish and the tyranny of evil men.</p>
  <p>Blessed is he, who in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brother's keeper and the finder of lost children.</p>
  <p>And I will strike down upon thee with great vengeance and furious anger those who would attempt to poison and destroy my brothers.</p>
  <p>And you will know my name is the Lord when I lay my vengeance upon thee.</p>
</div>
{% endhighlight %}

## Embracing change, within reason

Having strong opinions is great. Not everything has to be settled by finding a middle ground. But there's a clear line to draw between **being opinionated** and **being reluctant to change**.

We, as developers, **must be the first to embrace change**. Looking back at my first reaction towards utility-first CSS, I realize how important it is we keep an open mind instead of rushing to pick a side. **It doesn't matter how experienced *we think* we are**. Experience is great, but it can also make us believe we already have all we need to make judgment calls and don't need to dive deeper to understand new concepts.

**Software development changes every day**. Our industry is still young, and we're figuring things out as we go. It doesn't mean we should throw away the past, and continuously refactor all our projects to keep up with the latest trends. Past knowledge is the foundation of today's discoveries, and it's important we approach novelty with critical thinking. Yet, not because something is tried and true means it's set in stone.

We'll probably move on from utility-first CSS at some point, like we got past many things we used to consider the pinnacle of front-end development. In the meantime, let's try to stay as open-minded as possible, and **do what's best for the industry, the projects, and the users**.

*Want to learn more about utility-first CSS and how to use it in your projects? Go read [On the Growing Popularity of Atomic CSS][css-tricks:atomic-css] on CSS Tricks and [CSS Utility Classes and "Separation of Concerns"][adam-wathan:utility-classes] on Adam Wathan's blog. You can also check out utility-first libraries on this [curated list][css-tricks:utility-first-libraries] by CSS Tricks.*

[wiki:design-patterns]: https://en.wikipedia.org/wiki/Design_Patterns
[jon-gold:functional-css]: http://jon.gold/2015/07/functional-css
[zeldman:kiss-my-classname]: http://www.zeldman.com/2017/01/03/kiss-my-classname
[css-tricks:atomic-css]: https://css-tricks.com/growing-popularity-atomic-css/
[adam-wathan:utility-classes]: https://adamwathan.me/css-utility-classes-and-separation-of-concerns
[vuejs:separation-of-concerns]: https://vuejs.org/v2/guide/single-file-components.html#What-About-Separation-of-Concerns
[gzip:algorithm]: http://www.gzip.org/algorithm.txt
[wikic2:premature-abstraction]: http://wiki.c2.com/?PrematureAbstraction
[wiki:dry]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[cssguidelines:specificity]: https://cssguidelin.es/#specificity
[xfive:itcss]: https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture
[frontstuff:sass-maps]: http://frontstuff.io/generate-all-your-utility-classes-with-sass-maps
[github:uncss]: https://github.com/giakki/uncss
[kss]: http://warpspire.com/kss/syntax
[css-tricks:documenting-css]: https://css-tricks.com/options-programmatically-documenting-css
[jsfiddle:hurmktbz]: https://jsfiddle.net/hurmktbz
[css-tricks:utility-first-libraries]: https://css-tricks.com/need-css-utility-library/
