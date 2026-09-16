
export function registerHelpers() {
    Handlebars.registerHelper(helpers);
}

const helpers = {
    "t5e-button": function (e) {
        let t = `<button type="${e.type ?? "button"}" class="${e.class ?? "form-button"}" data-action="${e.dataAction}" id="${e.id}" name="${e.name}">`;
        return e.image && (t += `<img class="button-image" src=${e.image}>`), t += '<p class="button-text"', e.tooltip && (t += `data-tooltip="${e.tooltip}"`), t += ">", e.label && (t += _loc(e.label)), e.icon && (t += `<i class="${e.icon}"></i>`), t += "</p></button>", t
    }, "t5e-selectDetailed": function (e) {
        let t = `<select id="${e.id}" name="${e.name}">`;
        return e.options.forEach((i => {
            t += `<option value="${i.value}"`, e.value === i.value && (t += " selected "), t += ">";
            let a = i.display ?? i.name;
            a && (t += _loc(a.toString())), t += "</option>"
        })), t += "</select>", (e.label || e.image) && (t += `<label for="${e.id}">`, e.image && (t += `<img class="label-image" src=${e.image}>`), e.label && (t += `<p class="label-text">${_loc(e.label?.toString())}</p>`), t += "</label>"), t
    }, "t5e-selectMultiple": function (e) {
        let t = `<multi-select id="${e.id}" name="${e.name}">`;
        return e.options.forEach((i => {
            t += `<option value="${i.value}"`, e.value.includes(i.value) && (t += " selected "), t += ">", i.name && (t += _loc(i.name?.toString())), t += "</option>"
        })), t += "</multi-select>", (e.label || e.image) && (t += `<label for="${e.id}">`, e.image && (t += `<img class="label-image" src=${e.image}>`), e.label && (t += `<p class="label-text">${_loc(e.label?.toString())}</p>`), t += "</label>"), t
    }, "t5e-contentP": function (e) {
        return `<p class=${e.class ?? "form-content"} id=${e.id} name=${e.name}>\n        ${e.value}\n        </p>\n    `
    }, "t5e-textInput": function (e) {
        let t = `<input type="text" class="${e.class}" id="${e.id}" name="${e.name}" value="${e.value}"`;
        return e.tooltip && (t += `data-tooltip="${_loc(e.tooltip)}"`), t += "></input>", e.label && (t += `<label for="${e.id}"><p class="label-text">${_loc(e.label?.toString())}</p></label>`), t
    }, "t5e-labelP": function (e) {
        return `<span class="${e.class}" id="${e.id}">${_loc(e.value?.toString())}</span>`
    }, "t5e-numberInput": function (e) {
        let t = `<input type="number" class="quick-conditions-number" id="${e.id}" name="${e.name}" value="${e.value}"`;
        return null != e.min && (t += ` min="${e.min}"`), null != e.max && (t += ` max="${e.max}"`), t += ">", t
    }, "t5e-wrapIf": function (e, t, i) {
        i || (i = t, t = null);
        const a = i.fn(this);
        if (!e) return a;
        const s = "string" == typeof t ? t : "div", o = i.hash.class ? ` class="${i.hash.class}"` : "";
        return new Handlebars.SafeString(`<${s}${o}>${a}</${s}>`)
    }
};
