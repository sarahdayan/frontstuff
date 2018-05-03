---
layout: post
title: "Build a Shopping Cart with Vue and Dinero.js"
date: 2018-05-03 13:00:00 +0200
comments: true
---

My friend [Cory][twitter:corydhmiller] and I chat almost every day, so you can bet he knows about everything going on in my life. But as we were talking the other day, I realized **he had no idea how [Dinero.js][github:dinero.js], my latest project, actually works**. Like, what you can do with it.

I paused and realized it may actually not be *that* obvious. It's easier, whatever your skill level is, to understand what a smooth scrolling plugin does than what a money library has to offer.

> "Do you see in JavaScript how you can use a Date constructor to store a date and format it later? Or you use Moment.js to create moment objects and how it's better than storing dates as strings or any other type? Well, **Dinero.js is like Moment, but for money**. There's no native way to handle money, and if you try to do it with `Number` types, you're going to run into issues. That's what Dinero.js helps you avoid. It secures your monetary values in objects and allows you to do whatever you need with them."

I was happy with my explanation, as Cory started *"a-ha"*-ing. But I realized one thing had been missing from the beginning. Something that would speak volumes and help anyone understand the benefits of Dinero.js: a **real-world example**.

<iframe src="https://codesandbox.io/embed/ojvmp7ryk5?autoresize=1&hidenavigation=1&module=%2Fsrc%2FApp.vue&view=preview" style="width:100%; height:725px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

In this tutorial, we’ll build a **shopping cart**. We'll use Vue.js to build the component, then integrate Dinero.js to handle all the money stuff.

***TL;DR:*** *this post goes in-depth in the how and why. It’s designed to help you grasp the core concepts of Dinero.js. If you want to understand the whole thought process, read on. Otherwise you can look at the final code on [CodeSandbox][codesandbox:shopping-cart-dinero-vue].*

This post assumes you have basic knowledge of Vue.js. If not, first check my tutorial ["Build Your First Vue.js Component"]({% post_url 2017-12-26-build-your-first-vue-js-component %}). It will equip you with everything you need to go further.

## Getting started

For this project, we'll use [vue-cli][github:vue-cli] and the [webpack-simple][github:vuejs-webpack-simple] Vue.js template. If you don't have vue-cli installed globally on your machine, fire up your terminal and type the following:

{% highlight bash %}
npm install -g vue-cli
{% endhighlight %}

Then:

{% highlight bash %}
vue init webpack-simple path/to/my-project
{% endhighlight %}

You can keep the default options for all questions. When it's done, navigate to the new directory, install dependencies and run the project:

{% highlight bash %}
cd path/to/my-project
npm install
npm run dev
{% endhighlight %}

Webpack will start serving your project on port `8080` (if available) and open it in your browser.

## Setting up the HTML/CSS

**I won't get into page structure and styling in this tutorial**, so I invite you to copy/paste the code. Open the `App.vue` file, and paste the following snippets.

This goes between the `<template>` tags:

{% highlight html %}
<div id="app">
  <div class="cart">
    <h1 class="title">Order</h1>
    <ul class="items">
      <li class="item">
        <div class="item-preview">
          <img src="" alt="" class="item-thumbnail">
          <div>
            <h2 class="item-title"></h2>
            <p class="item-description"></p>
          </div>
        </div>
        <div>
          <input type="text" class="item-quantity">
          <span class="item-price"></span>
        </div>
      </li>
    </ul>
    <h3 class="cart-line">
      Subtotal <span class="cart-price"></span>
    </h3>
    <h3 class="cart-line">
      Shipping <span class="cart-price"></span>
    </h3>
    <h3 class="cart-line">
      Total <span class="cart-price cart-total"></span>
    </h3>
  </div>
</div>
{% endhighlight %}

Ant this between the `<style>` tags:

{% highlight css %}
body {
  margin: 0;
  background: #fdca40;
  padding: 30px;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  text-transform: uppercase;
  font-size: 110%;
  font-weight: normal;
}

.items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cart {
  background: #fff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  color: #333a45;
  border-radius: 3px;
  padding: 30px;
}
.cart-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 0 0;
  font-size: inherit;
  font-weight: normal;
  color: rgba(51, 58, 69, 0.8);
}
.cart-price {
  color: #333a45;
}
.cart-total {
  font-size: 130%;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 2px solid rgba(51, 58, 69, 0.1);
}
.item-preview {
  display: flex;
  align-items: center;
}
.item-thumbnail {
  margin-right: 20px;
  border-radius: 3px;
}
.item-title {
  margin: 0 0 10px 0;
  font-size: inherit;
}
.item-description {
  margin: 0;
  color: rgba(51, 58, 69, 0.6);
}
.item-quantity {
  max-width: 30px;
  padding: 8px 12px;
  font-size: inherit;
  color: rgba(51, 58, 69, 0.8);
  border: 2px solid rgba(51, 58, 69, 0.1);
  border-radius: 3px;
  text-align: center;
}
.item-price {
  margin-left: 20px;
}
{% endhighlight %}

## Adding data

When you're dealing with products, you usually retrieve raw data from a database or an API. We can get close by representing it in a separate JSON file, then import it asynchronously as if we were querying an API.

Let's create a `products.json` file in `assets/` and add the following:

{% highlight json %}
{
  "items": [
    {
      "title": "Item 1",
      "description": "A wonderful product",
      "thumbnail": "https://fakeimg.pl/80x80",
      "quantity": 1,
      "price": 20
    },
    {
      "title": "Item 2",
      "description": "A wonderful product",
      "thumbnail": "https://fakeimg.pl/80x80",
      "quantity": 1,
      "price": 15
    },
    {
      "title": "Item 3",
      "description": "A wonderful product",
      "thumbnail": "https://fakeimg.pl/80x80",
      "quantity": 2,
      "price": 10
    }
  ],
  "shippingPrice": 20
}
{% endhighlight %}

**This is pretty similar to what we would get from a real API:** data as a collection, with titles and text as strings, and quantity and prices as numbers.

We can go back to `App.vue` and set empty values in `data`. This will allow the template to initialize while the actual data is being fetched.

{% highlight js %}
data() {
  return {
    data: {
      items: [],
      shippingPrice: 0
    }
  }
}
{% endhighlight %}

Finally, we can fetch data from `products.json` with an asynchronous request, and update the `data` property when it's ready:

{% highlight js %}
export default {
  ...
  created() {
    fetch('./src/assets/products.json')
      .then(response => response.json())
      .then(json => (this.data = json))
  }
}
{% endhighlight %}

Now let's populate our template with this data:

{% highlight html %}
{% raw %}
<ul class="items">
  <li :key="item.id" v-for="item in data.items" class="item">
    <div class="item-preview">
      <img :src="item.thumbnail" :alt="item.title" class="item-thumbnail">
      <div>
        <h2 class="item-title">{{ item.title }}</h2>
        <p class="item-description">{{ item.description }}</p>
      </div>
    </div>
    <div>
      <input type="text" class="item-quantity" v-model="item.quantity">
      <span class="item-price">{{ item.price }}</span>
    </div>
  </li>
</ul>
...
<h3 class="cart-line">
  Shipping
  <span class="cart-price">{{ data.shippingPrice }}</span>
</h3>
...
{% endraw %}
{% endhighlight %}

**You should see all the items in your cart.** Now let's add some computed properties to calculate the subtotal and total:

{% highlight js %}
export default {
  ...
  computed: {
    getSubtotal() {
      return this.data.items.reduce(
        (a, b) => a + b.price * b.quantity,
        0
      )
    },
    getTotal() {
      return (
        this.getSubtotal + this.data.shippingPrice
      )
    }
  }
}
{% endhighlight %}

And add them to our template:

{% highlight html %}
{% raw %}
<h3 class="cart-line">
  Subtotal
  <span class="cart-price">{{ getSubtotal }}</span>
</h3>
...
<h3 class="cart-line">
  Total
  <span class="cart-price cart-total">{{ getTotal }}</span>
</h3>
{% endraw %}
{% endhighlight %}

There we go! Try changing quantities around, you should see the subtotal and total amounts change accordingly.

**Now we have a few issues here.** First, we're only showing amounts, not currencies. Sure, we could hard code them in the template right next to the reactive amounts. But what if we want to make a multi-lingual website? Not all languages format money the same way.

What if we want to show all amounts with two decimal places, for better alignment? You could try and keep all initial amounts as floats by using the `toFixed` method, but then you'd be working with `String` types which are a lot harder and less performant when it comes to doing maths. Also, that would mean changing data for purely presentational purposes, which never is a good idea. What if you need the same data for other purposes and it requires a different format?

Finally, the current solution is relying on floating point math, **which is a [bad idea when it comes to handling money]({% post_url 2018-04-13-how-to-handle-monetary-values-in-javascript %})**. Try and change a few amounts:

{% highlight json %}
{
  "items": [
    {
      ...
      "price": 20.01
    },
    {
      ...
      "price": 15.03
    },
    ...
  ]
}
{% endhighlight %}

Now, look at how broken your shopping cart is 😱 This isn't some buggy JavaScript behavior but **a limitation of how we can represent our decimal numbering system with binary machines**. If you do math with floats, you'll sooner or later encounter those inaccuracies.

The good news is, **we don't have to use floats to store money**. That's exactly where Dinero.js comes into play.

## Dinero.js, a wrapper for money

**Dinero.js is to money what Moment.js is to dates.** It's a library that lets you create monetary [value objects][wiki:value-object], manipulate them, ask them questions, and format them. It relies on Martin Fowler's [money pattern][martinfowler:money] and helps you solve all common problems caused by floats, primarily by storing amounts in minor currency unit, as integers.

Open up your terminal and install Dinero.js:

{% highlight js %}
npm install dinero.js --save
{% endhighlight %}

Then import it into `App.vue`:

{% highlight js %}
import Dinero from 'dinero.js'

export default {
  ...
}
{% endhighlight %}

You can now create Dinero objects 🎉

{% highlight js %}
// returns a Dinero object with an amount of $50
Dinero({ amount: 500, currency: 'USD' })

// returns $4,000.00
Dinero({ amount: 500 })
  .add(Dinero({ amount: 500 }))
  .multiply(4)
  .toFormat()
{% endhighlight %}

Let's create a factory method to turn our `price` properties into Dinero objects on demand. We have floats with up to two decimal places. This means if we want to turn them into their equivalents in minor currency units (in our case, dollars), **we need to multiply them by 10 to the power of 2**.

We pass the `factor` as an argument with a default value, so we can use the method with currencies that have different [exponents][wiki:iso-4217-exponents].

{% highlight js %}
export default {
  ...
  methods: {
    toPrice(amount, factor = Math.pow(10, 2)) {
      return Dinero({ amount: amount * factor })
    }
  }
}
{% endhighlight %}
Dollars are the default currency, so we don't need to specify it.
{:.caption}

Because we're doing floating point math during the conversion, some calculations may end up as slightly inaccurate floats. That's easy to fix by rounding the result to the closest integer.

{% highlight js %}
toPrice(amount, factor = Math.pow(10, 2)) {
  return Dinero({ amount: Math.round(amount * factor) })
}
{% endhighlight %}

Now we can use `toPrice` in our computed properties:

{% highlight js %}
export default {
  ...
  computed: {
    getShippingPrice() {
      return this.toPrice(this.data.shippingPrice)
    },
    getSubtotal() {
      return this.data.items.reduce(
        (a, b) =>
          a.add(
            this.toPrice(b.price).multiply(b.quantity)
          ),
        Dinero()
      )
    },
    getTotal() {
      return this.getSubtotal.add(this.getShippingPrice)
    }
  }
}

{% endhighlight %}

And in our template:

{% highlight html %}
{% raw %}
<ul class="items">
  <li :key="item.id" v-for="item in data.items" class="item">
    <div class="item-preview">
      <img :src="item.thumbnail" :alt="item.title" class="item-thumbnail">
      <div>
        <h2 class="item-title">{{ item.title }}</h2>
        <p class="item-description">{{ item.description }}</p>
      </div>
    </div>
    <div>
      <input type="text" class="item-quantity" v-model="item.quantity">
      <span class="item-price">{{ toPrice(item.price) }}</span>
    </div>
  </li>
</ul>
<h3 class="cart-line">
  Subtotal
  <span class="cart-price">{{ getSubtotal }}</span>
</h3>
<h3 class="cart-line">
  Shipping
  <span class="cart-price">{{ getShippingPrice }}</span>
</h3>
<h3 class="cart-line">
  Total
  <span class="cart-price cart-total">{{ getTotal }}</span>
</h3>
{% endraw %}
{% endhighlight %}

If you look at your shopping cart, you'll see `{}` in place of prices. That's because we're trying to display an object. Instead, **we need to format them so they can display prices with the right syntax**, alongside their currency symbol.

We can achieve that with Dinero's [`toFormat` method][dinerojs:dinero~toFormat].

{% highlight html %}
{% raw %}
<ul class="items">
  <li :key="item.id" v-for="item in data.items" class="item">
    ...
    <div>
      ...
      <span class="item-price">
        {{ toPrice(item.price).toFormat() }}
      </span>
    </div>
  </li>
</ul>
<h3 class="cart-line">
  Subtotal
  <span class="cart-price">
    {{ getSubtotal.toFormat() }}
  </span>
</h3>
<h3 class="cart-line">
  Shipping
  <span class="cart-price">
    {{ getShippingPrice.toFormat() }}
  </span>
</h3>
<h3 class="cart-line">
  Total
  <span class="cart-price cart-total">
    {{ getTotal.toFormat() }}
  </span>
</h3>
{% endraw %}
{% endhighlight %}

Look in your browser: **you now have a well-formatted, fully functional shopping cart** 🤗

## Going further

Now that you have a good grasp of the basics of Dinero.js, time to raise the bar a little.

### Presentation

Let's change `shippingPrice` to `0` in the JSON file. Your cart should now display *"Shipping: $0.00"*, which is accurate but not user-friendly. Wouldn't it be nicer for it to say *"Free"*?

Fortunately, Dinero.js has a plenty of handy methods to ask questions to your instances. In our case, the [`isZero` method][dinerojs:dinero~isZero] is exactly what we need.

In the template, you can display text instead of a formatted Dinero object whenever it represents zero:

{% highlight html %}
{% raw %}
<h3 class="cart-line">
  Shipping
  <span class="cart-price">
    {{
      getShippingPrice.isZero() ?
      'Free' :
      getShippingPrice.setLocale(getLocale).toFormat()
    }}
  </span>
</h3>
{% endraw %}
{% endhighlight %}

Of course, you can generalize this behavior by wrapping it in a method. It would take a Dinero object as an argument and return a `String`. This way, you could show *"Free"* whenever you try to display a zero amount.

### Locale switching

Imagine you're making an e-commerce website. You want to accommodate your international audience, so you translate content and add a language switcher. Yet, there's one detail that may slip your attention: **money formatting also changes depending on the language**. For example, €10.00 in American English translates to 10,00 € in French.

Dinero.js supports international formatting via the [I18n API][mdn:intl]. This lets you display amounts with localized formatting.

Dinero.js is immutable, so we can't rely on changing [`Dinero.globalLocale`][dinerojs:dinero#Globals] to reformat all existing instances. Instead, we need to use the [`setLocale` method][dinerojs:dinero~setLocale].

First, we add a new property `language` in `data` and set it to a default value. For locales, you need to use a [BCP 47 language tag][ietf:bcp47] such as `en-US`.

{% highlight js %}
data() {
  return {
    data: {
      ...
    },
    language: 'en-US'
  }
}
{% endhighlight %}

Now we can use `setLocale` directly on Dinero objects. When `language` changes, the formatting will change as well.

{% highlight js %}
export default {
  ...
  methods: {
    toPrice(amount, factor = Math.pow(10, 2)) {
      return Dinero({ amount: Math.round(amount * factor) })
        .setLocale(this.language)
    }
  },
  computed: {
    ...
    getSubtotal() {
      return this.data.items.reduce(
        (a, b) =>
          a.add(
            this.toPrice(b.price).multiply(b.quantity)
          ),
        Dinero().setLocale(this.language)
      )
    },
    ...
  }
}
{% endhighlight %}
All we need is to add `setLocale` in `toPrice` and `getSubtotal`, the only places where we're creating Dinero objects.
{:.caption}

Now we can add our language switcher:

{% highlight html %}
{% raw %}
<h1 class="title">
  Order
  <span>
    <span class="language" @click="language = 'en-US'">English</span>
    <span class="language" @click="language = 'fr-FR'">French</span>
  </span>
</h1>
{% endraw %}
{% endhighlight %}

{% highlight css %}
.language {
  margin: 0 2px;
  font-size: 60%;
  color: rgba(#333a45, 0.6);
  text-decoration: underline;
  cursor: pointer;
}
{% endhighlight %}

When you click on the switcher, it will reassign `language`, which will change how the objects are formatted. Because the library is immutable, this will return new objects instead of changing existing ones. It means if you create a Dinero object and decide to display it somewhere, then reference it somewhere else and apply a `setLocale` on it, **your initial instance won't be affected**. No pesky side effects!

## All tax included

It's common to see a tax line on shopping carts. You can add one with Dinero.js, using the [`percentage` method][dinerojs:dinero~percentage].

First, let's add a `vatRate` property in the JSON file:

{% highlight json %}
{
  ...
  "vatRate": 20
}
{% endhighlight %}

And an initial value in `data`:

{% highlight js %}
data() {
  return {
    data: {
      ...
      vatRate: 0
    }
  }
}
{% endhighlight %}

Now we can use this value to calculate the total of our cart with tax. First, we need to create a `getTaxAmount` computed property. We can then add it to `getTotal` as well.

{% highlight js %}
export default {
  ...
  computed: {
    getTaxAmount() {
      return this.getSubtotal.percentage(this.data.vatRate)
    },
    getTotal() {
      return this.getSubtotal
        .add(this.getTaxAmount)
        .add(this.getShippingPrice)
    }
  }
}
{% endhighlight %}

The shopping cart now shows the total with tax. We can also add a line to show what the tax amount is:

{% highlight html %}
{% raw %}
<h3 class="cart-line">
  VAT ({{ data.vatRate }}%)
  <span class="cart-price">{{ getTaxAmount.toFormat() }}</span>
</h3>
{% endraw %}
{% endhighlight %}

And we're done! We've explored several concepts of Dinero.js, but that’s only scratching the surface of what it has to offer. You can [read through the documentation][dinerojs] and check out the project on [GitHub][github:dinero.js]. Star it, fork it, send me feedback, or even open a pull request! I have a nice little [contributing guide][github:dinero.js:contributing] to help you get started.

You can also look at the final code on [CodeSandbox][codesandbox:shopping-cart-dinero-vue].

I'm currently working on bringing a `convert` method to Dinero.js, as well as better support for all [ISO 4217 currencies][wiki:iso4217] and cryptos. You can stay tuned by following me on [Twitter][twitter:frontstuff_io].

Happy coding! 👩🏻‍💻

[twitter:corydhmiller]: https://twitter.com/corydhmiller
[github:dinero.js]: https://github.com/sarahdayan/dinero.js
[codesandbox:shopping-cart-dinero-vue]: https://codesandbox.io/s/ojvmp7ryk5
[github:vue-cli]: https://github.com/vuejs/vue-cli
[github:vuejs-webpack-simple]: https://github.com/vuejs-templates/webpack-simple
[wiki:value-object]: https://en.wikipedia.org/wiki/Value_object
[martinfowler:money]: https://martinfowler.com/eaaCatalog/money.html
[wiki:iso-4217-exponents]: https://en.wikipedia.org/wiki/ISO_4217#Treatment_of_minor_currency_units_.28the_.22exponent.22.29
[dinerojs:dinero~toFormat]: https://sarahdayan.github.io/dinero.js/module-Dinero.html#~toFormat
[dinerojs:dinero~isZero]: https://sarahdayan.github.io/dinero.js/module-Dinero.html#~isZero
[mdn:intl]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
[dinerojs:dinero~setLocale]: https://sarahdayan.github.io/dinero.js/module-Dinero.html#~setLocale
[dinerojs:dinero#Globals]: https://sarahdayan.github.io/dinero.js/global.html#Globals
[ietf:bcp47]: http://tools.ietf.org/html/rfc5646
[dinerojs:dinero~percentage]: https://sarahdayan.github.io/dinero.js/module-Dinero.html#~percentage
[dinerojs]: https://sarahdayan.github.io/dinero.js
[github:dinero.js:contributing]: https://github.com/sarahdayan/dinero.js/blob/master/CONTRIBUTING.md
[wiki:iso4217]: https://en.wikipedia.org/wiki/ISO_4217
[twitter:frontstuff_io]: https://twitter.com/{{ site.twitter_username }}
