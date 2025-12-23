# Velto Runtime
The runtime for Velto
---

## 🚀 Features

- Load and render `.velto` files in the browser
- XML‑style markup with custom Velto tags
- Simple tag‑to‑DOM mapping system
- Extensible architecture for future components, styling, and events
- Zero dependencies

---

## Installation
Velto is designed for no installation, running directly in the browser, so all you need to do is load the Velto runtime script, like this:

```html
<script src="https://velto-framework.github.io/cdn/velto.js"></script>
```

Then, create an `index.html` like you would a regular HTML website, and inside the body add this:

```html
<div id="app"></div>

<script src="https://velto-framework.github.io/cdn/velto.js"></script>
<script>
  renderVelto("./index.velto", "#app");
</script>
```
and make sure you have an index.velto (or whatever you called your Velto file.) You must load the Velto runtime before the Velto file.
