(() => {
  const STORAGE_KEY = "changchang-water-v2";
  const LEGACY_KEY = "changchang-water-diary-v1";
  const STORIES = window.STORY_DATA.story;
  const UNLOCK_AT = [0, 100, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
  const DAILY_LIMIT = 1000;
  const PRAISE_MESSAGES = ["宝贝蒸蚌！", "表扬宝宝", "畅畅是乖宝宝"];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const els = {
    totalAmount: $("#totalAmount"),
    dailyLimitBox: $("#dailyLimitBox"),
    dailyAmount: $("#dailyAmount"),
    dailyLimit: $("#dailyLimit"),
    dailyLimitHint: $("#dailyLimitHint"),
    lastAdded: $("#lastAdded"),
    waterCard: $(".water-card"),
    manualCount: $("#manualCount"),
    manualProgress: $("#manualProgress"),
    manualButton: $("#manualButton"),
    manualOverlay: $("#manualOverlay"),
    manualClose: $("#manualClose"),
    chapterGrid: $("#chapterGrid"),
    waterForm: $("#waterForm"),
    waterAmount: $("#waterAmount"),
    storyPlayer: $("#storyPlayer"),
    playerBadge: $("#playerBadge"),
    playerTitle: $("#playerTitle"),
    sceneImage: $("#sceneImage"),
    storyAmountLabel: $("#storyAmountLabel"),
    storyProgressText: $("#storyProgressText"),
    dialogueStatus: $("#dialogueStatus"),
    dialogueLines: $("#dialogueLines"),
    sceneProgress: $("#sceneProgress"),
    playerPause: $("#playerPause"),
    playerNext: $("#playerNext"),
    playerEnd: $("#playerEnd"),
    playerClose: $("#playerClose"),
    praiseLayer: $("#praiseLayer"),
    praiseText: $("#praiseText"),
    praiseEmojis: $("#praiseEmojis"),
    toast: $("#toast")
  };

  let state = loadState();
  let toastTimer = null;
  let pendingStories = [];
  let currentStory = null;
  let currentLineIndex = 0;
  let playerTimer = null;
  let playerPlaying = false;
  let praiseIndex = 0;
  let praiseTimer = null;
  let praiseHideTimer = null;

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatNumber(value) {
    return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("zh-CN");
  }

  function formatMl(value) {
    return `${formatNumber(value)} ml`;
  }

  function unlockAmount(storyId) {
    return UNLOCK_AT[storyId] ?? 0;
  }

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function freshState() {
    return {
      version: 4,
      totalMl: 0,
      progressMl: 0,
      dailyMl: 0,
      dailyDate: localDateKey(),
      unlocked: [0],
      entries: [],
      lastAddedAt: null,
      lastAddedAmount: 0
    };
  }

  function migrateLegacyState() {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return null;
      const legacy = JSON.parse(raw);
      const entries = Array.isArray(legacy.entries) ? legacy.entries : [];
      const totalMl = entries.reduce((sum, entry) => sum + Math.max(0, Math.round(Number(entry.amount) || 0)), 0);
      const unlocked = Array.isArray(legacy.unlockedStory) ? legacy.unlockedStory.map(Number) : [0];
      return normalizeState({ totalMl, unlocked, entries: [], lastAddedAt: null, lastAddedAmount: 0 });
    } catch (error) {
      console.warn("旧记录迁移失败。", error);
      return null;
    }
  }

  function normalizeState(candidate) {
    const base = freshState();
    const saved = candidate && typeof candidate === "object" ? candidate : {};
    const normalized = {
      ...base,
      ...saved,
      version: 4,
      totalMl: Math.max(0, Math.round(Number(saved.totalMl) || 0)),
      unlocked: Array.isArray(saved.unlocked) ? Array.from(new Set(saved.unlocked.map(Number))) : [0],
      entries: Array.isArray(saved.entries) ? saved.entries : []
    };

    normalized.unlocked = normalized.unlocked
      .filter((id) => Number.isInteger(id) && id >= 0 && id < STORIES.length)
      .sort((a, b) => a - b);

    if (!normalized.unlocked.includes(0)) normalized.unlocked.unshift(0);

    const fallbackProgress = Number.isFinite(Number(saved.progressMl)) ? Number(saved.progressMl) : normalized.totalMl;
    const highestUnlockedAmount = normalized.unlocked.reduce((max, id) => Math.max(max, unlockAmount(id)), 0);
    normalized.progressMl = Math.max(0, Math.round(fallbackProgress), highestUnlockedAmount);
    normalized.dailyMl = Math.min(DAILY_LIMIT, Math.max(0, Math.round(Number(saved.dailyMl) || 0)));
    normalized.dailyDate = typeof saved.dailyDate === "string" ? saved.dailyDate : localDateKey();
    return normalized;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalizeState(JSON.parse(raw));
      return migrateLegacyState() || freshState();
    } catch (error) {
      console.warn("读取喝水记录失败。", error);
      return freshState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("保存喝水记录失败。", error);
      showToast("浏览器暂时无法保存，请检查隐私模式设置。", 2800);
    }
  }

  function ensureDailyState() {
    const today = localDateKey();
    if (state.dailyDate === today) return false;
    state.dailyDate = today;
    state.dailyMl = 0;
    return true;
  }

  function syncUnlocks() {
    const newlyUnlocked = [];
    for (const story of STORIES) {
      if (state.progressMl >= unlockAmount(story.id) && !state.unlocked.includes(story.id)) {
        state.unlocked.push(story.id);
        newlyUnlocked.push(story.id);
      }
    }
    state.unlocked.sort((a, b) => a - b);
    return newlyUnlocked;
  }

  function render() {
    ensureDailyState();
    const total = Math.round(state.totalMl);
    const dailyCounted = Math.min(DAILY_LIMIT, Math.max(0, Math.round(state.dailyMl)));
    const dailyRemaining = Math.max(0, DAILY_LIMIT - dailyCounted);
    els.totalAmount.textContent = formatNumber(total);
    els.dailyAmount.textContent = formatNumber(dailyCounted);
    els.dailyLimit.textContent = formatNumber(DAILY_LIMIT);
    els.dailyLimitBox.classList.toggle("is-capped", dailyRemaining === 0);
    els.dailyLimitHint.textContent = dailyRemaining > 0
      ? `今天还可计入 ${formatMl(dailyRemaining)} 剧情进度，超出部分仍会记录，但不会提前解锁。`
      : "今日剧情进度已达上限，继续喝水仍会记录，但不会提前解锁下一天。";
    els.manualCount.textContent = `${state.unlocked.length} / ${STORIES.length}`;
    els.manualProgress.textContent = `${state.unlocked.length} / ${STORIES.length}`;

    if (state.lastAddedAmount > 0 && state.lastAddedAt) {
      const time = new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date(state.lastAddedAt));
      els.lastAdded.textContent = `上次记录 ${formatMl(state.lastAddedAmount)} · ${time}`;
    } else {
      els.lastAdded.textContent = "还没有记录，先喝一杯水吧。";
    }

    renderManual();
  }

  function progressForStory(storyId) {
    if (state.unlocked.includes(storyId)) return 100;
    const start = storyId > 0 ? unlockAmount(storyId - 1) : 0;
    const end = unlockAmount(storyId);
    const span = Math.max(1, end - start);
    return Math.min(99, Math.max(0, Math.round(((state.progressMl - start) / span) * 100)));
  }

  function renderManual() {
    els.chapterGrid.innerHTML = STORIES.map((story, index) => {
      const unlocked = state.unlocked.includes(story.id);
      const amount = unlockAmount(story.id);
      const progress = progressForStory(story.id);
      const description = unlocked
        ? "点击重新播放这一章"
        : `剧情进度达到 ${formatMl(amount)} 后解锁`;

      return `
        <button class="chapter-card ${unlocked ? "" : "locked"}" type="button" data-story-id="${story.id}" aria-label="${escapeHtml(story.title)}" aria-disabled="${unlocked ? "false" : "true"}">
          <span class="chapter-card-top">
            <span class="chapter-number">CHAPTER ${String(index + 1).padStart(2, "0")}</span>
            <span class="chapter-status">${unlocked ? "可回忆" : "未解锁"}</span>
          </span>
          <h3>${escapeHtml(story.title)}</h3>
          <p>${escapeHtml(story.badge || "章节")} · ${escapeHtml(description)}</p>
          <span class="chapter-meter" aria-hidden="true"><span style="width:${progress}%"></span></span>
        </button>`;
    }).join("");
  }

  function showToast(message, duration = 2200) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), duration);
  }

  function showPraise() {
    clearTimeout(praiseTimer);
    clearTimeout(praiseHideTimer);

    const message = PRAISE_MESSAGES[praiseIndex % PRAISE_MESSAGES.length];
    praiseIndex += 1;
    els.praiseText.textContent = message;
    els.praiseEmojis.innerHTML = Array.from({ length: 14 }, (_, index) => {
      const emoji = index % 2 === 0 ? "😚" : "❤️";
      const x = 7 + (index * 29) % 86;
      const y = 11 + (index * 37) % 76;
      const size = 30 + (index % 4) * 11;
      const delay = (index % 5) * 0.055;
      const rotate = -22 + (index * 13) % 44;
      return `<span class="praise-emoji" style="--x:${x}%;--y:${y}%;--size:${size}px;--delay:${delay}s;--rotate:${rotate}deg">${emoji}</span>`;
    }).join("");

    els.praiseLayer.hidden = false;
    els.praiseLayer.classList.remove("show");
    void els.praiseLayer.offsetWidth;
    els.praiseLayer.classList.add("show");

    praiseTimer = setTimeout(() => {
      els.praiseLayer.classList.remove("show");
      praiseHideTimer = setTimeout(() => {
        els.praiseLayer.hidden = true;
      }, 220);
    }, 1500);
  }

  function lockBody() {
    document.body.classList.toggle("locked", !els.manualOverlay.hidden || !els.storyPlayer.hidden);
  }

  function openManual() {
    renderManual();
    els.manualOverlay.hidden = false;
    lockBody();
    els.manualClose.focus();
  }

  function closeManual() {
    els.manualOverlay.hidden = true;
    lockBody();
  }

  function addWater(amount) {
    const numeric = Math.round(Number(amount));
    if (!Number.isFinite(numeric) || numeric <= 0) {
      showToast("请输入大于 0 的喝水量。");
      els.waterAmount.focus();
      return;
    }

    if (numeric > 5000) {
      showToast("单次最多记录 5000 ml，请分两次记录。");
      els.waterAmount.focus();
      return;
    }

    ensureDailyState();
    const countableAmount = Math.min(numeric, Math.max(0, DAILY_LIMIT - state.dailyMl));
    state.totalMl += numeric;
    state.progressMl += countableAmount;
    state.dailyMl += countableAmount;
    state.lastAddedAmount = numeric;
    state.lastAddedAt = new Date().toISOString();
    state.entries.push({
      id: uid(),
      amount: numeric,
      countedAmount: countableAmount,
      countedForStory: countableAmount > 0,
      timestamp: state.lastAddedAt
    });

    const unlocked = syncUnlocks();
    saveState();
    render();
    showPraise();

    els.waterCard.classList.remove("is-updating");
    void els.waterCard.offsetWidth;
    els.waterCard.classList.add("is-updating");
    els.waterAmount.value = "";
    els.waterAmount.focus();

    if (unlocked.length) {
      pendingStories.push(...unlocked);
      const newest = STORIES.find((story) => story.id === unlocked[unlocked.length - 1]);
      showToast(`新的救援故事已解锁：${newest.title}`, 2600);
      setTimeout(openNextQueuedStory, 650);
      return;
    }

    if (countableAmount < numeric) {
      showToast(`已记录 ${formatMl(numeric)}；今日剧情进度增加 ${formatMl(countableAmount)}。`, 2800);
      return;
    }

    showToast(`已记录 ${formatMl(numeric)}`, 1700);
  }

  function openNextQueuedStory() {
    if (!pendingStories.length || !els.storyPlayer.hidden) return;
    const id = pendingStories.shift();
    openStory(id, true);
  }

  function renderStoryText(text) {
    const total = formatMl(state.totalMl);
    const daily = formatMl(state.dailyMl);
    const dailyLimit = formatMl(DAILY_LIMIT);
    return String(text)
      .replaceAll("{{total}}", total)
      .replaceAll("{{totalMl}}", total)
      .replaceAll("{{daily}}", daily)
      .replaceAll("{{dailyLimit}}", dailyLimit)
      .replaceAll("{{remaining}}", formatMl(Math.max(0, UNLOCK_AT[UNLOCK_AT.length - 1] - state.progressMl)));
  }

  function createStoryLine(line) {
    const text = escapeHtml(renderStoryText(line.text)).replaceAll("\n", "<br>");

    if (line.type === "dialogue") {
      return `
        <div class="dialogue-row">
          <span class="speaker">${escapeHtml(line.speaker)}</span>
          <div class="dialogue-text">“${text}”</div>
        </div>`;
    }

    const className = line.type === "system"
      ? "system"
      : line.type === "caption"
        ? "caption"
        : "narration";
    return `<p class="story-line ${className}">${text}</p>`;
  }

  function openStory(storyId, fromQueue = false) {
    const story = STORIES.find((item) => item.id === Number(storyId));
    if (!story || !state.unlocked.includes(story.id)) return;

    clearTimeout(playerTimer);
    if (!els.manualOverlay.hidden) closeManual();

    currentStory = story;
    currentLineIndex = 0;
    playerPlaying = true;
    clearTimeout(toastTimer);
    els.toast.classList.remove("show");
    els.storyPlayer.hidden = false;
    els.playerBadge.textContent = story.badge || "章节";
    els.playerTitle.textContent = story.title;
    els.sceneImage.src = story.scene || "assets/scene-01-phone.svg";
    els.sceneImage.alt = story.alt || "剧情场景插画";
    els.storyAmountLabel.textContent = `目前累计 ${formatMl(state.totalMl)}`;
    els.storyProgressText.textContent = `0 / ${story.lines.length}`;
    els.dialogueLines.innerHTML = "";
    els.dialogueStatus.textContent = fromQueue ? "新的救援记忆正在展开" : "正在回忆这一段故事";
    els.playerPause.textContent = "暂停";
    els.sceneProgress.style.width = "0%";
    lockBody();
    els.playerClose.focus();
    scheduleNextLine();
  }

  function scheduleNextLine() {
    clearTimeout(playerTimer);
    if (!playerPlaying || !currentStory) return;

    const current = currentStory.lines[currentLineIndex];
    const delay = current?.type === "dialogue"
      ? 900
      : current?.type === "system"
        ? 1050
        : current?.type === "caption"
          ? 620
          : 720;

    playerTimer = setTimeout(showNextLine, delay);
  }

  function showNextLine() {
    if (!currentStory) return;
    if (currentLineIndex >= currentStory.lines.length) {
      finishStoryPlayback();
      return;
    }

    const line = currentStory.lines[currentLineIndex];
    els.dialogueLines.insertAdjacentHTML("beforeend", createStoryLine(line));
    currentLineIndex += 1;

    els.storyProgressText.textContent = `${currentLineIndex} / ${currentStory.lines.length}`;
    els.sceneProgress.style.width = `${Math.round((currentLineIndex / currentStory.lines.length) * 100)}%`;
    els.dialogueLines.scrollTop = els.dialogueLines.scrollHeight;

    if (currentLineIndex >= currentStory.lines.length) {
      finishStoryPlayback();
    } else {
      scheduleNextLine();
    }
  }

  function finishStoryPlayback() {
    clearTimeout(playerTimer);
    playerPlaying = false;
    els.playerPause.textContent = "重新播放";
    els.dialogueStatus.textContent = `本章播放完毕 · 共 ${currentStory.lines.length} 条内容`;
    els.sceneProgress.style.width = "100%";
  }

  function togglePlayback() {
    if (!currentStory) return;
    if (currentLineIndex >= currentStory.lines.length) {
      openStory(currentStory.id);
      return;
    }

    playerPlaying = !playerPlaying;
    els.playerPause.textContent = playerPlaying ? "暂停" : "继续";
    els.dialogueStatus.textContent = playerPlaying
      ? "自动播放中，已经出现的对话会一直保留"
      : "已暂停，对话内容仍在当前页面中";

    if (playerPlaying) scheduleNextLine();
    else clearTimeout(playerTimer);
  }

  function showAllLines() {
    if (!currentStory) return;
    clearTimeout(playerTimer);

    while (currentLineIndex < currentStory.lines.length) {
      els.dialogueLines.insertAdjacentHTML("beforeend", createStoryLine(currentStory.lines[currentLineIndex]));
      currentLineIndex += 1;
    }

    els.storyProgressText.textContent = `${currentLineIndex} / ${currentStory.lines.length}`;
    els.dialogueLines.scrollTop = els.dialogueLines.scrollHeight;
    finishStoryPlayback();
  }

  function closeStory() {
    clearTimeout(playerTimer);
    playerPlaying = false;
    els.storyPlayer.hidden = true;
    currentStory = null;
    lockBody();
    if (pendingStories.length) setTimeout(openNextQueuedStory, 420);
  }

  els.waterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addWater(els.waterAmount.value);
  });

  $$(".quick-adds button").forEach((button) => {
    button.addEventListener("click", () => addWater(button.dataset.amount));
  });

  els.manualButton.addEventListener("click", openManual);
  els.manualClose.addEventListener("click", closeManual);
  els.manualOverlay.addEventListener("click", (event) => {
    if (event.target === els.manualOverlay) closeManual();
  });

  els.chapterGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-story-id]");
    if (!card) return;

    const id = Number(card.dataset.storyId);
    if (!state.unlocked.includes(id)) {
      showToast(`剧情进度达到 ${formatMl(unlockAmount(id))} 后解锁。`, 2400);
      return;
    }

    openStory(id);
  });

  els.playerPause.addEventListener("click", togglePlayback);
  els.playerNext.addEventListener("click", () => {
    clearTimeout(playerTimer);
    showNextLine();
  });
  els.playerEnd.addEventListener("click", showAllLines);
  els.playerClose.addEventListener("click", closeStory);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!els.storyPlayer.hidden) closeStory();
    else if (!els.manualOverlay.hidden) closeManual();
  });

  ensureDailyState();
  const newlyUnlocked = syncUnlocks();
  if (newlyUnlocked.length) pendingStories.push(newlyUnlocked[newlyUnlocked.length - 1]);
  saveState();
  render();
  els.waterAmount.focus({ preventScroll: true });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("离线缓存注册失败。", error));
    });
  }
})();
