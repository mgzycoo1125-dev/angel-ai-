(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const STORAGE_SETTINGS = "angel.settings.v1";
  const STORAGE_CHATS = "angel.chats.v1";
  const defaults = {theme:"dark", accent:"gold", motion:true, enterToSend:true, saveChats:true};
  let settings = {...defaults, ...readJSON(STORAGE_SETTINGS, {})};
  let chats = settings.saveChats ? readJSON(STORAGE_CHATS, []) : [];
  let activeChatId = null;
  let toastTimer;

  function readJSON(key, fallback) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }
  function saveSettings() {
    try { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); } catch {}
  }
  function saveChats() {
    try {
      if (settings.saveChats) localStorage.setItem(STORAGE_CHATS, JSON.stringify(chats));
      else localStorage.removeItem(STORAGE_CHATS);
    } catch { showToast("This browser could not save local chat history."); }
  }
  function applySettings() {
    let theme = settings.theme;
    if (theme === "system") theme = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    root.dataset.theme = theme;
    root.dataset.accent = settings.accent;
    root.dataset.motion = settings.motion ? "on" : "off";
    $("themeSelect").value = settings.theme;
    $("accentSelect").value = settings.accent;
    $("motionToggle").checked = settings.motion;
    $("enterToggle").checked = settings.enterToSend;
    $("saveToggle").checked = settings.saveChats;
    document.querySelector('meta[name="theme-color"]').content = theme === "light" ? "#faf8f2" : "#090909";
  }
  function showToast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }
  function newId() { return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
  function currentChat() { return chats.find(chat => chat.id === activeChatId) || null; }
  function startNewChat() {
    activeChatId = null;
    $("messages").replaceChildren();
    $("messages").classList.add("hidden");
    $("welcome").classList.remove("hidden");
    $("promptInput").value = "";
    $("promptInput").focus();
    document.querySelectorAll(".history-item").forEach(el => el.classList.remove("selected"));
    closeSidebar();
  }
  function renderHistory() {
    const list = $("historyList");
    list.replaceChildren();
    if (!chats.length) {
      const p = document.createElement("p"); p.className = "empty-history"; p.textContent = "Your conversations will appear here."; list.append(p); return;
    }
    [...chats].reverse().slice(0,12).forEach(chat => {
      const btn = document.createElement("button");
      btn.className = "history-item" + (chat.id === activeChatId ? " selected" : "");
      btn.textContent = chat.title || "New conversation";
      btn.title = chat.title || "New conversation";
      btn.addEventListener("click", () => openChat(chat.id));
      list.append(btn);
    });
  }
  function openChat(id) {
    const chat = chats.find(item => item.id === id);
    if (!chat) return;
    activeChatId = id;
    $("welcome").classList.add("hidden");
    $("messages").classList.remove("hidden");
    $("messages").replaceChildren();
    chat.messages.forEach(msg => appendMessage(msg.text, msg.role, false));
    renderHistory();
    closeSidebar();
  }
  function appendMessage(text, role, shouldSave = true) {
    $("welcome").classList.add("hidden");
    $("messages").classList.remove("hidden");
    const row = document.createElement("div");
    row.className = `message ${role}`;
    const icon = document.createElement("div"); icon.className = "message-icon"; icon.textContent = role === "user" ? "Y" : "✦";
    const bubble = document.createElement("div"); bubble.className = "bubble"; bubble.textContent = text;
    row.append(icon, bubble); $("messages").append(row);
    if (shouldSave) {
      let chat = currentChat();
      if (!chat) {
        chat = {id:newId(), title:text.slice(0,48), createdAt:new Date().toISOString(), messages:[]};
        chats.push(chat); activeChatId = chat.id;
      }
      chat.messages.push({role, text, createdAt:new Date().toISOString()});
      if (role === "user" && chat.messages.filter(m => m.role === "user").length === 1) chat.title = text.slice(0,48);
      saveChats(); renderHistory();
    }
    $("chatContent").scrollTo({top:$("chatContent").scrollHeight, behavior:settings.motion ? "smooth" : "auto"});
    return row;
  }
  function demoReply(input) {
    const q = input.toLowerCase();
    if (q.includes("app") || q.includes("build")) return "Great idea. Let's build it one step at a time:\n\n1. Define the problem the app solves.\n2. Sketch the core screens.\n3. Create a clickable prototype.\n4. Connect an AI API through a secure backend.\n\nThis is a simulated demo reply, not a live AI response.";
    if (q.includes("artificial intelligence") || q.includes("what is ai") || q.includes(" ai ")) return "Think of AI as software trained to recognize patterns and generate useful outputs. A chatbot sends your message to a language model and displays the response. A real app also needs secure API handling, error states, and clear privacy choices.\n\nThis prototype isn't connected to a language model yet.";
    if (q.includes("study") || q.includes("week")) return "Let's keep it manageable:\n\n• Pick one or two important tasks each day.\n• Start with a 25-minute focus session.\n• Take a short break, then test yourself from memory.\n• Review what worked at the end of the week.\n\nTell me your subjects and free time to tailor the plan.";
    if (q.includes("story") || q.includes("write")) return "The first version wasn't perfect. Some buttons were too big, the colors felt wrong, and a feature failed once. But the builder fixed one small thing each day. Soon, the prototype became something real—and every screen had started as an idea.";
    return "That's a good place to start. I can help break it into smaller steps, compare options, and make a practical plan.\n\nQuick note: I'm a demo assistant right now, so this reply is generated from a small set of examples—not a live AI model. We'll need a secure backend and an AI provider to make ANGEL genuinely intelligent.";
  }
  function sendMessage(text) {
    const input = (text ?? $("promptInput").value).trim();
    if (!input) return;
    appendMessage(input, "user");
    $("promptInput").value = ""; $("promptInput").style.height = "auto"; $("sendButton").disabled = true;
    const row = document.createElement("div"); row.className = "message assistant";
    const icon = document.createElement("div"); icon.className = "message-icon"; icon.textContent = "✦";
    const bubble = document.createElement("div"); bubble.className = "bubble";
    const dots = document.createElement("span"); dots.className = "typing-dots";
    for (let i=0;i<3;i++) dots.append(document.createElement("i"));
    bubble.append(dots); row.append(icon,bubble); $("messages").append(row);
    setTimeout(() => {
      row.remove();
      appendMessage(demoReply(input), "assistant");
      $("sendButton").disabled = false;
      $("promptInput").focus();
    }, settings.motion ? 520 : 40);
  }
  function openSettings() {
    $("settingsBackdrop").classList.remove("hidden");
    $("closeSettings").focus();
    $("sidebar").classList.remove("open");
  }
  function closeSettings() { $("settingsBackdrop").classList.add("hidden"); }
  function closeSidebar() { $("sidebar").classList.remove("open"); }
  function exportCurrentChat() {
    const chat = currentChat();
    if (!chat) { showToast("Send a message first to create a chat to export."); return; }
    const content = [`ANGEL AI — ${chat.title}`, `Created: ${chat.createdAt}`, "", ...chat.messages.map(m => `${m.role === "user" ? "You" : "ANGEL"}:\n${m.text}\n`)].join("\n");
    const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`angel-chat-${chat.id}.txt`; a.click();
    URL.revokeObjectURL(url); showToast("Export started.");
  }
  function clearAllChats() {
    if (!confirm("Clear all saved ANGEL conversations from this browser? This cannot be undone.")) return;
    chats=[]; activeChatId=null; saveChats(); renderHistory(); startNewChat(); showToast("Local conversations cleared.");
  }

  $("chatForm").addEventListener("submit", e => { e.preventDefault(); sendMessage(); });
  $("promptInput").addEventListener("input", e => { const el=e.currentTarget; el.style.height="auto"; el.style.height=Math.min(el.scrollHeight,140)+"px"; });
  $("promptInput").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && settings.enterToSend) { e.preventDefault(); sendMessage(); }
  });
  document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => sendMessage(button.dataset.prompt)));
  $("newChat").addEventListener("click", startNewChat);
  $("navChat").addEventListener("click", startNewChat);
  $("navExplore").addEventListener("click", () => { startNewChat(); $("welcome").scrollIntoView({behavior:settings.motion?"smooth":"auto"}); });
  ["navSettings","profileSettings","topSettings"].forEach(id => $(id).addEventListener("click", openSettings));
  $("closeSettings").addEventListener("click", closeSettings);
  $("doneSettings").addEventListener("click", closeSettings);
  $("settingsBackdrop").addEventListener("click", e => { if (e.target === $("settingsBackdrop")) closeSettings(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSettings(); closeSidebar(); } });
  $("themeSelect").addEventListener("change", e => { settings.theme=e.target.value; applySettings(); saveSettings(); });
  $("accentSelect").addEventListener("change", e => { settings.accent=e.target.value; applySettings(); saveSettings(); });
  $("motionToggle").addEventListener("change", e => { settings.motion=e.target.checked; applySettings(); saveSettings(); });
  $("enterToggle").addEventListener("change", e => { settings.enterToSend=e.target.checked; saveSettings(); });
  $("saveToggle").addEventListener("change", e => {
    settings.saveChats=e.target.checked;
    if (!settings.saveChats) { localStorage.removeItem(STORAGE_CHATS); chats=[]; activeChatId=null; startNewChat(); }
    saveSettings(); saveChats(); renderHistory();
  });
  $("exportChat").addEventListener("click", exportCurrentChat);
  $("clearAll").addEventListener("click", clearAllChats);
  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  $("closeSidebarButton").addEventListener("click", closeSidebar);
  window.matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => { if (settings.theme === "system") applySettings(); });

  applySettings(); renderHistory();
  if (chats.length) openChat(chats[chats.length-1].id);
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
