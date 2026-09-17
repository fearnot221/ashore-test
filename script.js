const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const day1 = [
  { stage: "sun", label: "旭浪舞台", events: [
    ["12:20", "13:00", "粗大Band"],
    ["14:10", "14:50", "開獎時間"],
    ["14:50", "15:20", "脫口秀"],
    ["15:20", "16:00", "泡泡擂台"],
    ["17:00", "17:20", "趙翊帆"],
    ["17:20", "17:40", "C.Holly"],
    ["18:40", "19:20", "椅子樂團 The Chairs"],
    ["20:20", "21:00", "血肉果汁機"]
  ]},
  { stage: "shore", label: "朝岸舞台", events: [
    ["13:20", "14:00", "八青哥"],
    ["14:00", "14:20", "E1and"],
    ["14:20", "14:40", "白安"],
    ["15:30", "16:10", "庸俗救星 Vulgar Savior"],
    ["17:50", "18:30", "Who Cares 胡凱兒"],
    ["19:30", "20:10", "甜約翰 Sweet John"]
  ]},
  { stage: "hall", label: "浪汀大舞廳", events: [
    ["13:10", "13:50", "浪汀 Session"],
    ["14:50", "15:30", "草東北"],
    ["16:10", "16:30", "臣洋 CY"],
    ["16:30", "16:50", "王彥棠"],
    ["18:00", "19:00", "DJ ALAN DUST"],
    ["19:00", "20:00", "DJ EK"]
  ]}
];

const day2 = [
  { stage: "sun", label: "旭浪舞台", events: [
    ["12:40", "13:20", "無妄合作社"],
    ["14:40", "15:20", "忘憂水 WonderWater"],
    ["16:30", "17:10", "溫蒂漫步 Wendy Wander"],
    ["18:30", "19:10", "康士坦的變化球 KST"],
    ["20:20", "21:00", "怕胖團 PAPUN BAND"]
  ]},
  { stage: "shore", label: "朝岸舞台", events: [
    ["13:40", "14:20", "Crispy 脆樂團"],
    ["15:30", "16:10", "SoulFa 靈魂沙發"],
    ["17:20", "17:40", "163braces"],
    ["17:40", "18:00", "持修"],
    ["18:00", "18:20", "PIZZALI"],
    ["19:30", "19:50", "Marz23"],
    ["19:50", "20:10", "謝和弦"]
  ]},
  { stage: "hall", label: "浪汀大舞廳", events: [
    ["13:00", "13:40", "浪汀 Session"],
    ["14:20", "15:00", "日文怪物"],
    ["16:10", "16:30", "Bessy"],
    ["16:30", "16:50", "康庭瑋 Konnie"],
    ["18:00", "19:00", "DJ JILL"],
    ["19:00", "20:00", "DJ EK"]
  ]}
];

const lineupOrder = [
  "椅子樂團 The Chairs",
  "血肉果汁機",
  "怕胖團 PAPUN BAND",
  "康士坦的變化球 KST",
  "謝和弦",
  "Marz23",
  "溫蒂漫步 Wendy Wander",
  "甜約翰 Sweet John",
  "Crispy 脆樂團",
  "SoulFa 靈魂沙發",
  "無妄合作社",
  "Who Cares 胡凱兒",
  "庸俗救星 Vulgar Savior",
  "持修",
  "趙翊帆",
  "粗大Band",
  "忘憂水 WonderWater",
  "163braces",
  "C.Holly",
  "E1and",
  "白安",
  "PIZZALI",
  "八青哥",
  "DJ ALAN DUST",
  "DJ JILL",
  "DJ EK",
  "王彥棠",
  "臣洋 CY",
  "崴崴孟孟",
  "康庭瑋 Konnie",
  "童雲希"
];

const schedule = { 1: day1, 2: day2 };
const FAVORITES_KEY = "ashore-favorites-v2";

function eventId(day, stage, start, name) {
  return `${day}|${stage}|${start}|${name}`;
}

function allEvents() {
  const list = [];
  for (const day of [1, 2]) {
    for (const lane of schedule[day]) {
      for (const [start, end, name] of lane.events) {
        list.push({
          id: eventId(day, lane.stage, start, name),
          day,
          stage: lane.stage,
          label: lane.label,
          start,
          end,
          name
        });
      }
    }
  }
  return list;
}

const eventIndex = allEvents();
const eventById = new Map(eventIndex.map(event => [event.id, event]));

let favorites = loadFavorites();
let currentDay = 1;
let currentStage = "all";
let savedOnly = false;
let spotlightId = "";

function loadFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(parsed) ? new Set(parsed.filter(id => eventById?.has?.(id) ?? true)) : new Set();
  } catch {
    return new Set();
  }
}

function persistFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

function showToast(message) {
  const toast = $("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1500);
}

function renderLineup() {
  const host = $("[data-artist-grid]");
  if (!host) return;

  host.replaceChildren();

  lineupOrder.forEach(name => {
    const event = eventIndex.find(item => item.name === name);

    if (event) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "artist-chip";
      button.textContent = name;
      button.dataset.artistId = event.id;
      button.setAttribute("aria-label", `${name}，定位到 ${event.label} ${event.start}`);
      host.appendChild(button);
    } else {
      const label = document.createElement("span");
      label.className = "artist-chip";
      label.textContent = name;
      label.setAttribute("aria-disabled", "true");
      host.appendChild(label);
    }
  });

  $$("[data-artist-id]", host).forEach(button => {
    button.addEventListener("click", () => {
      const event = eventById.get(button.dataset.artistId);
      if (!event) return;

      currentDay = event.day;
      currentStage = event.stage;
      savedOnly = false;
      spotlightId = event.id;
      renderSchedule();
      syncControls();

      $("#schedule")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });

      requestAnimationFrame(() => {
        const target = document.querySelector(`[data-event-id="${CSS.escape(event.id)}"]`);
        target?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "center"
        });
      });

      showToast(`${event.start} · ${event.label}`);
    });
  });
}

function prefersReducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function filteredLanes() {
  return schedule[currentDay]
    .map(lane => ({
      ...lane,
      events: lane.events.filter(([start, , name]) => {
        if (currentStage !== "all" && lane.stage !== currentStage) return false;
        if (!savedOnly) return true;
        return favorites.has(eventId(currentDay, lane.stage, start, name));
      })
    }))
    .filter(lane => currentStage === "all" || lane.stage === currentStage)
    .filter(lane => !savedOnly || lane.events.length > 0);
}

function renderSchedule() {
  const host = $("[data-schedule-list]");
  const status = $("[data-schedule-status]");
  if (!host) return;

  host.replaceChildren();

  const lanes = filteredLanes();
  const visibleEvents = lanes.reduce((total, lane) => total + lane.events.length, 0);

  if (status) {
    const date = currentDay === 1 ? "05 / 16" : "05 / 17";
    const stageText = currentStage === "all"
      ? "全部舞台"
      : schedule[currentDay].find(lane => lane.stage === currentStage)?.label || "";
    status.textContent = `${date} · ${stageText}${savedOnly ? " · 只看收藏" : ""}`;
  }

  if (!visibleEvents) {
    const empty = document.createElement("div");
    empty.className = "schedule-empty";
    empty.textContent = savedOnly ? "這個篩選目前沒有收藏演出。" : "這個篩選沒有演出。";
    host.appendChild(empty);
    updateFavoriteCount();
    return;
  }

  lanes.forEach(lane => {
    if (!lane.events.length && savedOnly) return;

    const column = document.createElement("section");
    column.className = `stage-column ${lane.stage}`;
    column.setAttribute("aria-label", lane.label);

    const title = document.createElement("header");
    title.className = "stage-title";
    title.innerHTML = `<strong>${lane.label}</strong><span>${lane.events.length} SETS</span>`;

    const list = document.createElement("ul");
    list.className = "event-list";

    lane.events.forEach(([start, end, name]) => {
      const id = eventId(currentDay, lane.stage, start, name);
      const row = document.createElement("li");
      row.className = `event${spotlightId === id ? " spotlight" : ""}`;
      row.dataset.eventId = id;

      const time = document.createElement("time");
      time.className = "event-time";
      time.dateTime = `2026-05-${currentDay === 1 ? "16" : "17"}T${start}:00+08:00`;
      time.innerHTML = `${start}<br>${end}`;

      const eventName = document.createElement("div");
      eventName.className = "event-name";
      eventName.textContent = name;

      const fav = document.createElement("button");
      fav.type = "button";
      fav.className = `favorite${favorites.has(id) ? " active" : ""}`;
      fav.dataset.favorite = id;
      fav.setAttribute("aria-pressed", String(favorites.has(id)));
      fav.setAttribute("aria-label", favorites.has(id) ? `取消收藏 ${name}` : `收藏 ${name}`);
      fav.textContent = favorites.has(id) ? "★" : "☆";

      row.append(time, eventName, fav);
      list.appendChild(row);
    });

    column.append(title, list);
    host.appendChild(column);
  });

  $$("[data-favorite]", host).forEach(button => {
    button.addEventListener("click", () => toggleFavorite(button.dataset.favorite));
  });

  if (spotlightId) {
    clearTimeout(renderSchedule.spotlightTimer);
    renderSchedule.spotlightTimer = setTimeout(() => {
      spotlightId = "";
      $(".event.spotlight")?.classList.remove("spotlight");
    }, 2200);
  }

  updateFavoriteCount();
}

function toggleFavorite(id) {
  const event = eventById.get(id);
  if (!event) return;

  if (favorites.has(id)) {
    favorites.delete(id);
    showToast(`已取消 · ${event.name}`);
  } else {
    favorites.add(id);
    showToast(`已收藏 · ${event.name}`);
  }

  persistFavorites();
  renderSchedule();
  syncControls();
}

function updateFavoriteCount() {
  const count = $("[data-favorite-count]");
  if (count) count.textContent = String(favorites.size);
}

function syncControls() {
  $$("[data-day]").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.day) === currentDay);
  });

  $$("[data-stage]").forEach(button => {
    button.classList.toggle("active", button.dataset.stage === currentStage);
  });

  const savedButton = $("[data-saved-only]");
  if (savedButton) {
    savedButton.setAttribute("aria-pressed", String(savedOnly));
  }

  updateFavoriteCount();
}

$$("[data-day]").forEach(button => {
  button.addEventListener("click", () => {
    currentDay = Number(button.dataset.day);
    spotlightId = "";
    renderSchedule();
    syncControls();
  });
});

$$("[data-stage]").forEach(button => {
  button.addEventListener("click", () => {
    currentStage = button.dataset.stage;
    spotlightId = "";
    renderSchedule();
    syncControls();
  });
});

$("[data-saved-only]")?.addEventListener("click", () => {
  savedOnly = !savedOnly;
  spotlightId = "";
  renderSchedule();
  syncControls();
});

renderLineup();
renderSchedule();
syncControls();
