/* Chromalect semantic-expression grammar v0.1: deterministic display and validation.
   Syntax checking does not validate any claim about a word's actual meaning. */
(() => {
  "use strict";

  const roles = Object.freeze([
    ["agent", "A"], ["patient", "P"], ["goal", "G"],
    ["source", "S"], ["instrument", "I"]
  ]);
  const own = (x, k) => Object.prototype.hasOwnProperty.call(x, k);

  function checkKeys(value, required, optional = []) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError("Expected expression object");
    }
    for (const key of required) {
      if (!own(value, key)) throw new TypeError("Missing expression field: " + key);
    }
    const allowed = new Set([...required, ...optional]);
    for (const key of Object.keys(value)) {
      if (!allowed.has(key)) throw new TypeError("Unexpected expression field: " + key);
    }
  }

  function validate(value) {
    checkKeys(value, ["kind"], ["emoji", "items", "property", "head",
      "from", "to", "predicate", "roles", "value"]);
    switch (value.kind) {
      case "atom":
        checkKeys(value, ["kind", "emoji"]);
        // Unicode keycaps and flags are valid emoji sequences even though
        // their individual code points are not Extended_Pictographic.
        if (typeof value.emoji !== "string" ||
            !(/\p{Extended_Pictographic}|[0-9#*]\uFE0F?\u20E3|\p{Regional_Indicator}{2}/u.test(value.emoji)) ||
            /[A-Za-z\s]/.test(value.emoji)) {
          throw new TypeError("An atom must be an emoji token");
        }
        return true;
      case "associate":
      case "and":
        checkKeys(value, ["kind", "items"]);
        if (!Array.isArray(value.items) || value.items.length < 2) {
          throw new TypeError("Associations and conjunctions require at least two operands");
        }
        value.items.forEach(validate);
        return true;
      case "qualify":
        checkKeys(value, ["kind", "property", "head"]);
        validate(value.property);
        validate(value.head);
        return true;
      case "change":
        checkKeys(value, ["kind", "from", "to"]);
        validate(value.from);
        validate(value.to);
        return true;
      case "event":
        checkKeys(value, ["kind", "predicate"], ["roles"]);
        validate(value.predicate);
        if (!["atom", "associate", "change", "qualify"].includes(value.predicate.kind)) {
          throw new TypeError("Event predicates must describe one action or process cue");
        }
        if (own(value, "roles")) {
          checkKeys(value.roles, [], roles.map(x => x[0]));
          if (Object.keys(value.roles).length === 0) {
            throw new TypeError("Empty participant roles must be omitted");
          }
          Object.values(value.roles).forEach(validate);
        }
        return true;
      case "not":
        checkKeys(value, ["kind", "value"]);
        validate(value.value);
        return true;
      default:
        throw new TypeError("Unknown semantic operator: " + String(value.kind));
    }
  }

  const op = text => ({ text, kind: "operator" });
  const emoji = text => ({ text, kind: "emoji" });

  function inner(value) {
    const nest = child => child.kind === "atom"
      ? inner(child)
      : [op("("), ...inner(child), op(")")];
    const separated = (items, separator) => {
      const result = [];
      items.forEach((item, i) => {
        if (i > 0) result.push(op(separator));
        result.push(...nest(item));
      });
      return result;
    };
    switch (value.kind) {
      case "atom": return [emoji(value.emoji)];
      case "associate": return separated(value.items, " ∼ ");
      case "and": return separated(value.items, " + ");
      case "qualify": return [...nest(value.property), op(" · "), ...nest(value.head)];
      case "change": return [...nest(value.from), op(" ⇒ "), ...nest(value.to)];
      case "event": {
        const result = [op("▶"), ...nest(value.predicate)];
        if (value.roles) {
          result.push(op("⟨"));
          let count = 0;
          for (const [name, label] of roles) {
            if (!own(value.roles, name)) continue;
            if (count++ > 0) result.push(op(","));
            result.push(op(label + ":"), ...nest(value.roles[name]));
          }
          result.push(op("⟩"));
        }
        return result;
      }
      case "not": return [op("¬("), ...inner(value.value), op(")")];
      default: throw new TypeError("Unknown semantic operator");
    }
  }

  function parts(value) {
    if (value == null) return [];
    validate(value);
    return inner(value);
  }

  function display(value) {
    return parts(value).map(x => x.text).join("");
  }

  // Primary display is emoji-only. Typed JSON is authoritative:
  // the compact pictogram sequence cannot reconstruct every relation.
  function emojiParts(value) {
    if (value == null) return [];
    validate(value);
    function flatten(expr) {
      switch (expr.kind) {
        case "atom": return [emoji(expr.emoji)];
        case "associate":
        case "and": return expr.items.flatMap(flatten);
        case "qualify": return [...flatten(expr.property), ...flatten(expr.head)];
        case "change": return [...flatten(expr.from), emoji("➡️"), ...flatten(expr.to)];
        case "event": {
          const r = expr.roles || {};
          // Ordered for legibility; roles remain explicit in the JSON.
          return [
            ...(r.agent ? flatten(r.agent) : []),
            ...(r.source ? flatten(r.source) : []),
            ...flatten(expr.predicate),
            ...(r.patient ? flatten(r.patient) : []),
            ...(r.goal ? flatten(r.goal) : []),
            ...(r.instrument ? flatten(r.instrument) : [])
          ];
        }
        case "not": return [emoji("🚫"), ...flatten(expr.value)];
        default: throw new TypeError("Unknown semantic operator");
      }
    }
    return flatten(value);
  }
  function emojiDisplay(value) {
    return emojiParts(value).map(x => x.text).join("");
  }
  globalThis.ChromalectSemanticGrammar = Object.freeze({
    version: "0.1.0", validate, parts, display, emojiParts, emojiDisplay
  });
})();
