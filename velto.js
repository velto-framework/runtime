// Velto Runtime v0.4
const Velto = {
    version: "0.4",
    config: {
        strictMode: false,
        warnUnknownTags: true,
        warnUnknownAttributes: true,
        allowComments: true,
    },

    tagMap: {
        velto: "div",
        content: "div",

        // Text
        text1: "p",
        text2: "p",
        text3: "span",
        title1: "h1",
        title2: "h2",
        title3: "h3",
        caption: "small",
        code: "code",

        // Layout
        row: "div",
        column: "div",
        stack: "div",
        hstack: "div",
        vstack: "div",
        spacer: "div",
        grid: "div",
        griditem: "div",
        section: "section",
        block: "div",
        group: "div",
        panel: "div",
        surface: "div",
        container: "div",

        // Media
        image: "img",
        icon: "img",
        video: "video",
        audio: "audio",

        // Interactive
        button: "button",
        link: "a",
        input: "input",
        checkbox: "input",
        radio: "input",
        slider: "input",
        switch: "input",
        form: "form",

        // Lists
        list: "ul",
        item: "li",
        menu: "ul",
        menuitem: "li",

        // Decorative
        card: "div",
        hero: "div",
        banner: "div",
        divider: "hr",
        badge: "span",
        tag: "span",
        pill: "span",

        // Structural
        header: "header",
        footer: "footer",
        nav: "nav",
        aside: "aside",
        article: "article",
        note: "aside",
        warning: "aside",
        info: "aside",
    },

    behaviours: {
        "on-click:redirect": (el, value) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => window.location.href = value);
        },

        "on-click:alert": (el, value) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => alert(value));
        },

        "on-click:log": (el, value) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => console.log("[Velto Log]", value));
        },

        "on-click:toggle": (el, value) => {
            el.style.cursor = "pointer";
            el.addEventListener("click", () => {
                const target = document.querySelector(value);
                if (target) target.hidden = !target.hidden;
            });
        },

        "on-input:log": (el, value) => {
            el.addEventListener("input", () => console.log("[Velto Input]", value, el.value));
        }
    },

    log: (...msg) => console.log("%c[Velto]", "color:#2d5c8a;font-weight:bold;", ...msg),
    warn: (...msg) => console.warn("%c[Velto Warning]", "color:#b8860b;font-weight:bold;", ...msg),
    error: (...msg) => console.error("%c[Velto Error]", "color:#b00020;font-weight:bold;", ...msg),
};

async function renderVelto(url, mountSelector) {
    let text;
    try { text = await fetch(url).then(r => r.text()); }
    catch (err) { Velto.error("Failed to fetch Velto file:", err); return; }

    const xml = new DOMParser().parseFromString(text, "text/xml");
    if (xml.querySelector("parsererror")) { Velto.error("XML parsing error."); return; }

    const root = xml.getElementsByTagName("velto")[0];
    if (!root) { Velto.error("No <velto> root."); return; }

    const mount = document.querySelector(mountSelector);
    if (!mount) { Velto.error(`Mount '${mountSelector}' not found.`); return; }

    const dom = convertVeltoNode(root);
    mount.innerHTML = "";
    mount.appendChild(dom);
}

function convertVeltoNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType === Node.COMMENT_NODE)
        return Velto.config.allowComments ? document.createComment(node.textContent) : document.createTextNode("");

    const tag = node.tagName;
    if (!Velto.tagMap[tag] && Velto.config.warnUnknownTags)
        Velto.warn(`Unknown tag <${tag}> → <div>`);

    const el = document.createElement(mapVeltoTag(tag));

    for (const attr of node.attributes) handleVeltoAttribute(el, attr.name, attr.value);
    for (const child of node.childNodes) el.appendChild(convertVeltoNode(child));

    return el;
}

function mapVeltoTag(tag) {
    return Velto.tagMap[tag] || "div";
}

function handleVeltoAttribute(el, name, value) {
    for (const behaviour in Velto.behaviours)
        if (name.startsWith(behaviour)) return Velto.behaviours[behaviour](el, value);

    if (Velto.config.warnUnknownAttributes)
        if (!name.startsWith("on-") && !name.includes(":"))
            Velto.warn(`Unknown attribute '${name}'`);

    el.setAttribute(name, value);
}

Velto.hooks = {
    onNodeCreated: [],
    onAttributeApplied: [],
    onRenderComplete: [],
};
