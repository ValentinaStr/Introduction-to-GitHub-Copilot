```javascript
// Minimal participants renderer:
// - Looks for .activity-card elements
// - Reads JSON from `data-participants` or a fallback `participantsMap` keyed by `data-activity-id`
// - Renders a .participants block (header, count, toggle, list of chips)
// - Adds toggle behavior to add/remove the "collapsed" class

(function () {
  // Fallback participants data (only used when .activity-card has no data-participants)
  const participantsMap = {
    // Example:
    // "activity-1": [{ name: "Alice Lee", avatarUrl: "" }, { name: "Bob Smith" }],
  };

  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] || "") + (parts[1] ? parts[1][0] : "");
  }

  function parseParticipantsFromAttr(el) {
    const json = el.getAttribute("data-participants");
    if (!json) return null;
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore parse errors
    }
    return null;
  }

  function buildParticipantsBlock(participants) {
    const container = document.createElement("div");
    container.className = "participants";

    const header = document.createElement("div");
    header.className = "participants-header";

    const title = document.createElement("div");
    title.className = "participants-title";
    title.textContent = "Participants";

    const count = document.createElement("div");
    count.className = "participants-count";
    count.textContent = String(participants.length);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "participants-toggle";
    toggle.textContent = "Hide";

    header.appendChild(title);
    header.appendChild(count);
    header.appendChild(toggle);

    const list = document.createElement("ul");
    list.className = "participants-list";

    participants.forEach((p) => {
      const li = document.createElement("li");

      const avatar = document.createElement("span");
      avatar.className = "participant-avatar";
      if (p.avatarUrl) {
        const img = document.createElement("img");
        img.src = p.avatarUrl;
        img.alt = p.name || "avatar";
        avatar.appendChild(img);
      } else {
        avatar.textContent = getInitials(p.name || "");
      }

      const name = document.createElement("span");
      name.className = "participant-name";
      name.textContent = p.name || "Unknown";

      li.appendChild(avatar);
      li.appendChild(name);
      list.appendChild(li);
    });

    container.appendChild(header);
    container.appendChild(list);

    // start expanded; toggle will switch collapsed state
    container.classList.remove("collapsed");

    toggle.addEventListener("click", () => {
      const isCollapsed = container.classList.toggle("collapsed");
      toggle.textContent = isCollapsed ? "Show" : "Hide";
      // update accessible label
      toggle.setAttribute("aria-expanded", String(!isCollapsed));
    });

    return container;
  }

  function initParticipants() {
    const cards = document.querySelectorAll(".activity-card");
    cards.forEach((card) => {
      // skip if already has participants block
      if (card.querySelector(".participants")) return;

      let participants = parseParticipantsFromAttr(card);
      if (!participants) {
        const id = card.getAttribute("data-activity-id");
        participants = id && participantsMap[id] ? participantsMap[id] : [];
      }

      // If no participants, optionally skip rendering (or render empty state)
      if (!participants || participants.length === 0) {
        // render a subtle info row instead of empty list
        const info = document.createElement("div");
        info.className = "participants";
        info.innerHTML = '<div class="participants-header"><div class="participants-title">Participants</div><div class="participants-count">0</div></div><div class="participants-list" style="margin-top:8px;color:#666;font-size:13px">No one signed up yet</div>';
        card.appendChild(info);
        return;
      }

      const block = buildParticipantsBlock(participants);
      card.appendChild(block);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initParticipants);
  } else {
    initParticipants();
  }
})();
```