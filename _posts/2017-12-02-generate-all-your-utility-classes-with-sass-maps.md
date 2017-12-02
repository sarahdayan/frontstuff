---
layout: post
title:  "Generate All Your Utility Classes with Sass Maps"
date:   2017-12-02 22:58:00 +0200
comments: true
---

One of the powers of utility classes lies in giving you access to every small concept of your design system, in a slew of contexts. If your main color is royal blue, you can apply it as a text color on anything with a `.text-royal-blue` class, as a background color with a `.bg-royal-blue` class, etc. But how do you write them in an effective, consistent and scalable way?

**TL;DR**: this post goes in-depth in the how-to stuff. If you want to understand the whole thought process, read on. Otherwise you can grab the code on [GitHub][github:sass-modifiers-mixin] or test it out on [SassMeister][sassmeister:sass-modifiers-mixin].

{% highlight scss %}
$royal-blue: #0007ff;

.text-royal-blue {
  color: $royal-blue;
}

.bg-royal-blue {
  background: $royal-blue;
}

...
{% endhighlight %}

That's repetitive. Not only you're hand typing the color name and value every single time, but you're also creating an unmaintainable system. What happens when you have ten color utilities like these ones, and you need to add one more color to the scheme? You shouldn't spend time on mindless, tedious tasks. **That's what scripting languages are for**. If you're already using Sass, you need to harness its power and let it help you.

## Sass Maps?

[Maps][sass:maps] are a Sass data type that represents **an association between keys and values**. If you're familiar with other scripting languages you could see it as an [associative array][wiki:associative-array]. It allows you to store data, and have a name to reference each piece.

[Lists][sass:lists] and maps are a bit similar, in that they're both storing a collection of data and they're both iterable in an `@each` loop. But contrary to lists, maps make it easy to reference any piece of information by calling it by its name. This makes it ideal for grouping logically related information.

{% highlight scss %}
$colors: (
  mako-grey: #404145,
  fuel-yellow: #ecaf2d,
  pastel-green: #5ad864
);
{% endhighlight %}

## Let's add some logic

Now that our colors are neatly stored inside a map, we need to iterate it to generate our utility classes. To do that, we'll use the `@each` directive inside a `@mixin`, that we'll include later in our utility base class.

{% highlight scss %}
@mixin color-modifiers {
  // do stuff
}
{% endhighlight %}

Let's now use the `@each` directive to loop through `$colors` and fetch the right data.

{% highlight scss %}
@mixin color-modifiers {
  @each $name, $hex in $colors {
    // do stuff
  }
}
{% endhighlight %}

We're iterating `$colors` and at every loop, the current key will be referenced in `$name` and the color's hexadecimal code will be in `$hex`. We can start building our ruleset.

{% highlight scss %}
@mixin color-modifiers {
  @each $name, $hex in $colors {
    &-#{$name} {
      color: $hex;
    }
  }
}
{% endhighlight %}

Now for every pair in the map, `@each` will generate a ruleset that references the parent selector with the `&` character, appends a hyphen and the color's name, and sets the `color` attribute to the current hexadecimal value.

In other words, doing this:

{% highlight scss %}
.text {
  @include color-modifiers;
}
{% endhighlight %}

Will generate this:

{% highlight css %}
.text-mako-grey {
  color: #404145;
}
.text-fuel-yellow {
  color: #ecaf2d;
}
.text-pastel-green {
  color: #5ad864;
}
{% endhighlight %}

Pretty neat, uh? Actually, we barely scratched the surface. For now, our mixin can only output rules with the `color` attribute. What if we want to create some utility classes for background colors?

Fortunately, Sass allows us to pass arguments to mixins.

{% highlight scss %}
@mixin color-modifiers($attribute: 'color') {
  @each $name, $hex in $colors {
    &-#{$name} {
      #{$attribute}: $hex;
    }
  }
}
{% endhighlight %}

Now we can specify exactly what attribute we want.

Let's improve our mixin a little more: right now the modifier prefix is a hardcoded hyphen. This means your classes will always be in the form of `.base-modifier`. What if you need it to change? What if you also want to generate some BEM-flavored modifiers (two hyphens)? Again, that's something we can achieve by using arguments.

{% highlight scss %}
@mixin color-modifiers($attribute: 'color', $prefix: '-') {
  @each $name, $hex in $colors {
    &#{$prefix}#{$name} {
      #{$attribute}: $hex;
    }
  }
}
{% endhighlight %}

Now we can generate modifier classes with any kind of prefix we want. So, doing this:

{% highlight scss %}
.text {
  @include color-modifiers($prefix: '--');
}
{% endhighlight %}

Will generate this:

{% highlight css %}
.text--mako-grey {
  color: #404145;
}
.text--fuel-yellow {
  color: #ecaf2d;
}
.text--pastel-green {
  color: #5ad864;
}
{% endhighlight %}

**Pro tip**: in Sass, you can explicitly name arguments when you call a mixin or a function (like in the example above). This avoids having to provide them in order.

## Maps within maps

I like to use a slightly different color system so I can manage tonal variations. By nesting maps within maps, I have a clean and readable way to keep shades grouped together.

{% highlight scss %}
$colors: (
  grey: (
    base: #404145,
    light: #c7c7cd
  ),
  yellow: (
    base: #ecaf2d
  ),
  green: (
    base: #5ad864
  )
);
{% endhighlight %}

If we want to work with such a color system, we need to adapt our mixin so it goes iterating a level deeper.

{% highlight scss %}
@mixin color-modifiers($attribute: 'color', $prefix: '-', $separator: '-') {
  @each $name, $color in $colors {
    &#{$prefix}#{$name} {
      @each $tone, $hex in $color {
        &#{$separator}#{$tone} {
          #{$attribute}: $hex;
        }
      }
    }
  }
}
{% endhighlight %}

We added a new argument, `$separator`, to link the color's name and the tone. We could have used the `$prefix` but it doesn't have the same purpose. Using a dedicated variable with a default value is a better choice, as it gives us full freedom when we use the mixin.

Now, doing this:

{% highlight scss %}
.text {
  @include color-modifiers;
}
{% endhighlight %}

Will generate this:

{% highlight css %}
.text-grey-base {
  color: #404145;
}
.text-grey-light {
  color: #c7c7cd;
}
.text-yellow-base {
  color: #ecaf2d;
}
.text-green-base {
  color: #5ad864;
}
{% endhighlight %}

Great! We now have helpers composed of a base class, a color, and a tone. One thing we need to improve though is how base color modifiers are outputted. We actually don't need that `-base` suffix, the base class and color are enough.

What we must do is check for the tone in the nested `@each` loop, and only output it and the `$separator` when it's not "base". Luckily for us, Sass already has everything we need.

## @if, @else, if()

Our first instinct might be to use the `@if/@else` directives. Problem is, this would force us to repeat code and result in complicated code. Instead, we're going to use one of Sass' secret weapons: `if()`.

`if()` is Sass' conditional (ternary) operator. It takes three arguments: a condition and two return statements. If the condition is met, `if()` will return the first statement. Otherwise, it will return the second one. You can see it as an `@if/@else` shorthand.

{% highlight scss %}
@mixin color-modifiers($attribute: 'color', $prefix: '-', $separator: '-', $base: 'base') {
  @each $name, $color in $colors {
    &#{$prefix}#{$name} {
      @each $tone, $hex in $color {
        &#{if($tone != $base, #{$separator}#{$tone}, '')} {
          #{$attribute}: $hex;
        }
      }
    }
  }
}
{% endhighlight %}

Every time the nested `@each` loop will parse a `$tone` that's different from "base", it will return the `$separator` and the `$tone` as the class suffix. Else, it will return nothing, leaving the class as is.

{% highlight css %}
.text-grey {
  color: #404145;
}
.text-grey-light {
  color: #c7c7cd;
}
.text-yellow {
  color: #ecaf2d;
}
.text-green {
  color: #5ad864;
}
{% endhighlight %}

## DRY-ing it all up

In a real-world project, chances are you'll want to use various map structures. For example, you could have one-level deep maps for font sizes and two-levels deep maps for colors. **You're not going to write a different mixin for each depth level**. That would be repetitive and unmaintainable. You need to be able to rely a single mixin to handle that.

We want a generic mixin to generate all modifiers, and that's able to handle multidimensional maps. If you compare the two mixins we came up with in this tutorial, you'll notice they look a lot alike. The only difference is that one performs an extra loop before printing the computed CSS declaration. This is a typical job for a **recursive mixin**.

The first thing we need is a function to detect the depth of a map. Sass doesn't have a native function for that, but [Hugo Giraudel][hugo-giraudel] wrote a fantastic custom one called `map-depth`:

{% highlight scss %}
@function map-depth($map) {
  $level: 1;

  @each $key, $value in $map {
    @if type-of($value) == "map" {
      $level: max(map-depth($value) + 1, $level);
    }
  }

  @return $level;
}
{% endhighlight %}

We can now write our recursive mixin. It will begin with an `@each` directive where we can start building our selector. This is where we'll check if the current `$key` equals to "base" so we can decide to output it or not. Then, we'll check the depth of the map: if it returns more than 1, we need to run the mixin again from where we are and pass it the nested map. Otherwise, we can print the CSS declaration.

{% highlight scss %}
@mixin modifiers($map, $attribute, $prefix: '-', $separator: '-', $base: 'base') {
  @each $key, $value in $map {
    &#{if($key != $base, #{$prefix}#{$key}, '')} {
      @if map-depth($map) > 1 {
        @include modifiers($value, $attribute, $separator);
      }
      @else {
        #{$attribute}: $value;
      }
    }
  }
}
{% endhighlight %}

And *voilà*! This mixin will work with maps of any depth. Feel free to use it in your own projects! If you like it, you can show some love by [starring it on GitHub][github:sass-modifiers-mixin]. Also, if you want to improve it, please leave a comment on the gist so I can update it 👍

[sass:maps]: http://sass-lang.com/documentation/file.SASS_REFERENCE.html#Maps
[sass:lists]: http://sass-lang.com/documentation/file.SASS_REFERENCE.html#Lists
[wiki:associative-array]: https://en.wikipedia.org/wiki/Associative_array
[sass:3.3]: http://sass-lang.com/documentation/file.SASS_CHANGELOG.html#SassScript_Maps
[hugo-giraudel]: https://hugogiraudel.com/
[github:sass-modifiers-mixin]: https://gist.github.com/sarahdayan/4d2cc04a636e8039f10a889a0e29fbd9
[sassmeister:sass-modifiers-mixin]: https://www.sassmeister.com/gist/4d2cc04a636e8039f10a889a0e29fbd9