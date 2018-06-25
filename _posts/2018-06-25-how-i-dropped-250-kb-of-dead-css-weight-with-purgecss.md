---
layout: post
title:  "How I Dropped 250 KB of Dead CSS Weight with PurgeCSS"
date:   2018-06-25 08:00:00 +0200
---

I'm [a big advocate for utility-first CSS]({% post_url 2018-01-15-in-defense-of-utility-first-css %}). After trying several methods over the years, it's what I found to be **the best, most maintainable and most scalable way of writing CSS to this day**.

When my coworker [Clément Denoix][github:clemfromspace] and I built [api-search.io][api-search], I thus decided to use [Tailwind CSS][tailwindcss] to style it: a theme-agnostic, fully customizable utility-first library.

![Tailwind CSS](assets/2018-06-25/tailwind-css.png)

The whole point of a library is to give you access to a broad set of tools to use at will. The problem is, since you usually only use a subset of it, **you end up with a lot of unused CSS rules in your final build**.

In my case, not only did I load the entire Tailwind CSS library, but I also added several variants to some modules. That ended up making the final, built and minified CSS file weight **259 KB** (before GZip). That's quite heavy when you consider the website is a simple single-page app with a minimal design.

You don't want to load each utility by hand when you need it. That would be a long and cumbersome task. A better scenario is to have everything at your disposal during development, and **automatically remove what you didn't use during the build step**.

In JavaScript, we call it [tree-shaking][mdn:tree-shaking]. Now, thanks to [PurgeCSS][purgecss], **you can do the same with your CSS codebase**.

## Splitting my CSS

PurgeCSS analyzes your content files and your CSS, then matches the selectors together. If it doesn't find any occurrence of a selector in the content, it removes it from the CSS file. For that reason, **using PurgeCSS on my entire CSS codebase wouldn't work**.

The project contains three kinds of CSS:

- A CSS reset called [normalize.css][github:normalize.css], included in Tailwind CSS.
- [Tailwind CSS][tailwindcss], the most substantial part of my CSS codebase.
- Some custom CSS, mostly for styling the [InstantSearch][algolia:react-instantsearch] components to which I couldn't add classes.

The tool can't detect I need to keep selectors such as `.ais-Highlight`, **because the components that use it only show up in the DOM at runtime**. Same goes with `normalize.css`: I'm relying on it to reset browser styles, but many of the related components will never be matched because they're generated in JavaScript.

In the case of classes starting with `.ais-`, we can sort it out with [whitelisting](#whitelisting-runtime-classes). Now when it comes to reset styles, selectors are a bit trickier to track down. Plus, the size of `normalize.css` is pretty insignificant and isn't bound to change, so in this case, I decided to ignore the file altogether. Consequently, **I had to split styles before running PurgeCSS**.

My initial CSS configuration looked like this:

- A `tailwind.src.css` file with three `@tailwind` directives: `preflight`, `components` and `utilities`.
- An `App.css` file with my custom styles.
- An npm script in `package.json` to build Tailwind CSS right before starting or building the project. Every time this script runs, it outputs a `tailwind.css` file in `src`, which is loaded in the project.

The `@tailwind preflight` directive loads `normalize.css`. I didn't want PurgeCSS to touch it, so I moved it to a separate file.

{% highlight css %}
// tailwind.src.css

@tailwind components;
@tailwind utilities;
{% endhighlight %}

{% highlight css %}
/* normalize.src.css */

@tailwind preflight;
{% endhighlight %}

Then, I changed my existing `tailwind` script in `package.json` to build `normalize.src.css` separately.

{% highlight json %}
{
  "scripts": {
    "tailwind": "npm run tailwind:normalize && npm run tailwind:css",
    "tailwind:normalize": "tailwind build src/normalize.src.css -c tailwind.js -o src/normalize.css",
    "tailwind:css": "tailwind build src/tailwind.src.css -c tailwind.js -o src/tailwind.css"
  }
}
{% endhighlight %}

Finally, I loaded `normalize.css` in the project.

{% highlight js %}
// src/index.js

...
import './normalize.css'
import './tailwind.css'
import App from './App'
...
{% endhighlight %}

Now, I can run PurgeCSS on `tailwind.css` without fearing it might strip down needed rulesets.

## Configuring PurgeCSS

PurgeCSS comes in many flavors: a command-line interface, a JavaScript API, wrappers for Webpack, Gulp, Rollup, etc.

We used [Create React App][github:create-react-app] to bootstrap the website, so Webpack came [preconfigured and hidden][github:create-react-app:webpack] behind [react-scripts][npm:react-scripts]. This means I couldn't access Webpack configuration files unless I ran `npm run eject` to get them back and manage them directly in the project.

Not having to manage Webpack yourself has many advantages, so ejecting wasn't an option. Instead, I decided to use a custom configuration file for PurgeCSS, and an npm script.

I first created a `purgecss.config.js` at the root of the project:

{% highlight js %}
module.exports = {
  content: ['src/App.js'],
  css: ['src/tailwind.css']
}
{% endhighlight %}

- The `content` property takes an array of files to analyze to match CSS selectors.
- The `css` property takes an array of stylesheets to purge.

Then, I edited my npm scripts to run PurgeCSS:

{% highlight json %}
{
  "scripts": {
    "start": "npm run css && react-scripts start",
    "build": "npm run css && react-scripts build",
    "css": "npm run tailwind && npm run purgecss",
    "purgecss": "purgecss -c purgecss.config.js -o src"
  }
}
{% endhighlight %}

- I added a `purgecss` script that takes my configuration file and outputs the purged stylesheet in `src`.
- I made this script run every time we start or build the project.

### Special extractor for Tailwind CSS

Tailwind CSS uses special characters, so if you use PurgeCSS out of the box, it may remove necessary selectors. Fortunately, PurgeCSS allows us to use a [custom extractor][purgecss:creating-an-extractor], which is a function that lists out the selectors used in a file. For Tailwind, I needed to create a [custom one][tailwindcss:controlling-file-size]:

{% highlight js %}
module.exports = {
  ...
  extractors: [
    {
      extractor: class {
        static extract(content) {
          return content.match(/[A-z0-9-:\/]+/g) || []
        },
        extensions: ['js']
      }
    }
  ]
}
{% endhighlight %}

### Whitelisting runtime classes

**PurgeCSS can't detect classes that are generated at runtime**, but it lets you define a whitelist. The classes you whitelist remain in the final file no matter what.

The project uses [React InstantSearch][algolia:react-instantsearch], which generates components with classes that all start with `ais-`. Conveniently, PurgeCSS supports patterns in the form of regular expressions.

{% highlight js %}
module.exports = {
  ...
  css: ['src/tailwind.css', 'src/App.css'],
  whitelistPatterns: [/ais-.*/],
  ...
}
{% endhighlight %}

Now if I forget to remove a class that I no longer use from `App.css`, it will be taken out from the final build, but my InstantSearch selectors will remain safe.

## New build, lighter CSS

With this new configuration, **my final CSS file has gone from 259 KB  to… 9 KB!** It's pretty significant in the context of a whole project, especially since many countries still have slow and unstable Internet, and more and more people browse on their phone while on the move.

Accessibility is also about catering for people with low bandwidth connection. It's not acceptable not to try and help your users with slower Internet, especially if what you’re making them download is dead code.

That’s worth taking a moment to optimize your build. 🙂

[github:clemfromspace]: https://github.com/clemfromspace
[api-search]: https://www.api-search.io/
[tailwindcss]: https://tailwindcss.com/
[mdn:tree-shaking]: https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking
[purgecss]: https://www.purgecss.com/
[github:normalize.css]: https://github.com/necolas/normalize.css
[algolia:react-instantsearch]: https://community.algolia.com/react-instantsearch/
[github:create-react-app]: https://github.com/facebook/create-react-app
[github:create-react-app:webpack]: https://github.com/facebook/create-react-app#get-started-immediately
[npm:react-scripts]: https://www.npmjs.com/package/react-scripts
[purgecss:creating-an-extractor]: https://www.purgecss.com/extractors#creating-an-extractor
[tailwindcss:controlling-file-size]: https://tailwindcss.com/docs/controlling-file-size/
