
(() => {
  "use strict";

  const SUPABASE_URL = "https://rmpiltxmqywwsenyxcdc.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Q5EyDnwwgjXUeK55zAUTag_FQrr3vHS";

  const $ = (id) => document.getElementById(id);
  const authSection = $("authSection");
  const translatorSection = $("translatorSection");
  const authForm = $("authForm");
  const authMessage = $("authMessage");
  const translateMessage = $("translateMessage");
  const sourceText = $("sourceText");
  const translatedText = $("translatedText");
  const sourceLanguage = $("sourceLanguage");
  const targetLanguage = $("targetLanguage");
  const translateButton = $("translateButton");
  const listenButton = $("listenButton");
  const copyButton = $("copyButton");

  let authMode = "login";
  let currentUser = null;
  let currentTranslation = "";
  let recognition = null;

  if (!window.supabase || !window.supabase.createClient) {
    setMessage(authMessage, "Could not load the sign-in service. Check your internet connection and reload.", true);
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  function setMessage(element, message, isError = false) {
    element.textContent = message || "";
    element.classList.toggle("error", Boolean(isError));
  }

  function setBusy(button, busy, busyText, normalText) {
    button.disabled = busy;
    button.textContent = busy ? busyText : normalText;
  }

  function showAuth() {
    authSection.classList.remove("hidden");
    translatorSection.classList.add("hidden");
  }

  function showTranslator(user) {
    currentUser = user;
    authSection.classList.add("hidden");
    translatorSection.classList.remove("hidden");
    $("signedInLabel").textContent = user.email ? `Signed in as ${user.email}` : "Signed in with Google";
    renderHistory();
  }

  function historyKey() {
    return currentUser ? `glosson-history-${currentUser.id}` : "glosson-history";
  }

  function readHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(historyKey()) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function saveHistory(items) {
    try {
      localStorage.setItem(historyKey(), JSON.stringify(items.slice(0, 12)));
    } catch (error) {
      setMessage(translateMessage, "Translation worked, but this browser could not save the history.", true);
    }
  }

  function renderHistory() {
    const list = $("historyList");
    const items = readHistory();
    list.replaceChildren();

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "empty-history";
      empty.textContent = "Your recent translations will show up here.";
      list.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "history-item";

      const content = document.createElement("div");
      const original = document.createElement("p");
      original.className = "history-original";
      original.textContent = item.original;
      const result = document.createElement("p");
      result.className = "history-translation";
      result.textContent = item.translation;
      const meta = document.createElement("div");
      meta.className = "history-meta";
      meta.textContent = `${item.fromLabel} → ${item.toLabel} · ${item.date}`;
      content.append(original, result, meta);

      const useButton = document.createElement("button");
      useButton.type = "button";
      useButton.className = "history-use";
      useButton.textContent = "Use again";
      useButton.addEventListener("click", () => {
        sourceText.value = item.original;
        sourceLanguage.value = item.from;
        targetLanguage.value = item.to;
        currentTranslation = item.translation;
        translatedText.textContent = item.translation;
        translatedText.classList.remove("placeholder");
        $("resultLanguage").textContent = item.toLabel;
        $("charCount").textContent = `${sourceText.value.length} / 3000`;
        listenButton.disabled = false;
        copyButton.disabled = false;
        window.scrollTo({ top: translatorSection.offsetTop, behavior: "smooth" });
      });

      card.append(content, useButton);
      list.appendChild(card);
    });
  }

  function selectedLanguageLabel(select) {
    return select.options[select.selectedIndex]?.text || select.value;
  }

  function updateAuthMode(mode) {
    authMode = mode;
    const isLogin = mode === "login";
    $("loginTab").classList.toggle("active", isLogin);
    $("signupTab").classList.toggle("active", !isLogin);
    $("loginTab").setAttribute("aria-selected", String(isLogin));
    $("signupTab").setAttribute("aria-selected", String(!isLogin));
    $("authHeading").textContent = isLogin ? "Welcome to Glosson" : "Create your account";
    $("authSubmit").textContent = isLogin ? "Sign in" : "Create account";
    $("password").autocomplete = isLogin ? "current-password" : "new-password";
    setMessage(authMessage, "");
  }

  $("loginTab").addEventListener("click", () => updateAuthMode("login"));
  $("signupTab").addEventListener("click", () => updateAuthMode("signup"));

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("email").value.trim();
    const password = $("password").value;
    const button = $("authSubmit");
    const normalText = authMode === "login" ? "Sign in" : "Create account";
    setBusy(button, true, authMode === "login" ? "Signing in…" : "Creating account…", normalText);
    setMessage(authMessage, "");

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href.split("#")[0] }
        });
        if (error) throw error;
        if (data.session && data.user) {
          showTranslator(data.user);
        } else {
          setMessage(authMessage, "Account created. Check your email for the confirmation link, then sign in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showTranslator(data.user);
      }
    } catch (error) {
      setMessage(authMessage, friendlyAuthError(error.message), true);
    } finally {
      setBusy(button, false, "", normalText);
    }
  });

  function friendlyAuthError(message) {
    const text = String(message || "");
    if (/Invalid login credentials/i.test(text)) return "Email or password is incorrect. Try again, or create an account.";
    if (/Email not confirmed/i.test(text)) return "Please confirm your email using the link sent to your inbox.";
    if (/User already registered/i.test(text)) return "An account already exists for this email. Try signing in.";
    if (/Password should be at least/i.test(text)) return "Choose a password with at least 6 characters.";
    return text || "Something went wrong. Please try again.";
  }

  $("googleButton").addEventListener("click", async () => {
    const button = $("googleButton");
    button.disabled = true;
    setMessage(authMessage, "Opening Google sign-in…");
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
      });
      if (error) throw error;
    } catch (error) {
      setMessage(authMessage, error.message || "Google sign-in could not start.", true);
      button.disabled = false;
    }
  });

  $("logoutButton").addEventListener("click", async () => {
    const button = $("logoutButton");
    button.disabled = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      currentUser = null;
      currentTranslation = "";
      showAuth();
      setMessage(authMessage, "You have signed out.");
    } catch (error) {
      setMessage(translateMessage, error.message || "Could not sign out.", true);
    } finally {
      button.disabled = false;
    }
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      showTranslator(session.user);
    } else {
      currentUser = null;
      showAuth();
    }
  });

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      setMessage(authMessage, "Could not check your session. Please reload.", true);
      return;
    }
    if (data.session?.user) showTranslator(data.session.user);
    else showAuth();
  });

  sourceText.addEventListener("input", () => {
    $("charCount").textContent = `${sourceText.value.length} / 3000`;
  });

  $("swapLanguages").addEventListener("click", () => {
    if (sourceLanguage.value === "auto") {
      setMessage(translateMessage, "Choose a source language before swapping.", true);
      return;
    }
    const oldSource = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = oldSource;
    if (currentTranslation) {
      sourceText.value = currentTranslation;
      currentTranslation = "";
      translatedText.textContent = "Your translation will appear here.";
      translatedText.classList.add("placeholder");
      listenButton.disabled = true;
      copyButton.disabled = true;
      $("charCount").textContent = `${sourceText.value.length} / 3000`;
    }
    $("resultLanguage").textContent = selectedLanguageLabel(targetLanguage);
    setMessage(translateMessage, "");
  });

  $("clearButton").addEventListener("click", () => {
    sourceText.value = "";
    $("charCount").textContent = "0 / 3000";
    setMessage(translateMessage, "");
    sourceText.focus();
  });

  translateButton.addEventListener("click", async () => {
    const text = sourceText.value.trim();
    if (!text) {
      setMessage(translateMessage, "Type something first, then translate.", true);
      sourceText.focus();
      return;
    }
    if (sourceLanguage.value === targetLanguage.value) {
      setMessage(translateMessage, "Choose two different languages.", true);
      return;
    }

    setBusy(translateButton, true, "Translating…", "Translate text →");
    setMessage(translateMessage, "");
    try {
      const from = sourceLanguage.value === "auto" ? "auto" : sourceLanguage.value;
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(targetLanguage.value)}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("The translation service is unavailable right now.");
      const data = await response.json();
      const result = Array.isArray(data?.[0]) ? data[0].map((part) => part?.[0] || "").join("") : "";
      if (!result) throw new Error("No translation was returned. Please try again.");
      currentTranslation = result;
      translatedText.textContent = result;
      translatedText.classList.remove("placeholder");
      $("resultLanguage").textContent = selectedLanguageLabel(targetLanguage);
      listenButton.disabled = false;
      copyButton.disabled = false;
      setMessage(translateMessage, "Translation complete.");
      const items = readHistory();
      items.unshift({
        original: text,
        translation: result,
        from: sourceLanguage.value,
        to: targetLanguage.value,
        fromLabel: selectedLanguageLabel(sourceLanguage),
        toLabel: selectedLanguageLabel(targetLanguage),
        date: new Date().toLocaleString()
      });
      saveHistory(items);
      renderHistory();
    } catch (error) {
      setMessage(translateMessage, error.message || "Translation failed. Check your connection and try again.", true);
    } finally {
      translateButton.disabled = false;
      translateButton.textContent = "Translate text →";
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!currentTranslation) return;
    try {
      await navigator.clipboard.writeText(currentTranslation);
      setMessage(translateMessage, "Translation copied.");
    } catch (error) {
      const temporary = document.createElement("textarea");
      temporary.value = currentTranslation;
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      setMessage(translateMessage, copied ? "Translation copied." : "Copy was blocked by this browser.", !copied);
    }
  });

  listenButton.addEventListener("click", () => {
    if (!currentTranslation) return;
    if (!("speechSynthesis" in window)) {
      setMessage(translateMessage, "Text-to-speech is not supported in this browser.", true);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentTranslation);
    utterance.lang = targetLanguage.value === "auto" ? "en" : targetLanguage.value;
    window.speechSynthesis.speak(utterance);
  });

  $("voiceButton").addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage(translateMessage, "Voice input is not supported here. Try Chrome on Android.", true);
      return;
    }
    if (recognition) {
      recognition.stop();
      recognition = null;
      $("voiceButton").textContent = "🎙 Speak";
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = sourceLanguage.value === "auto" ? "en-IN" : sourceLanguage.value;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      $("voiceButton").textContent = "■ Stop listening";
      setMessage(translateMessage, "Listening… speak now.");
    };
    recognition.onresult = (event) => {
      sourceText.value = event.results[0][0].transcript;
      $("charCount").textContent = `${sourceText.value.length} / 3000`;
      setMessage(translateMessage, "Voice captured. Press Translate text.");
    };
    recognition.onerror = (event) => {
      setMessage(translateMessage, `Voice input failed: ${event.error}.`, true);
    };
    recognition.onend = () => {
      recognition = null;
      $("voiceButton").textContent = "🎙 Speak";
    };
    recognition.start();
  });

  $("clearHistoryButton").addEventListener("click", () => {
    saveHistory([]);
    renderHistory();
    setMessage(translateMessage, "History cleared from this browser.");
  });

  $("resultLanguage").textContent = selectedLanguageLabel(targetLanguage);
  targetLanguage.addEventListener("change", () => {
    $("resultLanguage").textContent = selectedLanguageLabel(targetLanguage);
  });
})();
