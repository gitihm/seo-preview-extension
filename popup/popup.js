document.addEventListener("DOMContentLoaded", function () {
  const loadingElement = document.getElementById("loading");
  const errorElement = document.getElementById("error");
  const seoInfoElement = document.getElementById("seoInfo");
  const previewImage = document.getElementById("previewImage");
  const previewTitle = document.getElementById("previewTitle");
  const previewDescription = document.getElementById("previewDescription");
  const previewUrl = document.getElementById("previewUrl");

  function showError(message) {
    errorElement.querySelector("p").textContent = message;
    loadingElement.classList.add("hidden");
    errorElement.classList.remove("hidden");
    seoInfoElement.classList.add("hidden");
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (chrome.runtime.lastError) {
      showError("Error: " + chrome.runtime.lastError.message);
      return;
    }

    const activeTab = tabs[0];

    if (!activeTab) {
      showError("Error: No active tab found");
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: activeTab.id },
        function: getSEOInfo,
      },
      (injectionResults) => {
        if (chrome.runtime.lastError) {
          showError("Error: " + chrome.runtime.lastError.message);
        } else if (
          injectionResults &&
          injectionResults[0] &&
          injectionResults[0].result
        ) {
          const seoInfo = injectionResults[0].result;
          updatePreview(seoInfo);
          loadingElement.classList.add("hidden");
          seoInfoElement.classList.remove("hidden");
        } else {
          showError("Error: Unable to retrieve SEO data");
        }
      }
    );
  });

  function updatePreview(seoInfo) {
    previewImage.src = seoInfo.image || "default-image.jpg";
    previewImage.onerror = function () {
      this.src = "default-image.jpg";
    };
    previewTitle.textContent = seoInfo.title || "No title available";
    previewDescription.textContent =
      seoInfo.description || "No description available";
    previewUrl.textContent = seoInfo.url || "No URL available";
  }
});

function getSEOInfo() {
  const title =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.title;
  const description =
    document.querySelector('meta[property="og:description"]')?.content ||
    document.querySelector('meta[name="description"]')?.content ||
    "";
  const image =
    document.querySelector('meta[property="og:image"]')?.content || "";
  const url =
    document.querySelector('meta[property="og:url"]')?.content ||
    window.location.href;

  return { title, description, image, url };
}
