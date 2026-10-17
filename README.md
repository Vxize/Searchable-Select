# SearchableSelect

A small, reusable searchable select input built with plain HTML and vanilla JavaScript. No framework, no build step. Styled with Tailwind CSS utility classes.

## Features

- Works like a normal select: click the input to open the full list of options.
- Type to search: the list filters to matching options only (case-insensitive, "starts with" matches first).
- **Fixed options** (e.g. "None", "Other…") always appear at the bottom, below a separator line, and are never filtered out.
- Selecting an option can **reveal a hidden text input** (e.g. "Other…" → "Please specify…"), and hide it again when another option is picked.
- Customizable "no match" text.
- Customizable look: pass your own Tailwind classes per instance.
- Keyboard support and ARIA combobox attributes.
- Works inside a regular `<form>` (a hidden input holds the selected value).

## Setup

1. Include Tailwind CSS (the demo uses the Play CDN; use a built stylesheet in production):

   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   ```

2. Copy the `SearchableSelect` function from `searchable-select.html` into your page or your own `.js` file.

3. Add an empty container, and call the function:

   ```html
   <label for="country-input">Country</label>
   <div id="country"></div>

   <script>
     SearchableSelect(document.getElementById('country'), {
       name: 'country',
       options: [
         { value: 'fr', label: 'France' },
         { value: 'de', label: 'Germany' },
         { value: 'jp', label: 'Japan' }
       ]
     });
   </script>
   ```

   The visible input gets the id `<container id>-input` (here `country-input`), so a `<label for="...">` works as expected.

## Usage

```js
SearchableSelect(container, config)
```

- `container` — an empty element the component is built inside.
- `config` — an object (see below).
- Returns an API object with `getValue()`, `setValue(value)` and `destroy()`. The same object is available as `container.searchableSelect`.

## Config

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `Array<{ value, label, showTextInput? }>` | `[]` | Regular options. These are filtered when the user types. |
| `fixedOptions` | `Array<{ value, label, showTextInput? }>` | `[]` | Options always shown at the bottom, below a separator, regardless of the search text. |
| `name` | `string` | `''` | Name of the hidden input that holds the selected value, used when the form is submitted. |
| `placeholder` | `string` | `'Select…'` | Placeholder of the visible input. |
| `noMatchText` | `string` | `'No matches'` | Text shown when the search finds no regular options. Shown as plain text. |
| `textInput` | `HTMLElement` or `HTMLElement[]` | `null` | What to reveal when an option with `showTextInput: true` is selected. A single text input, a wrapper element (label + input + help text), or an array of elements. See [example 4](#4-reveal-a-label-input-and-help-text-together). |
| `value` | `string` | `null` | `value` of the option to select initially. |
| `onChange` | `function(option)` | `null` | Called when the user selects an option. |
| `classes` | `object` | `{}` | Tailwind class strings that replace the default look of each part. See [Customizing the look](#customizing-the-look). |

### Option objects

```js
{ value: 'other', label: 'Other…', showTextInput: true }
```

- `value` — the string submitted with the form. Keep values unique across `options` and `fixedOptions`.
- `label` — the text shown in the list and in the input.
- `showTextInput` — optional. When `true`, selecting this option shows the element(s) passed as `textInput`.

## Customizing the look

Pass a `classes` object to style each part of the component. Every key is a string of Tailwind classes that **replaces** the default for that part. Keys you leave out keep their defaults.

| Key | Applies to | Default |
| --- | --- | --- |
| `container` | The container element you pass in | `relative` |
| `input` | The visible text input | `w-full box-border mt-2 py-2 px-3 text-lg placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 focus:outline-none` |
| `arrow` | The dropdown arrow | `absolute right-4 top-1/2 w-2.5 h-2.5 pointer-events-none border-gray-600 border-r-2 border-b-2 -translate-y-1/2 rotate-45` |
| `list` | The dropdown list | `absolute inset-x-0 top-full z-10 m-0 py-1 text-lg list-none max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-sm` |
| `option` | Every option | `px-2.5 py-3 cursor-pointer` |
| `fixedOption` | Added to `option` for fixed options | `italic` |
| `activeOption` | Added to the highlighted option (hover / arrow keys) | `bg-blue-100` |
| `selectedOption` | Added to the currently selected option | `font-semibold` |
| `noMatch` | The "no match" row | `px-2.5 py-3 text-gray-500` |
| `separator` | The line above the fixed options | `h-px my-1 bg-gray-300` |

### Example: dark theme

```js
SearchableSelect(document.getElementById('country'), {
  options: countries,
  fixedOptions: [{ value: 'none', label: 'None' }],
  classes: {
    input:        'w-full box-border py-2 pr-8 pl-3 rounded-md bg-slate-800 text-white border border-slate-600 cursor-pointer focus:outline focus:outline-2 focus:outline-sky-400 focus:-outline-offset-1 focus:cursor-text',
    arrow:        'absolute right-3 top-1/2 w-[7px] h-[7px] pointer-events-none border-slate-300 border-r-2 border-b-2 -translate-y-[70%] rotate-45',
    list:         'absolute inset-x-0 top-[calc(100%+4px)] z-10 m-0 py-1 list-none max-h-[260px] overflow-y-auto bg-slate-800 text-white border border-slate-600 rounded-md shadow-lg',
    option:       'px-3 py-[7px] cursor-pointer',
    activeOption: 'bg-slate-700',
    noMatch:      'px-3 py-[7px] text-slate-400',
    separator:    'h-px my-1 bg-slate-600'
  }
});
```

### Example: pill shape (change only what you need)

Because each key replaces its default, copy the default string from the table and edit it.

```js
SearchableSelect(document.getElementById('country'), {
  options: countries,
  classes: {
    input: 'w-full box-border py-2 pr-8 pl-4 border border-[#aaa] rounded-full bg-white cursor-pointer focus:outline focus:outline-2 focus:outline-[#2563eb] focus:-outline-offset-1 focus:cursor-text',
    list:  'absolute inset-x-0 top-[calc(100%+4px)] z-10 m-0 py-1 list-none max-h-[260px] overflow-y-auto bg-white border border-[#aaa] rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,.15)]'
  }
});
```

### Example: share one theme between several selects

```js
var darkTheme = { input: '...', list: '...', option: '...', activeOption: 'bg-slate-700' };

SearchableSelect(document.getElementById('country'), { options: countries, classes: darkTheme });
SearchableSelect(document.getElementById('city'),    { options: cities,    classes: darkTheme });
```

### Tips

- **Keep the structural classes.** The list is positioned absolutely under the container, so `container` should keep a position class (such as `relative`) and `list` should keep `absolute`, `inset-x-0` and a `top-*` value.
- **Put colors in the right key.** `activeOption` and `selectedOption` are added on top of `option`, so avoid setting a background in `option` if you want `activeOption`'s background to show. Tailwind resolves conflicting classes by stylesheet order, not by their order in the string.
- **Built Tailwind setup.** Classes passed from your own code must be visible to Tailwind's content scanning, or they will be purged. The Play CDN picks them up automatically.

## API

```js
var select = SearchableSelect(container, config);

select.getValue();        // 'fr' (or '' if nothing is selected)
select.setValue('de');    // select an option by value
select.setValue(null);    // clear the selection (an unknown value also clears it)
select.destroy();         // remove the component (see below)
```

`setValue` does not call `onChange` and does not move focus to the text input.

### destroy()

Removes the `document`-level listener the component added, empties the container and deletes `container.searchableSelect`. Call it before you remove or re-render the container (e.g. in a single-page app, or when closing a modal) so listeners do not pile up. After `destroy()`, the linked `textInput` element(s) are left hidden and their fields enabled, and the instance should not be used again. Create a new one if needed.

## Events

A `change` event is dispatched on the container every time the selection changes (including via `setValue`). The selected option is in `event.detail` (`null` when cleared).

```js
container.addEventListener('change', function (e) {
  console.log(e.detail); // { value: 'fr', label: 'France' }
});
```

## Examples

### 1. Basic select

```html
<div id="fruit"></div>

<script>
  SearchableSelect(document.getElementById('fruit'), {
    name: 'fruit',
    placeholder: 'Pick a fruit…',
    options: [
      { value: 'apple',  label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' }
    ]
  });
</script>
```

### 2. Fixed "None" and "Other" options

Typing `ap` shows only "Apple", followed by a separator and the two fixed options.

```js
SearchableSelect(document.getElementById('fruit'), {
  name: 'fruit',
  options: [
    { value: 'apple',  label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' }
  ],
  fixedOptions: [
    { value: 'none',  label: 'None' },
    { value: 'other', label: 'Other…' }
  ]
});
```

### 3. Reveal a text input when "Other" is selected

The text input is hidden (and disabled, so it is not submitted) until an option with `showTextInput: true` is selected.

```html
<label for="fruit-input">Favorite fruit</label>
<div id="fruit"></div>
<input type="text" id="fruit-other" name="fruit_other"
       placeholder="Please specify…"
       class="w-full box-border px-2.5 py-2 mt-2 border border-[#aaa] rounded-md">

<script>
  SearchableSelect(document.getElementById('fruit'), {
    name: 'fruit',
    options: [
      { value: 'apple',  label: 'Apple' },
      { value: 'banana', label: 'Banana' }
    ],
    fixedOptions: [
      { value: 'none',  label: 'None' },
      { value: 'other', label: 'Other…', showTextInput: true }
    ],
    textInput: document.getElementById('fruit-other')
  });
</script>
```

You do not need to add the `hidden` attribute yourself. The component hides the text input on startup.

### 4. Reveal a label, input and help text together

`textInput` can be a wrapper element or an array of elements. Everything is shown and hidden at the same time, and form fields inside are disabled while hidden so they are not submitted. When revealed, the first field inside gets focus.

Wrapper (recommended):

```html
<div id="country"></div>

<div id="other-group" class="mt-2">
  <label for="country-other" class="block font-semibold">Other country</label>
  <input type="text" id="country-other" name="country_other"
         class="w-full box-border px-2.5 py-2 border border-[#aaa] rounded-md">
  <p class="text-sm text-gray-500">Enter the full country name.</p>
</div>

<script>
  SearchableSelect(document.getElementById('country'), {
    name: 'country',
    options: countries,
    fixedOptions: [{ value: 'other', label: 'Other…', showTextInput: true }],
    textInput: document.getElementById('other-group')
  });
</script>
```

Or an array, when the elements are not next to each other:

```js
textInput: [
  document.getElementById('other-label'),
  document.getElementById('country-other'),
  document.getElementById('other-help')
]
```

Classes like `flex` or `grid` on the wrapper are fine. The component hides it with an inline `display: none`, which overrides them.

### 5. Custom "no match" text

```js
SearchableSelect(document.getElementById('country'), {
  options: countries,
  noMatchText: 'No countries found'
});
```

### 6. Preselected value

```js
SearchableSelect(document.getElementById('country'), {
  name: 'country',
  options: [
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' }
  ],
  value: 'de'   // "Germany" is selected on load
});
```

### 7. React to changes

```js
SearchableSelect(document.getElementById('country'), {
  options: countries,
  onChange: function (option) {
    console.log('Selected:', option.value, option.label);
  }
});

// or listen for the DOM event
document.getElementById('country').addEventListener('change', function (e) {
  console.log(e.detail);
});
```

### 8. Using it in a form

```html
<form id="my-form">
  <div id="country"></div>
  <input type="text" id="country-other" name="country_other" placeholder="Please specify…">
  <button type="submit">Submit</button>
</form>

<script>
  SearchableSelect(document.getElementById('country'), {
    name: 'country',
    options: countries,
    fixedOptions: [
      { value: 'none',  label: 'None' },
      { value: 'other', label: 'Other…', showTextInput: true }
    ],
    textInput: document.getElementById('country-other')
  });

  document.getElementById('my-form').addEventListener('submit', function (e) {
    e.preventDefault();
    console.log(Object.fromEntries(new FormData(e.target)));
    // { country: 'other', country_other: 'Atlantis' }
  });
</script>
```

### 9. Multiple instances on one page

Call the function once per container. Each instance keeps its own state.

```js
SearchableSelect(document.getElementById('country'), { name: 'country', options: countries });
SearchableSelect(document.getElementById('city'),    { name: 'city',    options: cities });
```

### 10. Read or set the value from code

```js
var select = SearchableSelect(document.getElementById('country'), { name: 'country', options: countries });

select.setValue('fr');
console.log(select.getValue()); // 'fr'

// the API is also stored on the container
document.getElementById('country').searchableSelect.setValue(null);
```

### 11. Clean up when removing the select

```js
var select = SearchableSelect(document.getElementById('country'), { name: 'country', options: countries });

// later, before removing or re-rendering the container
select.destroy();
```

### 12. Build options from an array of strings

```js
var options = ['Red', 'Green', 'Blue'].map(function (c) {
  return { value: c.toLowerCase(), label: c };
});

SearchableSelect(document.getElementById('color'), { name: 'color', options: options });
```

## Behavior

| Action | Result |
| --- | --- |
| Click or focus the input | Opens the full list. The current selection is highlighted. |
| Type | Filters regular options. Fixed options stay at the bottom under a separator. |
| `↓` / `↑` | Move the highlight (opens the list if closed). |
| `Enter` | Select the highlighted option. |
| `Esc` or `Tab` | Close the list. |
| Click outside | Close the list. Unsent search text is discarded and the input shows the selected label again. |

## Notes

- The component sets `role="combobox"`, `aria-expanded`, `aria-controls` and `aria-activedescendant` on the input, and `role="listbox"` / `role="option"` on the list.
- Tailwind classes are applied from JavaScript. If you use a built Tailwind setup rather than the CDN, make sure your content configuration includes the file containing the `SearchableSelect` function so the classes are not purged.
- Each instance adds one `mousedown` listener on `document` (used to close the list on outside clicks). Call `destroy()` when you remove an instance from the page.
- Options with `showTextInput: true` do nothing unless `textInput` is provided.
- Inside a revealed wrapper, all `input`, `select`, `textarea` and `button` elements are enabled and disabled together with it.
