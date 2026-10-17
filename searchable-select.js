/**
 * SearchableSelect(container, config)
 *
 * config.options       [{ value, label }]  regular, filterable options
 * config.fixedOptions  [{ value, label, showTextInput? }]  always shown at the bottom,
 *                      below a separator line, and never filtered out
 * config.name          name of the hidden input that holds the selected value (for forms)
 * config.placeholder   placeholder text
 * config.noMatchText   text shown when the search finds no options (default: 'No matches')
 * config.textInput     element, or array of elements, to reveal when an option with showTextInput
 *                      is selected (e.g. a wrapper holding a label, a text input and help text).
 *                      Form fields inside are disabled while hidden so they are not submitted.
 * config.value         initially selected value
 * config.classes       object of Tailwind class strings that REPLACE the defaults for each part:
 *                      container, input, arrow, list, option, fixedOption, activeOption,
 *                      selectedOption, noMatch, separator (see DEFAULT_CLASSES below)
 * config.onChange      function(option)
 */
function SearchableSelect(container, config) {
  var cfg = Object.assign({ options: [], fixedOptions: [], name: '', placeholder: 'Select…',
                            noMatchText: 'No matches', textInput: null, value: null, onChange: null,
                            classes: {} }, config);

  // Default look. Anything passed in config.classes replaces the matching entry.
  var DEFAULT_CLASSES = {
    container:      'relative',
    input:          'w-full box-border mt-2 py-2 px-3 text-lg placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50 focus:outline-none',
    arrow:          'absolute right-4 top-1/2 w-2.5 h-2.5 pointer-events-none border-gray-600 border-r-2 border-b-2 -translate-y-1/2 rotate-45',
    list:           'absolute inset-x-0 top-full z-10 m-0 py-1 text-lg list-none max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-sm',
    option:         'px-2.5 py-3 cursor-pointer',
    fixedOption:    'italic',                 // added to option for fixed options
    activeOption:   'bg-blue-100',           // added to the highlighted option
    selectedOption: 'font-semibold',          // added to the selected option
    noMatch:        'px-2.5 py-3 text-gray-500',
    separator:      'h-px my-1 bg-gray-300'
  };
  var cls = Object.assign({}, DEFAULT_CLASSES, cfg.classes);

  var selected = null, isOpen = false, query = '', active = 0, items = [];
  var uid = 'ss-' + Math.random().toString(36).slice(2, 8);

  // ---- Build DOM ----
  toggleClasses(container, cls.container, true);
  var input = el('input', { type: 'text', className: cls.input, placeholder: cfg.placeholder, autocomplete: 'off', id: container.id ? container.id + '-input' : uid + '-input' });
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', uid + '-list');
  var arrow = el('span', { className: cls.arrow });
  var hidden = el('input', { type: 'hidden', name: cfg.name });
  var list = el('ul', { className: cls.list, id: uid + '-list', hidden: true });
  list.setAttribute('role', 'listbox');
  container.append(input, arrow, hidden, list);

  function el(tag, props) { return Object.assign(document.createElement(tag), props); }

  // add/remove a space-separated list of classes (classList methods reject spaces)
  function toggleClasses(node, str, on) {
    String(str || '').split(/\s+/).filter(Boolean).forEach(function (c) { node.classList.toggle(c, on); });
  }

  // ---- Rendering ----
  function filtered() {
    var q = query.trim().toLowerCase();
    if (!q) return cfg.options;
    return cfg.options
      .filter(function (o) { return o.label.toLowerCase().includes(q); })
      .sort(function (a, b) { // labels starting with the query come first
        return (b.label.toLowerCase().startsWith(q)) - (a.label.toLowerCase().startsWith(q));
      });
  }

  function render() {
    list.textContent = '';
    var matches = filtered();
    items = matches.concat(cfg.fixedOptions);

    matches.forEach(function (o, i) { list.appendChild(optionEl(o, i, false)); });
    if (query.trim() && !matches.length) list.appendChild(el('li', { className: cls.noMatch, textContent: cfg.noMatchText }));

    if (cfg.fixedOptions.length) {
      var sep = el('li', { className: cls.separator });
      sep.setAttribute('role', 'separator');
      list.appendChild(sep);
      cfg.fixedOptions.forEach(function (o, i) { list.appendChild(optionEl(o, matches.length + i, true)); });
    }
    setActive(Math.min(active, items.length - 1), false);
  }

  function optionEl(o, index, fixed) {
    var li = el('li', { className: cls.option + (fixed ? ' ' + cls.fixedOption : '') + (selected === o ? ' ' + cls.selectedOption : ''),
                        textContent: o.label, id: uid + '-opt-' + index });
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', selected === o ? 'true' : 'false');
    li.dataset.index = index;
    return li;
  }

  function setActive(i, scroll) {
    active = Math.max(0, i);
    list.querySelectorAll('[role=option]').forEach(function (li) {
      var on = +li.dataset.index === active;
      toggleClasses(li, cls.activeOption, on);
      if (on) {
        input.setAttribute('aria-activedescendant', li.id);
        if (scroll !== false) li.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // ---- Reveal targets (text input, or a wrapper with label + input + help text) ----
  function revealTargets() { return [].concat(cfg.textInput || []).filter(Boolean); }
  function fieldsIn(node) {
    var sel = 'input,select,textarea,button';
    return node.matches(sel) ? [node] : Array.prototype.slice.call(node.querySelectorAll(sel));
  }
  // show: visible or not. enabled: whether form fields inside take part in form submission.
  function setRevealed(show, enabled) {
    revealTargets().forEach(function (node) {
      node.hidden = !show;
      node.style.display = show ? '' : 'none'; // wins over classes like "flex" that would defeat [hidden]
      fieldsIn(node).forEach(function (f) { f.disabled = !enabled; });
    });
  }
  function focusRevealed() {
    var first = null;
    revealTargets().some(function (node) {
      first = fieldsIn(node).filter(function (f) { return f.type !== 'hidden' && f.type !== 'button'; })[0];
      return !!first;
    });
    if (first) first.focus();
  }

  // ---- Open / close / select ----
  function open() {
    if (isOpen) return;
    isOpen = true;
    query = '';
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.select();
    active = Math.max(0, cfg.options.concat(cfg.fixedOptions).indexOf(selected)); // start on the selected option
    render();
    setActive(active, true);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.value = selected ? selected.label : ''; // discard half-typed search text
  }

  function select(o, silent) {
    selected = o;
    hidden.value = o ? o.value : '';
    input.value = o ? o.label : '';
    var show = !!(o && o.showTextInput);
    setRevealed(show, show);
    if (show && !silent) focusRevealed();
    close();
    if (!silent && cfg.onChange) cfg.onChange(o);
    container.dispatchEvent(new CustomEvent('change', { detail: o, bubbles: true }));
  }

  // ---- Events ----
  input.addEventListener('click', open);
  input.addEventListener('focus', open);

  input.addEventListener('input', function () {
    if (!isOpen) open();
    query = input.value;
    active = 0;
    render();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!isOpen) open(); else setActive((active + 1) % items.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!isOpen) open(); else setActive((active - 1 + items.length) % items.length); }
    else if (e.key === 'Enter') { if (isOpen) { e.preventDefault(); if (items[active]) select(items[active]); } }
    else if (e.key === 'Escape') { close(); }
    else if (e.key === 'Tab') { close(); }
  });

  // mousedown (not click) so the input doesn't blur before we handle the pick
  list.addEventListener('mousedown', function (e) {
    e.preventDefault();
    var li = e.target.closest('[role=option]');
    if (li) select(items[+li.dataset.index]);
  });
  list.addEventListener('mousemove', function (e) {
    var li = e.target.closest('[role=option]');
    if (li && +li.dataset.index !== active) setActive(+li.dataset.index, false);
  });

  function onDocMouseDown(e) {
    if (!container.contains(e.target)) close();
  }
  document.addEventListener('mousedown', onDocMouseDown);

  // ---- Init ----
  setRevealed(false, false);
  if (cfg.value != null) {
    var init = cfg.options.concat(cfg.fixedOptions).find(function (o) { return o.value === cfg.value; });
    if (init) select(init, true);
  }

  // ---- Public API ----
  var api = {
    getValue: function () { return hidden.value; },
    setValue: function (v) {
      var o = cfg.options.concat(cfg.fixedOptions).find(function (x) { return x.value === v; });
      select(o || null, true);
    },
    destroy: function () {
      document.removeEventListener('mousedown', onDocMouseDown);
      container.textContent = '';
      toggleClasses(container, cls.container, false);
      delete container.searchableSelect;
      setRevealed(false, false);
    }
  };
  container.searchableSelect = api;
  return api;
}
