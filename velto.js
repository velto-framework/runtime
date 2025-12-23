// ======================================================================
// Velto Runtime v0.3
// A significantly expanded version of the original v0.1 runtime.
// Handles parsing, validation, tag mapping, attribute behaviours,
// lifecycle hooks, error reporting, and DOM rendering.
// ======================================================================

// ----------------------------------------------------------------------
// Runtime Metadata
// ----------------------------------------------------------------------
const Velto = {
    version: "0.3",
    config: {
        strictMode: false, // future: enforce strict tag/attribute rules
        warnUnknownTags: true,
        warnUnknownAttributes: true,
        allowComments: true,
    },

    // Built‑in Velto tags
    tagMap: {
        velto: "div",
        content: "div",
        text1: "p",
        text2: "p",
        button: "button",
        image: "img",
    },

    // Built‑in behaviour attributes
    behaviours: {
        "on-click:redirect": (el, value) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => {
                window.location.href = value;
            });
        },

        "on-click:alert": (el, value) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => {
                alert(value);
            });
        },

        "on-click:log": (el, value) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => {
                console.log("[Velto Log]", value);
            });
        }
    },

    // Logging utilities
    log: (...msg) => console.log("%c[Velto]", "color:#2d5c8a;font-weight:bold;", ...msg),
    warn: (...msg) => console.warn("%c[Velto Warning]", "color:#b8860b;font-weight:bold;", ...msg),
    error: (...msg) => console.error("%c[Velto Error]", "color:#b00020;font-weight:bold;", ...msg),
};

// ----------------------------------------------------------------------
// Public API: renderVelto()
// ----------------------------------------------------------------------
async function renderVelto(url, mountSelector) {
    Velto.log(`Loading Velto file: ${url}`);

    let text;
    try {
        text = await fetch(url).then(r => r.text());
    } catch (err) {
        Velto.error("Failed to fetch Velto file:", err);
        return;
    }

    const xml = new DOMParser().parseFromString(text, "text/xml");

    // Detect XML parsing errors
    if (xml.querySelector("parsererror")) {
        Velto.error("XML parsing error in Velto file.");
        return;
    }

    const root = xml.getElementsByTagName("velto")[0];
    if (!root) {
        Velto.error("No <velto> root element found.");
        return;
    }

    const mount = document.querySelector(mountSelector);
    if (!mount) {
        Velto.error(`Mount point '${mountSelector}' not found.`);
        return;
    }

    // Convert Velto → DOM
    const dom = convertVeltoNode(root);

    // Clear mount point before rendering
    mount.innerHTML = "";
    mount.appendChild(dom);

    Velto.log("Render complete.");
}

// ----------------------------------------------------------------------
// Node Conversion
// ----------------------------------------------------------------------
function convertVeltoNode(node) {
    // Handle text nodes
    if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent);
    }

    // Handle comments
    if (node.nodeType === Node.COMMENT_NODE) {
        return Velto.config.allowComments
            ? document.createComment(node.textContent)
            : document.createTextNode("");
    }

    const tag = node.tagName;

    // Warn about unknown tags
    if (!Velto.tagMap[tag] && Velto.config.warnUnknownTags) {
        Velto.warn(`Unknown Velto tag <${tag}>. Rendering as <div>.`);
    }

    const el = document.createElement(mapVeltoTag(tag));

    // Apply attributes
    for (const attr of node.attributes) {
        handleVeltoAttribute(el, attr.name, attr.value);
    }

    // Recursively convert children
    for (const child of node.childNodes) {
        el.appendChild(convertVeltoNode(child));
    }

    return el;
}

// ----------------------------------------------------------------------
// Tag Mapping
// ----------------------------------------------------------------------
function mapVeltoTag(tag) {
    return Velto.tagMap[tag] || "div";
}

// ----------------------------------------------------------------------
// Attribute Handling
// ----------------------------------------------------------------------
function handleVeltoAttribute(el, name, value) {
    // Behaviour attributes
    for (const behaviour in Velto.behaviours) {
        if (name.startsWith(behaviour)) {
            Velto.behaviours[behaviour](el, value);
            return;
        }
    }

    // Unknown attribute warning
    if (Velto.config.warnUnknownAttributes) {
        if (!name.startsWith("on-") && !name.includes(":")) {
            Velto.warn(`Unknown attribute '${name}' passed through to DOM.`);
        }
    }

    // Default: pass through as HTML attribute
    el.setAttribute(name, value);
}

// ----------------------------------------------------------------------
// Future Expansion Hooks (not yet used)
// ----------------------------------------------------------------------
Velto.hooks = {
    onNodeCreated: [],   // called after a DOM node is created
    onAttributeApplied: [], // called after an attribute is applied
    onRenderComplete: [], // called after full render
};

// These hooks will be used in Velto v0.4+
// ----------------------------------------------------------------------
