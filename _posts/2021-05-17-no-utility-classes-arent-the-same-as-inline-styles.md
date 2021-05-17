---
layout: post
title: "No, Utility Classes Aren't the Same As Inline Styles"
date: 2021-05-17 00:00:00 +0200
comments: true
---

Half a decade after the first official commit of [ACSS](https://acss.io/), one of the first viable functional CSS frameworks, utility-first CSS is alive and well. On [State of CSS 2020,](https://2020.stateofcss.com/technologies/methodologies/) the methodology has jumped to the top in terms of user satisfaction. [Tailwind CSS](https://tailwindcss.com/docs), the front-runner of the approach, has crossed 3.5 million downloads per month on [npm](https://www.npmjs.com/).

Like anything successful, utility-first CSS has many adepts and receives a fair share of criticism. This is a good thing. Polarized opinions usually mean something matters, for better or worse. It also contributes to its overall growth by revealing weaknesses and fueling innovation.

However, even after countless articles and talks to debunk common fallacies (including mine [here](/in-defense-of-utility-first-css) and [here](https://youtu.be/R50q4NES6Iw)), there's still a staggering amount of misinformation on utility-first CSS. By far, **the hardest cliché to uproot is that utility classes are the same as inline styles.**

In 2018, I wrote [In Defense of Utility-First CSS](/in-defense-of-utility-first-css), which touched on this specific misconception among others. At the time, it seemed like the easiest one to rectify, the one that would soon disappear because of how clear the difference is. But persisting falsehoods remind us that nothing is ever obvious and mostly require better explanations.

Three years later, time to give it another spin.

## Inline styles only apply to the elements they're declared on

Perhaps the biggest limitation with inline styles is that **they can only affect the element they're on.** This is a crucial difference with utility classes.

As with any CSS declaration, inline styles are subject to inheritance, so they can impact children if they declare an inheritable property.

{% highlight html %}
<article style="color: darkblue">
  <header>
    <h2>Blade Runner 2049</h2>
  </header>
  <section>
    <p>
      Officer K (Ryan Gosling), a new blade runner for the Los Angeles Police
      Department, unearths a long-buried secret that has the potential to plunge
      what's left of society into chaos. His discovery leads him on a quest to
      find Rick Deckard (Harrison Ford), a former blade runner who's been
      missing for 30 years.
    </p>
  </section>
</article>
{% endhighlight %}

The inheritable `color` property (inlined on the article element) affects any child which doesn't explicitly declare the `color` property.
{:.caption}

Aside from that, inline styles only have a local impact. This is because you can only declare *styles*, not *rules*. You're not in a style sheet or within an embedded `<style>` block, meaning you can't write selectors. This cuts you from writing styles for pseudo-classes and elements, more complex selectors using combinators, media queries, or animations.

Conversely, utility classes live in style sheets. **They have access to the same powerful features as any other CSS class.** For example, they can declare styles for pseudo-classes and elements.

{% highlight html %}
<style>
  .on-hover\:text-darkblue:hover {
    color: darkblue;
  }
</style>

<article>
  <header>
    <h2>Blade Runner 2049</h2>
  </header>
  <section>
    <p>
      Officer K (<a class="on-hover:text-darkblue" href="#">Ryan Gosling</a>), a new
      blade runner for the Los Angeles Police Department, unearths a long-buried
      secret that has the potential to plunge what's left of society into chaos.
      His discovery leads him on a quest to find Rick Deckard (Harrison Ford), a
      former blade runner who's been missing for 30 years.
    </p>
  </section>
</article>
{% endhighlight %}

A utility class can declare styles for pseudo-classes and elements.
{:.caption}

When people think about utility classes, they usually picture simple non-nested selectors with single-declaration rulesets. But while this can apply to part of a utility first CSS codebase, **this ignores how creative and powerful you can get with functional classes.**

For example, utility-first CSS framework [Tailwind CSS](https://tailwindcss.com/) provides `.group-hover` classes to let users style children elements when their parents, marked with a `.group` class, are being hovered. To do so, they leverage nested selectors. **Such behavior would be impossible with inline styles.**

{% highlight css %}
.group:hover .group-hover\:bg-current {
  background-color: currentColor;
}
{% endhighlight %}

Nested selectors are useful to compose more complex styles with utility classes.
{:.caption}

Nothing prevents you from going more complex than that, and use deeper nesting, selector lists, or CSS combinators. Utility classes are about single responsibility and controlled effects, not about restricting access to powerful features.

For example, the following utility class `.with-siblings:text-darkblue` applies the same color on itself and its siblings using multi-selectors and combinators. **With inline styles, you'd have to declare the color on every desired element.**

{% highlight css %}
.with-siblings\:text-darkblue,
.with-siblings\:text-darkblue ~ * {
  color: darkblue;
}
{% endhighlight %}

This ruleset leverages multi-selectors and combinators to create a utility class.
{:.caption}

Another use case is media queries. A decade ago, [Twitter Bootstrap](https://getbootstrap.com/) popularized breakpoint-based classes, allowing users to declare conditional states based on the viewport size. Classes like `.col-md-4` are declared inside a media query, so they only apply within a specific size range.

{% highlight html %}
<div class="container">
  <div class="row">
    <div class="col-md-8">.col-md-8</div>
    <div class="col-6 col-md-4">.col-6 .col-md-4</div>
  </div>
</div>
{% endhighlight %}

Bootstrap grids use media queries to create layout variation across devices of different sizes.
{:.caption}

There are plenty of available use cases with media queries, including print styles, user preference, feature availability, and more. With a utility-first approach, you can leverage these features to create functional classes that only apply under a given set of conditions.

{% highlight css %}
@media (hover: none) and (pointer: coarse) {
  .on-touch\:block {
    display: block;
  }
}

@media (orientation: landscape) {
  .when-landscape\:hidden {
    display: none;
  }
}

@media (prefers-color-scheme: dark) {
  .dark\:bg-darkblue {
    color: darkblue;
  }
}
{% endhighlight %}

You can make conditional classes by declaring them within media queries.
{:.caption}

**Inline styles don't have access to media queries.** They're only available within style sheets or `<style>` blocks, so it's impossible to style conditionally with just inline declarations.

## Inline styles can't be processed

The rise of pre- and post-processors is among the best innovations of the last decade or so when it comes to CSS and productivity. Of the 11,000 respondents to [State of CSS 2020](https://2020.stateofcss.com/technologies/pre-post-processors/), 89% would still use Sass again.

![Usage ranking for pre- and post-processors in State of CSS 2020.](/assets/2021-05-17/state-of-css-2020-pre-post-processors.png)

Usage ranking for pre- and post-processors in [State of CSS 2020](https://2020.stateofcss.com/).
{:.caption}

CSS pre-processors like [Sass](https://sass-lang.com/), [Less](https://lesscss.org/), and [Stylus](https://stylus-lang.com/) let users leverage imperative programming features such as variables, loops, functions, and more, to write clearer, DRY-er CSS by compiling a superset language into valid CSS. Post-processors—like [PostCSS](https://postcss.org/)—on the other hand, augments CSS after the fact by taking valid CSS and transforming it for different purposes—backward compatibility, scoping, auto prefixing, linting, you name it.

Utility classes are declared separately, so they're great candidates for processing. For example, [Uniform CSS](https://uniformcss.com/) is built entirely with Sass. If you're willing to write your own utility classes, you can use pre-processors to write less code, group features, and more.

{% highlight scss %}
@media (hover: none) and (pointer: coarse) {
  .on-touch\: {
    &block {
      display: block;
    }
    &flex {
      display: flex;
    }
    &grid {
      display: grid;
    }
  }
}

$font-weights: (
  'regular': 400,
  'medium': 500,
  'bold': 700,
);

@each $name, $weight in $font-weights {
  .font-#{$name} {
    font-weight: $weight;
  }
}
{% endhighlight %}

The programmatic capabilities of pre-processors help write utility classes more efficiently.
{:.caption}

[Tailwind CSS](https://tailwindcss.com/docs/installation#installing-tailwind-css-as-a-post-css-plugin), the leading utility-first CSS framework, was designed to work primarily as a PostCSS plugin. It also uses several PostCSS plugins, such as [PurgeCSS](https://purgecss.com/), to let go of any unused class at build-time or [`postcss-selector-parser`](https://github.com/postcss/postcss-selector-parser) in their [JIT compiler](https://tailwindcss.com/docs/just-in-time-mode).

While you *could* technically write tools to process inline styles within HTML, none of the existing mature tools provides any official and actively maintained solution for that. The CSS pre-/post-processing ecosystem largely relies on separate style sheets, where it brings the most value. At the time of this writing, **there's virtually no production-safe way to process inline styles.**

## Inline styles don't cache well

Now, you could say that inline styles *do* cache because you can cache HTML, which would be correct. However, this is highly inefficient.

**Content and style have radically different growth rates.** Content is designed to grow at least linearly, often much faster. If there's anything to cache, it usually doesn't last long. For example, a news site like the New York Times updates articles in real-time and [publishes hundreds of articles every day](https://www.theatlantic.com/technology/archive/2016/05/how-many-stories-do-newspapers-publish-per-day/483845/). The homepage uses the `no-cache` [cacheability directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#cacheability). [It does use a CDN](https://www.datacenterknowledge.com/archives/2017/04/18/how-new-york-times-handled-unprecedented-election-night-traffic-spike) like many sites that require high speed and high availability for their content but sets [maximum age](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#expiration) of 30 seconds for anything in the cache to be considered fresh. It makes it virtually impossible for a regular user to retrieve the same document twice when visiting the same page.

![The page served at nytimes.com has a TTL of 30 seconds.](/assets/2021-05-17/nyt-html-cache-headers.png)

The page served at [nytimes.com](http://nytimes.com) has a [TTL](https://developer.fastly.com/learning/concepts/cache-freshness/) of 30 seconds.
{:.caption}

When you look at their global style sheet, however, this is a different story. The [cacheability directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#cacheability) is set to `public` (which apparently [isn't necessary when using an expiration directive](https://www.fastly.com/blog/cache-control-wild), but here it still denotes intent), but more interestingly, is set to be considered fresh by the CDN for... a year!

![The global styles on nytimes.com can stay in cache for up to 365 days.](/assets/2021-05-17/nyt-css-cache-headers.png)

The global styles on [nytimes.com](http://nytimes.com) can stay in cache for up to 365 days.
{:.caption}

<div class="alert alert--info" markdown="1">

On some pages, the New York Times serves other style sheets with a much lower `max-age` directive (usually 60 seconds). Most of these are dynamically generated by [Svelte](https://svelte.dev/), a JavaScript UI library that lets you write scoped CSS. These assets contain a content-based hash in their file name that automatically busts the cache when the content change, so it's still unclear to me why they don't have longer TTLs. If anybody has the answer, [let me know on Twitter](https://twitter.com/frontstuff_io)!

</div>

This is a good demonstration of how style is expected to age compared to content. There are differences in caching strategy depending on the CSS methodology you use, but conceptually speaking, **on a content site, what it looks like is usually expected to last much longer than what it says.**

Now let's take a content site that *does* use utility-first CSS: the [Tailwind CSS documentation](https://tailwindcss.com/docs).

![The page served at tailwindcss.com/docs has a TTL of 0 seconds.](/assets/2021-05-17/tailwindcss-html-cache-headers.png)

The page served at [tailwindcss.com/docs](http://tailwindcss.com/docs) has a [TTL](https://developer.fastly.com/learning/concepts/cache-freshness/) of 0 seconds.
{:.caption}

The home page has a `max-age` of 0 with a `must-revalidate` revalidation directive, which is [the default `Cache-Control` header value set by Vercel](https://vercel.com/docs/edge-network/caching#static-files), the edge network that Tailwind uses for their site, to avoid browser caching and always ensure fresh content. In simpler terms, **this content page needs to be as fresh as possible.**

When you look at the styles for that same page, the strategy is radically different.

![The styles on tailwindcss.com/docs can stay in cache for up to 365 days.](/assets/2021-05-17/tailwindcss-css-cache-headers.png)

The styles on [tailwindcss.com/docs](http://tailwindcss.com/docs) can stay in cache for up to 365 days.
{:.caption}

As with the New York Times, styles on the Tailwind docs can stay in cache for up to a year. It also declares an `immutable` revalidation directive, indicating that the response won't change over time. Coupling a `max-age` of one year with an `immutable` revalidation directive is the equivalent of saying "please cache this forever", as the [HTTP 1.1 protocol won't let you declare values longer than that](https://www.ietf.org/rfc/rfc2616.txt). In other words, **these style sheets can be served from the cache for as long as possible because they're not expected to change.**

Why go down the rabbit hole of static file caching when we're talking about inline styles, you might wonder. The point here is to demonstrate with real use cases that **HTML and CSS caching aren't equivalent, because they serve different purposes.** You can cache an HTML page, so you can technically cache inline styles, but this is a failing strategy considering that this HTML page will need to revalidate for content reasons, way before you even touch the styles.

**Caching styles in CSS files is much more efficient** because, by nature, their content stays longer in the same state. It comes at the "cost" of an additional HTTP request, but with [persistent connections](https://en.wikipedia.org/wiki/HTTP_persistent_connection) (or even multiplexing with HTTP/2), the impact on latency and CPU are often unnoticeable.

Utility classes grow logarithmically, as you mostly reuse existing "design tokens" even when you build new features and create new pages. **Utility classes work wonderfully with long TTLs, while the location of inline styles makes it pointless ever to cache them.**

## Inline styles are unlimited

As explained in [In Defense of Utility-First CSS](/in-defense-of-utility-first-css), inline styles allow you to do anything you want. There are no rules, no guidelines, no design system, and no way to enforce anything. You keep on duplicating the same solutions to problems you've already solved.

{% highlight html %}
<section>
  <article style="padding: 5px 8px; color: darkblue">
    <p>A new chapter. A triumph. A cinematic miracle.</p>
    <footer>
      <p style="font-size: 13px; font-style: italic">
        Posted on
        <time datetime="2021-05-06 12:00">May 6, 2021</time>
        by Olly Richards.
      </p>
    </footer>
  </article>
  <article style="padding: 5px 8px; color: darkblue">
    <p>
      In the end, for all its pleasures, it's difficult to view Blade Runner
      2049 as anything but an elaborate echo of the original, neither true
      sequel nor reboot, unclear of its own identity.
    </p>
    <footer>
      <p style="font-size: 13px; font-style: italic">
        Posted on
        <time datetime="2017-10-30 12:00">October 30, 2017</time>
        by Melissa Anderson.
      </p>
    </footer>
  </article>
</section>
{% endhighlight %}

Inline styles repeat the same solutions, with greater chance of inconsistencies.
{:.caption}

**Utility classes belong to a CSS architecture, with rules and boundaries.** No matter how small, they're part of a strategy and compose a service for developers to use and *reuse*. If your product designer decides on a sizing scale for the project, utility classes won't let you deviate because they're limited. They're a direct projection of what's allowed in the project's design system, a library of authorized tokens for you to mix and match.

**Inline styles don't have a strategy.** They're escape hatches, useful when you need to assign dynamic styles, build demos, or make something work quickly. They're inherently limitless because they need to be—they're your last resort when you need to break the rules. And as such, they stick out like a sore thumb, an eyesore that constantly reminds you to clean up your mess whenever you peek at the code.

## Inline styles are one thing at a time

Because they're usually small, have functional names, and live in the HTML, utility classes *feel* similar to inline styles to many of those who encounter them for the first time. But contrary to popular belief, **utility classes aren't always single-property classes.**

Back when the only way to build grids was using floated blocks, the [clearfix hack](https://css-tricks.com/snippets/css/clear-fix/) became one of the first widely used utility classes on the Internet. The `.clearfix` class has no semantics. It's a purely presentational utility, meant to be reused anywhere you need. Yet, despite being atomic, it requires several declarations to be useful.

{% highlight css %}
.clearfix:after {
  content: '';
  display: table;
  clear: both;
}
{% endhighlight %}

One of the modern versions of the clearfix trick.
{:.caption}

Because they're like any other classes, utility classes can declare as many styles as necessary to do their job. The only reason why they're usually small is that they're single-purposed. When slicing a CSS codebase into a hyper modular design system, it's natural for the resulting design tokens to be one-liners. But because it's the norm doesn't mean it's the rule, and many utilities go against that trend.

From the Tailwind CSS codebase:

{% highlight css %}
.truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.inset-0 {
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}
{% endhighlight %}

A few multi-declaration utility classes in Tailwind CSS.
{:.caption}

Or Bootstrap:

{% highlight css %}
.text-hide {
  font: 0/0 a;
  color: transparent;
  text-shadow: none;
  background-color: transparent;
  border: 0;
}
{% endhighlight %}

A multi-declaration utility classes in Bootstrap.
{:.caption}

Inline styles declare one property at a time (unless they also declare CSS variables, but that's a marginal use case). These styles don't *mean* anything. They don't describe atomic visual concepts, they declare individual CSS properties and that's it. While utility classes aren't semantic, they still convey meaning and intent.

## Apples and oranges

**Constructive, documented criticism is not only healthy, it's also necessary.** We have nothing to gain by ignoring the shortcomings of the tools and methods we use. However, it's easy to fall for false equivalences, and shaping flawed reasoning from them.

In [yet another insightful Twitter thread](https://twitter.com/mathiasverraes/status/1223522167486406656), Mathias Verraes says:

> Your brain rewards you for classifying new information into existing buckets. Looking for similarities is lower energy than understanding new differences. [...] Proclaiming that the new idea is the same as the old idea, gives you permission not to investigate it deeply, stick to the existing reality where you are an expert in the old idea, and the new ones are merely repackaging of your insight.

Unless making discoveries is your job, there are few incentives for you to spend energy on distinguishing new concepts from known patterns.

Saying that utility classes and inline styles are the same is more comfortable than digging deeper to understand the differences. This even more true if you don't instantly see any other benefit to utility-first CSS, which could otherwise fuel your curiosity.

Mathias follows up:

> There's such a firehose of information, that keeping up with even a single topic is impossible. We should be forgiven for not knowing and understanding and keeping up with everything, even if our job is knowing and understanding and keeping up with everything. [...] But let's try to make a habit of this: when you feel "Oh I get it, it's just like...", then follow up with "So what makes the new thing different from the old thing?"

Limiting what information to spend brainpower on is not laziness but self-preservation. Being a developer is exhausting, especially in web. It's okay to deliberately pass on something, to not be interested, or to decide that now isn't the right time.

The key, however, is to be honest about it. Admitting you didn't (yet) go deeper into a topic to shape an informed viewpoint is a healthier reaction than making snap judgments because you think you need to have an opinion. **It also contributes to normalizing not knowing, creating a more welcoming atmosphere for beginners.**

Comparatively, this feels like a better contribution.
