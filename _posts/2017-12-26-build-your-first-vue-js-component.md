---
layout: post
title:  "Build Your First Vue.js Component"
date:   2017-12-26 11:20:00 +0200
comments: true
---

I remember when I picked up CakePHP back in the days, I loved how easy it was to get started with. Not only were the docs well-structured and exhaustive, but they were also user-friendly. Years later, this is exactly what I found with Vue.js. Yet there's one thing the Vue docs are still short of compared to Cake: **a real-life project tutorial**.

No matter how well-documented a framework is, this isn't enough for everyone. Reading about concepts doesn't always help seeing the bigger picture or understand how you can use them to actually *make something*. If you're like me, you learn better by doing and you refer to the docs while you code, as you need them.

In this tutorial, we'll build a **star rating system** component. We'll visit several Vue.js concepts **when we need them** and we'll cover *why* we're using them.

![Vue.js Star Rating Component](assets/2017-12-26/rating.gif)

***TL;DR**: this post goes in-depth in the how and why. It's designed to help you grasp some core concepts of Vue.js and teach you how to make design decisions for your future projects. If you want to understand the whole thought process, read on. Otherwise you can look at the final code on [CodeSandbox][codesandbox:star-rating-system].*

## Getting started

Vue.js (rightfully) prides itself on being runnable as a simple script include, but things are a bit different when you want to use [single-file components][vuejs:sfc]. Now you don't *have* to build components this way. You can perfectly get away with defining a global component with `Vue.component`. Problem is, this comes with tradeoffs like having to use string templates, no scoped CSS support, and no build step (so, no preprocessors). Yet, we want to go deeper and learn how to build an actual component that you could use in a real project. For those reasons, we'll go with an actual real-life setup, powered by Webpack.

To keep things simple and reduce configuration time, we'll use [vue-cli][github:vue-cli] and the [webpack-simple][github:vuejs-webpack-simple] Vue.js template.

First, you need to install vue-cli globally. Fire up your terminal and type the following:

{% highlight bash %}
npm install -g vue-cli
{% endhighlight %}

You can now generate ready-to-use Vue.js boilerplates in a few keystrokes. Go ahead and type:

{% highlight bash %}
vue init webpack-simple path/to/my-project
{% endhighlight %}

You'll be asked a few questions. Choose defaults for all except "Use sass" to which you should answer yes (`y`). Then, vue-cli will initialize the project and create the `package.json` file. When it's done you can navigate to the project's directory, install dependencies and run the project:

{% highlight bash %}
cd path/to/my-project
npm install
npm run dev
{% endhighlight %}

That's it! Webpack will start serving your project on port `8080` (if available) and fire it in your browser. If all went well, you should see a welcome page like this one.

![Welcome to Your Vue.js App!](assets/2017-12-26/vue-js-welcome-page.png)

### Are we there yet?

Almost! To properly debug your Vue.js component, you need the right tools. Go ahead and install the Vue.js devtools browser extension ([Firefox][addon:firefox:vuedevtools]/[Chrome][addon:chrome:vuedevtools]/[Safari][addon:safari:vuedevtools]).

## Your first component

One of the best Vue.js features are **single-file components** (SFCs). They let you define the structure, style, and behavior of a component in one file, without the usual drawbacks of mixing HTML, CSS, and JavaScript.

SFCs end with a `.vue` extension and have the following structure:

{% highlight html %}
<template>
  <!-- Your HTML goes here -->
</template>

<script>
  /* Your JS goes here */
</script>

<style>
  /* Your CSS goes here */
</style>
{% endhighlight %}

Let's go and make our first component: create a `Rating.vue` file in `/src/components`, and copy/paste the code snippet above. Then, open `/src/main.js` and adapt the existing code:

{% highlight js %}
import Vue from 'vue'
import Rating from './components/Rating'

new Vue({
  el: '#app',
  template: '<Rating/>',
  components: { Rating }
})
{% endhighlight %}

Finally, add a little bit of HTML to your `Rating.vue`:

{% highlight html %}
<template>
  <ul>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
  </ul>
</template>
{% endhighlight %}

Now look at the page in your browser, and you should see the list! Vue.js attached your `<Rating>` component to the `#app` element in `index.html`. If you inspect the HTML, you should see no sign of the `#app` element: Vue.js replaced it with the component.

**Sidenote**: have you noticed you didn't even need to reload the page? That's because Webpack's [vue-loader][github:vue-loader] comes with a *hot reload* feature. Contrary to *live reloading* or *browser syncing*, *hot reloading* doesn't refresh the page every time you change a file. Instead, it watches for component changes and only refreshes them, keeping state untouched.

Now we've spent some time setting things up, but it's time we actually write meaningful code.

### The template

We're going to use [vue-awesome][npm:vue-awesome], an SVG icon component for Vue.js built with [Font Awesome icons][font-awesome]. This allows us to only load the icons we need. Go ahead and install it with npm (or Yarn):

{% highlight bash %}
npm install vue-awesome
{% endhighlight %}

Then edit your component like the following:

{% highlight html %}
<template>
  <div>
    <ul>
      <li><icon name="star"/></li>
      <li><icon name="star"/></li>
      <li><icon name="star"/></li>
      <li><icon name="star-o"/></li>
      <li><icon name="star-o"/></li>
    </ul>
    <span>3 of 5</span>
  </div>
</template>

<script>
  import 'vue-awesome/icons/star'
  import 'vue-awesome/icons/star-o'

  import Icon from 'vue-awesome/components/Icon'

  export default {
    components: { Icon }
  }
</script>
{% endhighlight %}

Alright alright, **let's slow down for a moment** and explain all that 😅

Vue.js uses native ES6 modules to handle dependencies and export components. The first two lines in the `<script>` block import icons individually, so you don't end up with icons you don't need in your final bundle. The third one imports the `Icon` component from `vue-awesome` so you can use it in yours.

`Icon` is a Vue.js SFC, like the one we're building. If you open the file you'll see it has the exact same structure as ours.

The `export default` block exports an object literal as our component's view model. We registered the `Icon` component in the `components` property so we can use it locally in ours.

Finally, we used the `Icon` in our HTML `<template>` and passed it a `name` property to define what icon we want. Components can be used as custom HTML tags by converting them to kebab-case (eg.: `MyComponent` becomes `<my-component>`). We don't need to nest anything inside of the component, so we used a self-closing tag.

**Sidenote**: have you noticed we added a wrapping `<div>` around the HTML? That's because we also added a counter in a `<span>` at root level, and component templates in Vue.js only accept one root element. If you don't respect that, you'll get a compilation error.

### The style

If you've worked with CSS for some time, you know one of the main challenges is having to deal with its global nature. Nesting has long been considered the solution to this problem. Now we know it can quickly lead to specificity issues, making styles hard to override, impossible to reuse, and a nightmare to scale.

Methodologies like [BEM][bem] were invented to circumvent this issue and keep low specificity, by namespacing classes. For a while, it's been the ideal way to write clean and scalable CSS. Then, frameworks and libraries like Vue.js or React came along and brought **scoped styling** to the table.

React has styled components, Vue.js has **component-scoped CSS**. It lets you write component-specific CSS without having to come up with tricks to keep it contained. You write regular CSS with "normal" class names, and Vue.js handles scoping by assigning data-attributes to HTML elements and appending it to the compiled styles.

Let's add some simple classes on the component:

{% highlight html %}
<template>
  <div class="rating">
    <ul class="list">
      <li class="star active"><icon name="star"/></li>
      <li class="star active"><icon name="star"/></li>
      <li class="star active"><icon name="star"/></li>
      <li class="star"><icon name="star-o"/></li>
      <li class="star"><icon name="star-o"/></li>
    </ul>
    <span>3 of 5</span>
  </div>
</template>
{% endhighlight %}

And style it:

{% highlight css %}
<style scoped>
  .rating {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    font-size: 14px;
    color: #a7a8a8;
  }
  .list {
    margin: 0 0 5px 0;
    padding: 0;
    list-style-type: none;
  }
  .list:hover .star {
    color: #f3d23e;
  }
  .star {
    display: inline-block;
    cursor: pointer;
  }
  .star:hover ~ .star:not(.active) {
    color: inherit;
  }
  .active {
    color: #f3d23e;
  }
</style>
{% endhighlight %}

See that *scoped* attribute up there? That's what tells Vue.js to scope the styles, so they won't leak anywhere else. If you copy/paste the HTML code right in the `index.html`, you'll notice your styles won't apply: that's because they're scoped to the component! 🎉

#### What about preprocessors?

Vue.js makes it a breeze to switch from plain CSS to your favorite preprocessor. All you need is the right Webpack loader and a simple attribute on the `<style>` block. We said "yes" to "Use sass" when generating the project, so vue-cli already installed and configured [sass-loader][github:sass-loader] for us. Now, all we need to do is add `lang="scss"` to the opening `<style>` tag.

We can now use Sass to write component-level styles, import partials like variables, color definitions or mixins, etc. If you prefer the indented syntax (or "sass" notation), simply switch `scss` to `sass` in the `lang` attribute.

### The behavior

Now that our component looks good, it's time to make it work. Currently, we have a hardcoded template. Let's set up some initial mock state and adjust the template so it reflects it:

{% highlight html %}
<script>
  ...
  export default {
    components: { Icon },
    data() {
      return {
        stars: 3,
        maxStars: 5
      }
    }
  }
</script>
{% endhighlight %}

{% highlight html %}
<template>
  <div class="rating">
    <ul class="list">
      <li v-for="star in maxStars" :class="{ 'active': star <= stars }" class="star">
        <icon :name="star <= stars ? 'star' : 'star-o'"/>
      </li>
    </ul>
    <span>3 of 5</span>
  </div>
</template>
{% endhighlight %}

What we did here is use Vue's `data` to setup component state. Every property you define in `data` becomes **reactive**: if it changes, it will be reflected in the view.

We're making a reusable component, so `data` needs to be a factory function instead of an object literal. This way we're getting a fresh object instead of a reference to an existing one that would be shared across several components.

Our `data` factory returns two properties: `stars`, the current number of "active" stars, and `maxStars`, the total amount of stars for the component. From these, we adapted our template so it reflects the actual component's state. Vue.js comes with a bunch of directives that let you add presentation logic to your template without mixing it with plain JavaScript. The `v-for` directive loops over any iterable object (arrays, objects literals, maps, etc.). It also can take a number as a range to be repeated *x* number of times. That's what we did with `v-for="star in maxStars"`, so we have an `<li>` for each star in the component.

You may have noticed some properties are prefixed with a colon: this is a shorthand for the `v-bind` directive, which dynamically binds attributes to an expression. We could have written it in its long form, `v-bind:class`.

We need to append the `active` class on `<li>` elements when the star is active. In our case, this means every `<li>` which index is less than `stars` should have the `active` class. We used an expression in the `:class` directive to only append `active` when the current `star` is less than `stars`. We used the same condition, this time with a ternary operator, to define what icon to use with the `Icon` component: `star` or `star-o`.

#### What about the counter?

Now that our star list is bound to actual data, it's time we do the same for the counter. The simplest way to do this is to use text interpolation with the mustache syntax:

{% highlight html %}
{% raw %}
<span>{{ stars }} of {{ maxStars }}</span>
{% endraw %}
{% endhighlight %}

Pretty straight-forward, isn't it? Now in our case, this does the trick but if we needed a more complex JavaScript expression, it would be better to abstract it in a **computed property**.

{% highlight js %}
export default {
  ...
  computed: {
    counter() {
      return `${this.stars} of ${this.maxStars}`
    }
  }
}
{% endhighlight %}

{% highlight html %}
{% raw %}
<span>{{ counter }}</span>
{% endraw %}
{% endhighlight %}

Here **this is overkill**. We can get away with in-template expressions and still keep things readable. Yet, keep computed properties in mind for when you have to deal with more convoluted logic.

Another thing we need to do is provide a way to hide the counter if we don't want it. The simplest way to do this is to use the `v-if` directive with a boolean.

{% highlight html %}
{% raw %}
<span v-if="hasCounter">{{ stars }} of {{ maxStars }}</span>
{% endraw %}
{% endhighlight %}

{% highlight js %}
export default {
  ...
  data() {
    return {
      stars: 3,
      maxStars: 5,
      hasCounter: true
    }
  }
}
{% endhighlight %}

#### Interactivity

We're almost done but we still have to implement the most interesting part of our component: **reactivity**. We're going to use `v-on`, the Vue.js directive that handles events, and `methods`, a Vue.js property on which you can attach all your methods.

{% highlight html %}
<template>
  ...
  <li @click="rate(star)" ...>
  ...
</template>
{% endhighlight %}

{% highlight js %}
export default {
  ...
  methods: {
    rate(star) {
      // do stuff
    }
  }
}
{% endhighlight %}

We added a `@click` attribute on the `<li>`, which is a shorthand for `v-on:click`. This directive contains a call to the `rate` method which we defined in the `methods` property of the component.

***"Wait a minute... this looks awfully familiar with HTML's `onclick` attribute. Isn't it supposed to be an outdated and bad practice to use inline JavaScript in HTML?"***

It is indeed, but even though the syntax looks a lot like `onclick`, comparing the two would be a mistake. When you're building a Vue.js component, you shouldn't think of it as separated HTML/CSS/JS, but rather as one component that uses several languages. When the project is served in the browser or compiled for production, all the HTML and directives are compiled into plain JavaScript. If you inspect the rendered HTML, you won't see any sign of your directives, nor any `onclick` attributes. Vue.js compiled your component and created proper bindings. This is also why you have access to the context of the component right from your template: because directives are bound to the view model. Contrary to a traditional project with separate HTML, the template is an integral part of the component.

Back to our `rate` method. We need to mutate `stars` to the index of the clicked element, so we pass the index from the `@click` directive, and we can do the following:

{% highlight js %}
export default {
  ...
  methods: {
    rate(star) {
      this.stars = star
    }
  }
}
{% endhighlight %}

Go check the page in your browser and try clicking on stars: **it works!**

If you open the Vue panel in your browser devtools and select the `<Rating>` component, you'll see the data change as you click on stars. This shows you that your `stars` property is **reactive**: as you mutate it, it dispatches its changes to the view. That concept is called **data-binding**, which you should be familiar with if you ever used frameworks like Backbone.js or Knockout. The difference is that Vue.js, like React, **does it in one direction only**: this is called **one-way data-binding**. But that topic deserves an article of its own 😊

At this point, we could call it done but there's a bit more work we could do to improve user experience.

Right now, we can't actually give a grade of zero, because clicking on a star sets the rate to its index. What would be better is to re-click on the same star and have it toggle its current state instead of staying active.

{% highlight js %}
export default {
  ...
  methods: {
    rate(star) {
      this.stars = this.stars === star ? star - 1 : star
    }
  }
}
{% endhighlight %}

Now if the clicked star's index is equal to the current value of `stars`, we decrement its value. Otherwise, we assign it the value of `star`.

If we want to be thorough, we should also add a layer of controls to make sure `stars` is never assigned a value that doesn't make sense. We need to make sure `stars` is never less than `0`, never greater than `maxStars`, and that it's a proper number.

{% highlight js %}
export default {
  ...
  methods: {
    rate(star) {
      if (typeof star === 'number' && star <= this.maxStars && star >= 0) {
        this.stars = this.stars === star ? star - 1 : star
      }
    }
  }
}
{% endhighlight %}

#### Passing props

Right now, the component's data is hardcoded in the `data` property. If we want our component to actually be usable, we need to be able to pass custom data to it from its instances. In Vue.js, we do that with **props**.

{% highlight js %}
export default {
  props: ['grade', 'maxStars', 'hasCounter'],
  data() {
    return {
      stars: this.grade
    }
  },
  ...
}
{% endhighlight %}

And in `main.js`:

{% highlight js %}
new Vue({
  el: '#app',
  template: '<Rating :grade="3" :maxStars="5" :hasCounter="true"/>',
  components: { Rating }
})
{% endhighlight %}

There are three things to observe here:

First, we used the `v-bind` shorthand to pass props from the component instance: this is what Vue.js calls the **dynamic syntax**. You don't need it when you want to pass a string value, for which the literal syntax (normal attribute without `v-bind`) will work. But in our case, since we're passing numbers and booleans, it's important we do.

The `props` and `data` properties are merged at compile time, so we don't need to change the way we call properties either in the view model or in the template. But for that same reason, we can't use the same names for `props` and `data` properties.

Finally, we defined a `grade` prop and passed it as a value to `stars` in the `data` property. The reason why we did that instead of using the `grade` prop directly is that the value will be mutated when we change the grade. In Vue.js, props are passed from parents to children, not the other way around, so you don't accidentally mutate the parent’s state. This would go against the [one-way data flow][vuejs:one-way-data-flow] principle and make things harder to debug. This is why you should **not** try to mutate a prop inside of a child component. Instead, define a local `data` property that uses the prop’s initial value as its own.

#### Final touches

Before we call it a day, there's one last piece of Vue.js goodness we should visit: **prop validation**.

Vue.js lets you control props before they're passed to the component. You can perform four major things: **check type**, **require a prop to be defined**, **setup default values**, and **perform custom validation**.

{% highlight js %}
export default {
  props: {
    grade: {
      type: Number,
      required: true
    },
    maxStars: {
      type: Number,
      default: 5
    },
    hasCounter: {
      type: Boolean,
      default: true
    }
  },
  ...
}
{% endhighlight %}

We used type checking to make sure the right type of data is passed to the component. This will be especially useful if we forget to use the dynamic syntax to pass non-string values. We also made sure the `grade` prop was passed by requiring it. For other props, we defined default values so the component works even if no custom data is passed.

Now we can instantiate the component simply by doing the following:

{% highlight html %}
<Rating :grade="3"/>
{% endhighlight %}

And that's it! You just created your first Vue.js component, and explored many concepts including generating a boilerplate projet with [vue-cli][github:vue-cli], [single-file components][vuejs:sfc], importing components in components, [scoped styling][vuejs:component-scoped-css], [directives][vuejs:directives], [event handlers][vuejs:event-handlers], [computed properties][vuejs:computed-properties], [custom methods][vuejs:data-and-methods], [one-way data flow][vuejs:one-way-data-flow], [props][vuejs:props] and [prop validation][vuejs:prop-validation]. And that's only scratching the surface of what Vue.js has to offer!

This is a pretty dense tutorial, so don't worry if you didn't understand everything. Read it again, pause between sections, explore and [fiddle with the code on CodeSandbox][codesandbox:star-rating-system]. And if you have any question or remark about the tutorial, don't hesitate to hit me up on [Twitter][twitter:frontstuff_io]!

[addon:chrome:vuedevtools]: https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
[addon:firefox:vuedevtools]: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools
[addon:safari:vuedevtools]: https://github.com/vuejs/vue-devtools/blob/master/docs/workaround-for-safari.md
[bem]: http://getbem.com/
[codesandbox:star-rating-system]: https://codesandbox.io/s/38k1y8x375
[font-awesome]: http://fontawesome.io/
[github:sass-loader]: https://github.com/webpack-contrib/sass-loader
[github:vue-cli]: https://github.com/vuejs/vue-cli
[github:vuejs-webpack-simple]: https://github.com/vuejs-templates/webpack-simple
[github:vue-loader]: https://github.com/vuejs/vue-loader
[npm:vue-awesome]: https://www.npmjs.com/package/vue-awesome
[twitter:frontstuff_io]: https://twitter.com/frontstuff_io
[vuejs:component-scoped-css]: https://vuejs.org/v2/guide/comparison.html#Component-Scoped-CSS
[vuejs:computed-properties]: https://vuejs.org/v2/guide/computed.html#Computed-Properties
[vuejs:data-and-methods]: https://vuejs.org/v2/guide/instance.html#Data-and-Methods
[vuejs:directives]: https://vuejs.org/v2/guide/syntax.html#Directives
[vuejs:event-handlers]: https://vuejs.org/v2/guide/events.html#Method-Event-Handlers
[vuejs:one-way-data-flow]: https://vuejs.org/v2/guide/components.html#One-Way-Data-Flow
[vuejs:props]: https://vuejs.org/v2/guide/components.html#Props
[vuejs:prop-validation]: https://vuejs.org/v2/guide/components.html#Prop-Validation
[vuejs:sfc]: https://vuejs.org/v2/guide/single-file-components.html