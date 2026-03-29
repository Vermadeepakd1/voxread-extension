let extractedText = "";
let chunks = [];
let currentChunkIndex = 0;
let isPlaying = false;

function setStatus(text) {
  document.getElementById("status").innerText = text;
}

function setPlayDisabled(state) {
  document.getElementById("play").disabled = state;
}

function getSelectedVoice() {
  return document.getElementById("voice").value;
}

function splitText(text, maxLength = 500) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let current = "";

  sentences.forEach((sentence) => {
    if ((current + sentence).length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  });

  if (current) chunks.push(current);
  return chunks;
}

document.getElementById("extract").addEventListener("click", async () => {
  const contentDiv = document.getElementById("content");

  contentDiv.innerText = "Extracting...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["libs/Readability.js"],
    },
    () => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const article = new Readability(document.cloneNode(true)).parse();
            return article ? article.textContent : "Could not extract article";
          },
        },
        (results) => {
          extractedText = results[0].result;
          contentDiv.innerText = extractedText.slice(0, 2000);
        },
      );
    },
  );
});

document.getElementById("play").addEventListener("click", async () => {
  if (!extractedText) {
    alert("Extract text first!");
    return;
  }

  setStatus("Generating audio...");
  setPlayDisabled(true);

  const chunks = splitText(extractedText.slice(0, 3000));
  let index = 0;

  async function fetchAudio(text) {
    const response = await fetch("https://voxread-backend.onrender.com/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice: getSelectedVoice(),
      }),
    });

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  // fetch first chunk
  const firstAudioUrl = await fetchAudio(chunks[0]);

  setStatus("Playing...");
  setPlayDisabled(false);

  const audio = new Audio(firstAudioUrl);

  let nextAudios = [];

  // preload rest
  (async () => {
    for (let i = 1; i < chunks.length; i++) {
      const url = await fetchAudio(chunks[i]);
      nextAudios[i] = url;
    }
  })();

  audio.onended = () => {
    index++;
    if (index < chunks.length) {
      const nextAudio = new Audio(nextAudios[index]);
      nextAudio.onended = audio.onended;
      nextAudio.play();
    } else {
      setStatus("Finished");
    }
  };

  audio.play();
});

document.getElementById("download").addEventListener("click", async () => {
  if (!extractedText) {
    alert("Extract text first!");
    return;
  }

  setStatus("Preparing download...");

  try {
    const response = await fetch("https://voxread-backend.onrender.com/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: extractedText.slice(0, 2000),
        voice: getSelectedVoice(),
      }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "voxread-audio.mp3";
    a.click();

    setStatus("Downloaded");
  } catch (err) {
    console.error(err);
    setStatus("Download failed");
  }
});

document.getElementById("pause").addEventListener("click", () => {
  window.speechSynthesis.pause();
});

document.getElementById("resume").addEventListener("click", () => {
  window.speechSynthesis.resume();
});

document.getElementById("stop").addEventListener("click", () => {
  isPlaying = false;
  window.speechSynthesis.cancel();
});

function savePreferences() {
  const voice = document.getElementById("voice").value;
  const speed = document.getElementById("speed").value;

  chrome.storage.local.set({ voice, speed });
}

document.getElementById("voice").addEventListener("change", savePreferences);
document.getElementById("speed").addEventListener("change", savePreferences);

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["voice", "speed"], (data) => {
    if (data.voice) {
      document.getElementById("voice").value = data.voice;
    }
    if (data.speed) {
      document.getElementById("speed").value = data.speed;
    }
  });
});
