window.addEventListener("DOMContentLoaded", () => {
  function ensureFocusable(el) {
    if (!el) return;
    const tag = el.tagName?.toLowerCase();
    const focusableTags = ["a", "button", "input", "textarea", "select"];
    if (focusableTags.includes(tag)) return;
    if (el.getAttribute("tabindex") == null) el.setAttribute("tabindex", "0");
  }

  function getFocusables() {
    const candidates = Array.from(document.querySelectorAll(
      "a, button, input, textarea, select, [role='button'], [role='link'], [tabindex]"
    ));
    return candidates
      .filter(el => !el.disabled && el.offsetParent !== null)
      .map(el => {
        ensureFocusable(el);
        return el;
      });
  }

  function focusMove(dir) {
    const focusables = getFocusables();
    if (!focusables.length) return;

    let current = document.activeElement;
    if (!current || current === document.body) {
      focusables[0].focus();
      return;
    }

    const cr = current.getBoundingClientRect();
    const cx = cr.left + cr.width / 2;
    const cy = cr.top + cr.height / 2;

    let best = null;
    let bestScore = Infinity;

    for (const el of focusables) {
      if (el === current) continue;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;

      const dx = ex - cx;
      const dy = ey - cy;

      if (dir === "left" && dx >= 0) continue;
      if (dir === "right" && dx <= 0) continue;
      if (dir === "up" && dy >= 0) continue;
      if (dir === "down" && dy <= 0) continue;

      const dist = Math.hypot(dx, dy);
      const directionalPenalty =
        (dir === "left" || dir === "right") ? Math.abs(dy) : Math.abs(dx);

      const score = dist + directionalPenalty * 0.75;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (best) best.focus();
  }

  function pressA() {
    const el = document.activeElement;
    if (!el) return;
    el.click?.();
  }

  function pressB() {
    if (window.history.length > 1) window.history.back();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  }

  let last = { up:false, down:false, left:false, right:false, a:false, b:false };
  const DEADZONE = 0.5;
  const REPEAT_MS = 160;
  let lastMoveAt = 0;

  function poll() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && pads[0];

    if (gp) {
      const now = Date.now();

      const up = gp.buttons[12]?.pressed || gp.axes[1] < -DEADZONE;
      const down = gp.buttons[13]?.pressed || gp.axes[1] > DEADZONE;
      const left = gp.buttons[14]?.pressed || gp.axes[0] < -DEADZONE;
      const right = gp.buttons[15]?.pressed || gp.axes[0] > DEADZONE;

      const a = gp.buttons[0]?.pressed;
      const b = gp.buttons[1]?.pressed;

      const canMove = (now - lastMoveAt) > REPEAT_MS;
      if (canMove) {
        if (up && !last.up) { focusMove("up"); lastMoveAt = now; }
        else if (down && !last.down) { focusMove("down"); lastMoveAt = now; }
        else if (left && !last.left) { focusMove("left"); lastMoveAt = now; }
        else if (right && !last.right) { focusMove("right"); lastMoveAt = now; }
      }

      if (a && !last.a) pressA();
      if (b && !last.b) pressB();

      last = { up, down, left, right, a, b };
    }

    requestAnimationFrame(poll);
  }

  poll();
});

