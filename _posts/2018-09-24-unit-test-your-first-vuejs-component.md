---
layout: post
title: "Unit Test Your First Vue.js Component"
date: 2018-09-24 08:00:00 +0200
comments: true
---

In [**Build Your First Vue.js Component**][frontstuff:build-your-first-vue-js-component] we made a star rating component. We've covered many fundamental concepts to help you create more complex Vue.js components. Yet, there's one crucial point you need to build bulletproof components you can use in production: **unit testing**.

## Why unit test a component?

Unit tests are a crucial part of continuous integration. They make your code a lot more reliable by focusing on small, isolated entities and making sure they always behave as expected. You can confidently iterate on your project without fear of breaking things.

**Unit tests aren't limited to scripts.** Anything we can test in isolation is unit testable, as long as you respect a few good practices like single-responsibility, predictability and loose coupling.

As reusable entities of our app, **Vue.js components are great candidates for unit testing**. We'll test the one we made as a single unit with various inputs and user interactions, and make sure it always behaves as we expect.

## Before we start

A few things have changed since the [initial tutorial][frontstuff:build-your-first-vue-js-component]. [Vue CLI 3][vuejs:cli] was released, and [Vue Test Utils][vuejs:vue-test-utils], the official Vue.js unit testing utility library, has matured to beta version. In the first tutorial, we used [webpack-simple][github:vuejs-webpack-simple], a prototyping template that doesn't include testing features. For all those reasons, the simplest thing to do is to wipe the slate clean and migrate the project from the tutorial to a more recent Vue.js install.

I re-created the project from the first tutorial so you can download it directly from [GitHub][github:sarahdayan:star-rating-vue-js-tutorial]. Then, navigate to the unzipped directory and install dependencies.

***Note:*** *make sure you install [Node.js][nodejs] before going further.*

{% highlight sh %}
cd path/to/my/project
npm install
{% endhighlight %}

Then, run the project:

{% highlight sh %}
npm run serve
{% endhighlight %}

## Vue Test Utils & Jest

For this tutorial, we'll use [Vue Test Utils][vuejs:vue-test-utils], the official Vue.js testing toolkit, along with [Jest][jest], a JavaScript test runner backed by Facebook.

Vue Test Utils lets you mount Vue components in isolation and simulate user interactions. It has all the necessary utilities to test single-file components, including those using Vue Router or Vuex.

Jest is a full-featured test runner that requires almost no configuration. It also provides a built-in assertion library.

Using Vue CLI 3 (which I used to generate the [boilerplate][github:sarahdayan:star-rating-vue-js-tutorial]) allows you to pick your favorite test runner, and sets it up for you. If you want to use another test runner (like [Mocha][mocha]), install [Vue CLI 3][vuejs:cli] and generate your own starter project. Then, you can migrate the source files from [my boilerplate][github:sarahdayan:star-rating-vue-js-tutorial] right in it.

## What should we test?

A common approach of unit testing is to **only focus on the public API** (aka *black box testing*). By overlooking implementation details, you're allowing internals to change without having to adapt tests. After all, what you want to do is **make sure your public API won't break**. What happens under the hood is indirectly tested, but all that matters is for the public API to remain reliable.

This is also the official recommendation from the [Vue Test Utils guides][vuejs:vue-test-utils:common-tips]. Therefore, we'll only test what we can access from the outside of the component:

- user interactions
- props changes

We won't directly test computed properties, methods or hooks. These will be implicitly tested by testing the public interface.

## Setting up a spec file

Like with regular tests, each component has a spec file which describes all tests we want to run.

Specs are JavaScript files. By convention, they have the same name as the components they're testing, plus a `.spec` suffix.

Go ahead and create a `test/unit/Rating.spec.js` file.

{% highlight js %}
// Rating.spec.js

import { shallowMount } from '@vue/test-utils'
import Rating from '@/components/Rating'

describe('Rating', () => {
  // your tests go here
})
{% endhighlight %}

We've imported our `Rating` component and `shallowMount`. The latter is a Vue Test Utils function which lets us mount our component without mounting its children.

The `describe` function call wraps all the test we're about to write; it describes our **testing suite**. It has its own scope, and can itself wrap other nested suites.

Enough said **let's start writing tests**.

### Identifying testing scenarios

When we look at `Rating` from the outside, we can see it does the following:

- it renders a list of stars which is equal to the value of the `maxStars` prop the user passes,
- it adds an `active` class to each star which index is lower than or equal to the `stars` prop the user passes,
- it toggles the `active` class on a star when the user clicks it and removes it on the next stars,
- it toggles the icons `star` and `star-o` when the user clicks a star,
- it renders a counter if the user sets the `hasCounter` prop to `true`, hides it if they set it to `false`, and displays text saying how many stars of the maximum number of stars are currently active.

Notice we're only looking at what the component does from the outside. We don't care that clicking a star executes the `rate` method, or that the internal `stars` data property changes. We could rename these, but this shouldn't break our tests.

### Our first test

Let's write our first test. We first need to manually mount our component with `shallowMount`, and store it in a variable on which we'll perform assertions. We can also pass props through the `propsData` attribute, as an object.

The mounted component is an object which comes with a handful of useful utility methods.

{% highlight js %}
describe('Rating', () => {
  const wrapper = shallowMount(Rating, {
    propsData: {
      maxStars: 6,
      grade: 3
    } 
  })
  it('renders a list of stars with class `active` equal to prop.grade', () => {
    // our assertion goes here
  })
})
{% endhighlight %}

Then, we can write our first assertion:

{% highlight js %}
it('renders a list of stars with class `active` equal to prop.grade', () => {
  expect(wrapper.findAll('.active').length).toEqual(3)
})
{% endhighlight %}

Let's analyze what's happening here. First, we're using Jest's [`expect`][jest:expect] function, which takes the value we want to test as an argument. In our case, we call the [`findAll`][vuejs:vue-test-utils:findall] method on our `wrapper` to fetch all elements with an `active` class. This returns a [`WrapperArray`][vuejs:vue-test-utils:wrapperarray], which is an object that contains an array of [`Wrappers`][vuejs:vue-test-utils:wrapper].

A `WrapperArray` has two properties: `wrappers` (the contained `Wrappers`) and `length` (the number of `Wrappers`). The latter is what we need to make sure we have the expected number of stars.

The `expect` function also returns an object on which we can call methods to test the passed value: these methods are called **matchers**. Here, we use the `toEqual` matcher and pass it the expected value as in arguments. The method returns a boolean, which is what a test expects to either pass or fail.

To summarize, here we say we expect the total amount of elements with the class `active` we find in our wrapper to be equal to 3 (the value we assigned to the `grade` prop).

In your terminal, run your test:

{% highlight sh %}
npm run test:unit
{% endhighlight %}

You should see it pass 🎉 Time to write some more.

### Simulating user input

Vue Test Utils makes it easy to simulate what real users end up doing in production. In our case, users can click on stars to toggle them. We can fake this in our tests with the `trigger` method, and dispatch all kinds of events.

{% highlight sh %}
it('adds `active` class on an inactive star when the user clicks it', () => {
  const fourthStar = wrapper.findAll('.star').at(3)
  fourthStar.trigger('click')
  expect(fourthStar.classes()).toContain('active')
})
{% endhighlight %}

Here, we first get our fourth star with `findAll` and [`at`][vuejs:vue-test-utils:at], which returns a `Wrapper` from a `WrapperArray` at the passed index (zero-based numbering). Then, we simulate the `click` event on it: we're mimicking the action from a user who would click or tap the fourth star.

Since we set the `grade` prop to 3, the fourth star should be inactive before we click; therefore the click event should make it active. In our code, this is represented by a class `active` which we append on stars only when they're activated. We test it by calling the [`classes`][vuejs:vue-test-utils:classes] method on the star, which returns its class names as an array of strings. Then, we use the [`toContain`][jest:tocontain] matcher to make sure the `active` class is here.

#### Setup and teardown

Since we've triggered a click on our component, we've mutated its state. The problem is, we're using that same component for all our tests. What happens if we change the order of our tests, and move this one to first position? Then the second test would fail.

You don’t want to rely on brittle things like order when it comes to tests. A test suite should be robust, and existing tests should ideally not change unless you're breaking the API.

What we want is to make sure we always have a predictable wrapper to perform assertions on. We can achieve this with setup and teardown functions. These are helpers which let us initialize things before we run tests, and clean up afterward.

In our case, a way of doing it could be to create our wrapper before each test and destroy it after.

{% highlight js %}
let wrapper = null

beforeEach(() => {
  wrapper = shallowMount(Rating, {
    propsData: {
      maxStars: 6,
      grade: 3
    }
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Rating', () => {
  // we remove the `const wrapper = …` expression
  // …
}
{% endhighlight %}

As their name suggest, [`beforeEach`][jest:beforeeach] and [`afterEach`][jest:aftereach] run before and after each test. This way, we can be 100% sure we're using a fresh wrapper whenever we run a new test.

## Special identifiers for tests

It's never a good idea to mix selectors for styling and other purposes, such as test hooks. What if you change the tag name or the class? What if you don't have a specific identifier on an element you want to test, such as, in our case, the counter? You don't want to pollute your production code with classes which would be useless there. It would be much better to have dedicated hooks for tests, such as a dedicated data attribute, **but only during tests**. This way, this wouldn't leave a mess in the final build.

One way to handle this is to create a [custom Vue directive][vuejs:custom-directive].

The Vue instance has a `directive` method which takes two arguments: a **name** and an **object of functions** for each [hook of the component lifecycle][vuejs:custom-directive:hook-functions] when injected in the DOM. You can also pass a single function if you don't care about a specific hook.

Let's create a new directory called `directives` in `src/`, and add a `test.js` file. We'll export the function we want to pass in our directive.

{% highlight js %}
// test.js

export default (el, binding) => {
  // do stuff
}
{% endhighlight %}

A directive hook can take [several arguments][vuejs:custom-directive:directive-hook-arguments], but in our case, we only need the first two: `el` and `binding`. The `el` argument refers to the element the directive is bound to, and the `binding` argument is an object which contains the data we passed in the directive. This way, we can manipulate the element as we like.

{% highlight js %}
export default (el, binding) => {
  Object.keys(binding.value).forEach(value => {
    el.setAttribute(`data-test-${value}`, binding.value[value])
  })
}
{% endhighlight %}

We're passing an object to our directive, so we can generate data attributes starting with `data-test-`. In the handler function, we iterate over each property of `binding`, and we set a data attribute based on the name and value, on our element.

Now, we need to register our directive so we can use it. We can do it globally, but in our case, we're only going to register it locally, right in our `Rating.vue` component.

{% highlight html %}
<script>
import Test from '@/directives/test.js'

export default {
  // …
  directives: { Test },
  // …
}
</script>
{% endhighlight %}

Our directive is now accessible under the `v-test` name. Try setting the following directive on the counter:

{% highlight html %}
{% raw %}
<span v-test="{ id: 'counter' }" v-if="hasCounter">
  {{ stars }} of {{ maxStars }}
</span>
{% endraw %}
{% endhighlight %}

Now inspect the HTML in your browser with the developer tools: your counter should look like this:

{% highlight html %}
<span data-test-id="counter">2 of 5</span>
{% endhighlight %}

Great, it works! Now we don't need this either in dev mode nor when we build the project. The sole purpose of this data attribute is to be able to target elements during tests, so we only want to set it up when we run them. For this, we can use the `NODE_ENV` environment variable provided by Webpack, the module bundler powering our project.

When we run tests, `NODE_ENV` is set to `'test'`. Therefore, we can use it to determine when to set the test attributes or not.

{% highlight js %}
export default (el, binding) => {
  if (process.env.NODE_ENV === 'test') {
    Object.keys(binding.value).forEach(value => {
      el.setAttribute(`data-test-${value}`, binding.value[value])
    })
  }
}
{% endhighlight %}

Refresh your app in the browser and inspect the counter again: **the data attribute is gone**.

Now we can use the `v-test` directive for all elements we need to target. Let's take our test from earlier:

{% highlight js %}
it('adds `active` class on an inactive star when the user clicks it', () => {
  const fourthStar = wrapper.findAll('[data-test-id="star"]').at(3)
    fourthStar.trigger('click')
    expect(fourthStar.classes()).toContain('active')
})
{% endhighlight %}

We've replaced the `.star` selector with `[data-test-id="star"]`, which allows us to change classes for presentation purposes without breaking tests. We get one of the benefits of the [single-responsibility principle][wiki:srp] and loose [coupling][wiki:coupling]: when your abstractions only have a single reason to change, you avoid all kinds of pesky side-effects.

### Should we also use these hooks for the classes we test?

After setting this directive to target elements to test, you may be wondering if you should also use them to replace the classes we actively look for. Let's look at the assertion from our first test:

{% highlight js %}
expect(wrapper.findAll('.active').length).toEqual(3)
{% endhighlight %}

Should we use `v-test` on the elements with the `active` class, and replace the selector in the assertion? **Great question**.

Unit tests are all about testing one thing at a time. The first argument of the `it` function is a string, with which we describe what we're doing **from a consumer perspective**.

The test that wraps our assertion says `renders a list of stars with class active equal to prop.grade`: this is what the consumer expects. When they pass a number to the `grade` property, they expect to retrieve an equal number of *active* or *selected* stars. Yet, in our component's logic, the `active` class is precisely what we use to define this trait. We assign it depending on a specific condition, so we can visually differentiate active stars from the others. Here, the presence of this specific class is exactly what we want to test.

So, when deciding whether you should use a selector you already have or set a `v-test` directive, ask yourself the question: **what am I testing, and does using this selector makes sense for a business logic perspective?**

## How is it different from functional or end-to-end tests?

At first, it might look odd to unit test components. Why would you unit test UI and user interactions? Isn't that what functional tests are here for?

There is a fundamental yet subtle difference to make between testing a component's public API (aka from a **consumer** perspective) and testing a component from a **user** perspective. But first, let's underline something important: **we're testing well-defined JavaScript functions, not pieces of UI**.

When you look at a single-file component, it's easy to forget it compiles into a JavaScript function. We're not testing the underlying Vue mechanism which, from this function, causes UI-oriented side-effects like injecting HTML in the DOM. That's what Vue's own tests already take care of. In our case, our component is no different from any other function: **it accepts input and returns an output**. These causes and consequences are what we're testing, and nothing else.

What's confusing is that our tests look a bit different from regular unit tests. Usually, we write things like:

{% highlight js %}
expect(add(3)(4)).toEqual(7)
{% endhighlight %}

There's no debate here. Input and output of data, that's all we care about. With components, we're expecting for things to render visually. We're traversing a (virtual) DOM and test for the presence of nodes. That's also what you do with functional or end-to-end tests, with tools like [Selenium][selenium] or [Cypress.io][cypressio]. So how does that differ?

You need not to confuse *what* we're doing to fetch the data we want to test and the actual *purpose* of the test. **With unit tests, we're testing isolated behaviors, while with functional or end-to-end tests, we're testing scenarios**.

A unit test makes sure a *unit* of the program behaves as expected. It's addressed to the *consumer* of the component (the programmer who uses the component in their software). A functional test ensures a feature or a workflow behaves as expected, from a *user* perspective (the final user, who consumes the full software).

## Going further

I won't go into the detail of each test, because they all share a similar structure. You can find the [full spec file on GitHub][github:sarahdayan:star-rating-vue-js-tutorial:rating-spec], but I strongly recommend you try to implement them yourself first. Software testing is an art as much as it is a science and requires twice as much practice as it requires theory.

Don't worry if you didn't get everything, or if you struggle with writing your first tests: **testing is notoriously hard**. Also, if you have a question, don't hesitate to hit me up on [Twitter][twitter:frontstuff_io]!

[frontstuff:build-your-first-vue-js-component]: {% link _posts/2017-12-26-build-your-first-vue-js-component.md %}
[vuejs:cli]: https://cli.vuejs.org/
[vuejs:vue-test-utils]: https://vue-test-utils.vuejs.org/
[github:vuejs-webpack-simple]: https://github.com/vuejs-templates/webpack-simple
[github:sarahdayan:star-rating-vue-js-tutorial]: https://github.com/sarahdayan/star-rating-vue-js-tutorial
[nodejs]: https://nodejs.org/
[mocha]: https://mochajs.org/
[npm-update]: https://docs.npmjs.com/cli/update
[yarn-upgrade]: https://yarnpkg.com/lang/en/docs/cli/upgrade
[jest]: https://jestjs.io/
[vuejs:vue-test-utils:common-tips]: https://vue-test-utils.vuejs.org/guides/#common-tips
[vuejs:custom-directive]: https://vuejs.org/v2/guide/custom-directive.html
[vuejs:custom-directive:hook-functions]: https://vuejs.org/v2/guide/custom-directive.html#Hook-Functions
[vuejs:custom-directive:directive-hook-arguments]: https://vuejs.org/v2/guide/custom-directive.html#Directive-Hook-Arguments
[jest:expect]: https://jestjs.io/docs/en/expect#expectvalue
[vuejs:vue-test-utils:findall]: https://vue-test-utils.vuejs.org/api/wrapper/#findall-selector
[vuejs:vue-test-utils:wrapperarray]: https://vue-test-utils.vuejs.org/api/wrapper-array/
[vuejs:vue-test-utils:wrapper]: https://vue-test-utils.vuejs.org/api/wrapper/
[vuejs:vue-test-utils:at]: https://vue-test-utils.vuejs.org/api/wrapper-array/#at-index
[vuejs:vue-test-utils:classes]: https://vue-test-utils.vuejs.org/api/wrapper/#classes-classname
[jest:tocontain]: https://jestjs.io/docs/en/expect#tocontainitem
[jest:beforeeach]: https://jestjs.io/docs/en/api#beforeeachfn-timeout
[jest:aftereach]: https://jestjs.io/docs/en/api#aftereachfn-timeout
[wiki:srp]: https://en.wikipedia.org/wiki/Single_responsibility_principle
[wiki:coupling]: https://en.wikipedia.org/wiki/Coupling_(computer_programming)
[selenium]: https://www.seleniumhq.org/
[cypressio]: https://www.cypress.io/
[github:sarahdayan:star-rating-vue-js-tutorial:rating-spec]: https://github.com/sarahdayan/star-rating-vue-js-tutorial/blob/tests/tests/unit/Rating.spec.js
[twitter:frontstuff_io]: https://twitter.com/{{ site.twitter_username }}
