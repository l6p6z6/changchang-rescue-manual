(() => {
  const STORAGE_KEY = "changchang-water-diary-v1";
  const DAY_TARGETS = { 1: 1000, 2: 1000, 3: 1000, 4: 1250, 5: 1500, 6: 1625, 7: 1750, 8: 1875, 9: 2000 };
  const STORIES = window.STORY_DATA.story;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const els = {
    waterForm: $("#waterForm"),
    waterAmount: $("#waterAmount"),
    bottleVisual: $("#bottleVisual"),
    bottleWater: $("#bottleWater"),
    todayAmount: $("#todayAmount"),
    todayTarget: $("#todayTarget"),
    progressCaption: $("#progressCaption"),
    todayPercent: $("#todayPercent"),
    dayPill: $("#dayPill"),
    progressBar: $("#progressBar"),
    progressFill: $("#progressFill"),
    todayStat: $("#todayStat"),
    totalStat: $("#totalStat"),
    streakStat: $("#streakStat"),
    capNote: $("#capNote"),
    storyTimeline: $("#storyTimeline"),
    unlockedCount: $("#unlockedCount"),
    storyCount: $("#storyCount"),
    streakLabel: $("#streakLabel"),
    recordsList: $("#recordsList"),
    emptyRecords: $("#emptyRecords"),
    toast: $("#toast"),
    confettiLayer: $("#confettiLayer"),
    clearTodayButton: $("#clearTodayButton"),
    resetButton: $("#resetButton"),
    exportButton: $("#exportButton"),
    importInput: $("#importInput"),
    scrollStoryButton: $("#scrollStoryButton")
  };

  let expandedStoryIds = new Set();
  let toastTimer = null;

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function dateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function parseDateKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function dayDiff(fromKey, toKey) {
    const a = parseDateKey(fromKey);
    const b = parseDateKey(toKey);
    return Math.round((b - a) / 86400000);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatMl(value) {
    const n = Math.max(0, Math.round(Number(value) || 0));
    return `${n.toLocaleString("zh-CN")} ml`;
  }

  function createSession(day) {
    const today = dateKey();
    return { day, date: today, attemptId: uid(), total: 0, completedAt: null };
  }

  function initialState() {
    const today = dateKey();
    const sessions = {};
    for (let day = 1; day <= 9; day += 1) sessions[day] = createSession(day);
    sessions[1].date = today;
    return {
      version: 1,
      startDate: today,
      lastOpenedDate: today,
      currentDay: 1,
      sessions,
      entries: [],
      unlockedStory: [0],
      completedDates: []
    };
  }

  function normalizeState(candidate) {
    const fresh = initialState();
    const state = candidate && typeof candidate === "object" ? candidate : {};
    const normalized = {
      ...fresh,
      ...state,
      sessions: {},
      entries: Array.isArray(state.entries) ? state.entries : [],
      unlockedStory: Array.isArray(state.unlockedStory) ? state.unlockedStory : [0],
      completedDates: Array.isArray(state.completedDates) ? state.completedDates : []
    };

    normalized.currentDay = Math.min(9, Math.max(1, Number(state.currentDay) || 1));
    normalized.startDate = typeof state.startDate === "string" ? state.startDate : fresh.startDate;
    normalized.lastOpenedDate = typeof state.lastOpenedDate === "string" ? state.lastOpenedDate : fresh.lastOpenedDate;

    for (let day = 1; day <= 9; day += 1) {
      const saved = state.sessions && state.sessions[day] ? state.sessions[day] : {};
      normalized.sessions[day] = {
        day,
        date: typeof saved.date === "string" ? saved.date : (day === normalized.currentDay ? dateKey() : ""),
        attemptId: typeof saved.attemptId === "string" ? saved.attemptId : uid(),
        total: Math.max(0, Math.round(Number(saved.total) || 0)),
        completedAt: typeof saved.completedAt === "string" ? saved.completedAt : null
      };
    }

    normalized.entries = normalized.entries
      .filter((entry) => entry && Number.isFinite(Number(entry.amount)) && Number(entry.amount) > 0)
      .map((entry) => ({
        id: typeof entry.id === "string" ? entry.id : uid(),
        amount: Math.round(Number(entry.amount)),
        timestamp: typeof entry.timestamp === "string" ? entry.timestamp : new Date().toISOString(),
        date: typeof entry.date === "string" ? entry.date : dateKey(new Date(entry.timestamp || Date.now())).slice(0, 10),
        day: Math.min(9, Math.max(1, Number(entry.day) || 1)),
        attemptId: typeof entry.attemptId === "string" ? entry.attemptId : normalized.sessions[1].attemptId
      }));

    normalized.unlockedStory = Array.from(new Set(normalized.unlockedStory.map(Number)))
      .filter((id) => Number.isInteger(id) && id >= 0 && id < STORIES.length)
      .sort((a, b) => a - b);
    if (!normalized.unlockedStory.includes(0)) normalized.unlockedStory.unshift(0);

    return normalized;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normalizeState(raw ? JSON.parse(raw) : initialState());
    } catch (error) {
      console.warn("读取本地记录失败，已使用新记录。", error);
      return initialState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("保存本地记录失败。", error);
      showToast("浏览器暂时无法保存，请先导出备份。", 3200);
    }
  }

  function syncForToday() {
    const today = dateKey();
    if (state.lastOpenedDate === today) return false;

    const session = state.sessions[state.currentDay];
    const wasCompleted = Boolean(session.completedAt) && session.total >= DAY_TARGETS[state.currentDay];

    if (wasCompleted && state.currentDay < 9) {
      state.currentDay += 1;
      state.sessions[state.currentDay] = createSession(state.currentDay);
    } else if (!wasCompleted) {
      session.date = today;
      session.attemptId = uid();
      session.total = 0;
      session.completedAt = null;
    }

    state.lastOpenedDate = today;
    saveState();
    return true;
  }

  function getTotalMl() {
    return state.entries.reduce((sum, entry) => sum + entry.amount, 0);
  }

  function getCurrentSession() {
    return state.sessions[state.currentDay];
  }

  function getTodayEntries() {
    const session = getCurrentSession();
    return state.entries
      .filter((entry) => entry.attemptId === session.attemptId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function isStoryUnlocked(story) {
    if (story.threshold === 0) return true;
    if (story.day < state.currentDay) return true;
    if (story.day > state.currentDay) return false;
    return getCurrentSession().total >= story.threshold;
  }

  function syncStoryUnlocks() {
    const newlyUnlocked = [];
    for (const story of STORIES) {
      if (isStoryUnlocked(story) && !state.unlockedStory.includes(story.id)) {
        state.unlockedStory.push(story.id);
        newlyUnlocked.push(story.id);
      }
    }
    state.unlockedStory.sort((a, b) => a - b);
    return newlyUnlocked;
  }

  function calculateStreak() {
    if (!state.completedDates.length) return 0;
    const completed = new Set(state.completedDates);
    let cursor = new Date();
    if (!completed.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (completed.has(dateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function render() {
    const session = getCurrentSession();
    const target = DAY_TARGETS[state.currentDay];
    const total = getTotalMl();
    const percent = Math.min(100, Math.round((session.total / target) * 100));
    const remaining = Math.max(0, target - session.total);
    const overflow = Math.max(0, session.total - target);

    els.todayAmount.textContent = session.total.toLocaleString("zh-CN");
    els.todayTarget.textContent = formatMl(target);
    els.todayPercent.textContent = `${percent}%`;
    els.dayPill.textContent = `DAY ${state.currentDay} / 9`;
    els.todayStat.textContent = formatMl(session.total);
    els.totalStat.textContent = formatMl(total);
    els.streakStat.textContent = `${calculateStreak()} 天`;
    els.streakLabel.textContent = `水灵救援 · 第 ${state.currentDay} 天`;
    els.progressBar.setAttribute("aria-valuenow", String(percent));
    els.progressFill.style.width = `${percent}%`;
    els.bottleWater.style.inset = `${100 - percent}% 0 0`;
    els.bottleVisual.setAttribute("aria-label", `今日已完成 ${percent}%`);

    if (percent >= 100) {
      els.progressCaption.textContent = overflow > 0
        ? `今天的水灵已经满格，超出 ${overflow.toLocaleString("zh-CN")} ml 已累加进总水量；剧情不会越过今天的上限。`
        : "今天的水灵已经满格，明天醒来会继续下一页。";
      els.capNote.textContent = "今天已达到剧情上限；还可以继续记水，超出部分只累加总喝水量。";
    } else {
      els.progressCaption.textContent = `还差 ${remaining.toLocaleString("zh-CN")} ml，下一页救援剧情正在发光。`;
      els.capNote.textContent = "每天剧情上限为当天目标；超出部分仍会累加进总喝水量。";
    }

    els.unlockedCount.textContent = String(state.unlockedStory.length);
    els.storyCount.textContent = String(STORIES.length);
    renderStory();
    renderRecords();
  }

  function renderStory() {
    const latestUnlocked = Math.max(...state.unlockedStory);
    if (!expandedStoryIds.size) expandedStoryIds.add(latestUnlocked);

    els.storyTimeline.innerHTML = STORIES.map((story) => {
      const unlocked = state.unlockedStory.includes(story.id);
      const isLatest = story.id === latestUnlocked;
      const classes = ["story-card"];
      if (!unlocked) classes.push("locked");
      if (isLatest) classes.push("current");

      if (!unlocked) {
        let lockText;
        if (story.day > state.currentDay) lockText = `第 ${story.day} 天解锁`;
        else lockText = `再喝 ${(story.threshold - getCurrentSession().total).toLocaleString("zh-CN")} ml 解锁`;
        return `
          <article class="${classes.join(" ")}" data-story-id="${story.id}">
            <div class="story-art-wrap">
              <img class="story-art" src="${escapeHtml(story.scene)}" alt="" loading="lazy">
              <div class="lock-overlay">
                <div class="lock-message"><span>⌁</span>${escapeHtml(lockText)}</div>
              </div>
            </div>
            <div class="story-content"></div>
          </article>`;
      }

      const expanded = expandedStoryIds.has(story.id);
      const lines = story.lines.map(renderStoryLine).join("");
      return `
        <article class="${classes.join(" ")}" data-story-id="${story.id}">
          <div class="story-art-wrap">
            <img class="story-art" src="${escapeHtml(story.scene)}" alt="${escapeHtml(story.alt)}" loading="lazy">
          </div>
          <div class="story-content">
            <div class="story-meta">
              <span class="mini-tag">${escapeHtml(story.badge)}</span>
              <span>${story.threshold === 0 ? "已经解锁" : `目标 ${formatMl(story.threshold)}`}</span>
            </div>
            <div class="story-title-row">
              <h3>${escapeHtml(story.title)}</h3>
              <button class="story-toggle" type="button" data-toggle-story="${story.id}">${expanded ? "收起故事 ↑" : "翻开这一页 ↓"}</button>
            </div>
            <div class="story-dialogue ${expanded ? "" : "collapsed"}">${lines}</div>
          </div>
        </article>`;
    }).join("");
  }

  function renderStoryLine(line) {
    const text = escapeHtml(line.text).replaceAll("\n", "<br>");
    if (line.type === "system") return `<p class="story-line system">${text}</p>`;
    if (line.type === "caption") return `<p class="story-line caption">${text}</p>`;
    if (line.type === "dialogue") {
      const isRight = ["畅畅", "室友", "老师"].includes(line.speaker);
      return `
        <div class="dialogue-row ${isRight ? "right" : ""}">
          <span class="speaker">${escapeHtml(line.speaker)}</span>
          <span class="bubble">“${text}”</span>
        </div>`;
    }
    return `<p class="story-line narration">${text}</p>`;
  }

  function renderRecords() {
    const records = getTodayEntries();
    els.recordsList.innerHTML = records.map((entry) => {
      const time = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(entry.timestamp));
      return `
        <div class="record-item">
          <span>${escapeHtml(time)}</span>
          <strong>+${entry.amount.toLocaleString("zh-CN")} ml</strong>
        </div>`;
    }).join("");
    els.emptyRecords.classList.toggle("visible", records.length === 0);
  }

  function showToast(message, duration = 2400) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), duration);
  }

  function celebrate() {
    const colors = ["#ef8ea3", "#82c9df", "#ffd27d", "#9ed7e8", "#f8b6c0"];
    for (let i = 0; i < 26; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.setProperty("--left", `${Math.random() * 100}%`);
      piece.style.setProperty("--color", colors[i % colors.length]);
      piece.style.setProperty("--duration", `${2.2 + Math.random() * 1.8}s`);
      piece.style.setProperty("--rotate", `${Math.random() * 180}deg`);
      piece.style.animationDelay = `${Math.random() * 0.35}s`;
      els.confettiLayer.appendChild(piece);
      setTimeout(() => piece.remove(), 4600);
    }
  }

  function markDayCompleteIfNeeded() {
    const session = getCurrentSession();
    const target = DAY_TARGETS[state.currentDay];
    if (session.total < target || session.completedAt) return false;
    session.completedAt = new Date().toISOString();
    if (!state.completedDates.includes(session.date)) state.completedDates.push(session.date);
    return true;
  }

  function addWater(amount, options = {}) {
    const numericAmount = Math.round(Number(amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showToast("请输入大于 0 的喝水量。");
      els.waterAmount.focus();
      return;
    }
    if (numericAmount > 5000) {
      showToast("单次最多记录 5000 ml，请分两次记录。");
      els.waterAmount.focus();
      return;
    }

    const session = getCurrentSession();
    const now = new Date();
    state.entries.push({
      id: uid(),
      amount: numericAmount,
      timestamp: now.toISOString(),
      date: dateKey(now),
      day: state.currentDay,
      attemptId: session.attemptId
    });
    session.total += numericAmount;

    const dayCompleted = markDayCompleteIfNeeded();
    const newUnlocks = syncStoryUnlocks();
    saveState();
    render();

    els.bottleVisual.classList.remove("water-pop");
    void els.bottleVisual.offsetWidth;
    els.bottleVisual.classList.add("water-pop");
    els.waterAmount.value = "";
    els.waterAmount.focus();

    if (newUnlocks.length) {
      newUnlocks.forEach((id) => expandedStoryIds.add(id));
      celebrate();
      const latestStory = STORIES.find((story) => story.id === Math.max(...newUnlocks));
      showToast(`解锁新剧情：${latestStory.title}`, 3200);
      setTimeout(() => {
        const card = document.querySelector(`[data-story-id="${latestStory.id}"]`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 550);
    } else if (dayCompleted && options.celebrateCompletion) {
      celebrate();
      showToast("今天的水灵已经圆满，明天继续救援。", 3100);
    } else {
      showToast(`已记录 ${numericAmount} ml，水灵又亮了一点。`, 2200);
    }
  }

  async function clearToday() {
    const records = getTodayEntries();
    if (!records.length) {
      showToast("今天还没有可清空的记录。");
      return;
    }
    const confirmed = window.confirm("确定要清空今天的喝水记录吗？已经解锁的剧情会保留。");
    if (!confirmed) return;

    const ids = new Set(records.map((entry) => entry.id));
    state.entries = state.entries.filter((entry) => !ids.has(entry.id));
    const session = getCurrentSession();
    session.total = 0;
    session.attemptId = uid();
    session.completedAt = null;
    saveState();
    render();
    showToast("今天的记录已清空，解锁的剧情还在。");
  }

  function resetAll() {
    const confirmed = window.confirm("确定要重新开始九天吗？全部喝水记录和解锁进度都会被清空。");
    if (!confirmed) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) { console.warn(error); }
    window.location.reload();
  }

  function exportBackup() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), state }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `畅畅喝水备份-${dateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    showToast("备份已经导出。", 2200);
  }

  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const imported = parsed.state || parsed;
        state = normalizeState(imported);
        saveState();
        render();
        showToast("备份导入成功，喝水记录回来啦。", 2900);
      } catch (error) {
        console.error(error);
        showToast("这个备份文件无法识别。", 2900);
      }
    };
    reader.readAsText(file);
  }

  els.waterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addWater(els.waterAmount.value, { celebrateCompletion: true });
  });

  $$(".quick-adds button").forEach((button) => {
    button.addEventListener("click", () => addWater(button.dataset.amount, { celebrateCompletion: true }));
  });

  els.storyTimeline.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toggle-story]");
    if (!button) return;
    const id = Number(button.dataset.toggleStory);
    if (expandedStoryIds.has(id)) expandedStoryIds.delete(id);
    else expandedStoryIds.add(id);
    renderStory();
  });

  els.scrollStoryButton.addEventListener("click", () => $("#storySection").scrollIntoView({ behavior: "smooth" }));
  els.clearTodayButton.addEventListener("click", clearToday);
  els.resetButton.addEventListener("click", resetAll);
  els.exportButton.addEventListener("click", exportBackup);
  els.importInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importBackup(file);
    event.target.value = "";
  });

  let state = loadState();
  syncForToday();
  syncStoryUnlocks();
  saveState();

  const latest = Math.max(...state.unlockedStory);
  expandedStoryIds = new Set([latest]);
  render();
  els.waterAmount.focus({ preventScroll: true });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("离线缓存注册失败。", error));
    });
  }
})();
