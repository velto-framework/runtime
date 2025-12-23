// Velto Runtime v0.1
// Loads .velto files, parses them, and renders them into the DOM.

async function renderVelto(url, mountSelector) {
  const text = await fetch(url).then(r => r.text());
  const xml = new DOMParser().parseFromString(text, "text/xml");

  const root = xml.getElementsByTagName("velto")[0];
  if (!root) {
    console.error("Velto Runtime: No <velto> root element found.");
    return;
  }

  const dom = convertVeltoNode(root);
  const mount = document.querySelector(mountSelector);

  if (!mount) {
    console.error(`Velto Runtime: Mount point '${mountSelector}' not found.`);
    return;
  }

  mount.appendChild(dom);
}

function convertVeltoNode(node) {
  const tag = node.tagName;
  const el = document.createElement(mapVeltoTag(tag));

  // Handle text-only nodes
  if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
    el.textContent = node.textContent;
  }

  // Handle attributes
  for (const attr of node.attributes) {
    handleVeltoAttribute(el, attr.name, attr.value);
  }

  // Recursively convert children
  for (const child of node.children) {
    el.appendChild(convertVeltoNode(child));
  }

  return el;
}

function mapVeltoTag(tag) {
  const tagMap = {
    velto: "div",
    content: "div",
    text1: "p",
    text2: "p",
    button: "button",
    image: "img"
  };

  return tagMap[tag] || "div";
}

function handleVeltoAttribute(el, name, value) {
  // Behaviour attributes
  if (name.startsWith("on-click:redirect")) {
    el.addEventListener("click", () => {
      window.location.href = value;
    });
    return;
  }

  // Default: pass through as HTML attribute
  el.setAttribute(name, value);
}
