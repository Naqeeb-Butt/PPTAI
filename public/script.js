document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('languageSelect');
    const elements = document.querySelectorAll('[data-en]');
    const textareaInput = document.getElementById('promptInput');

    function updateLanguage(lang) {
        elements.forEach(element => {
            if (element.hasAttribute(`data-${lang}`)) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = element.getAttribute(`data-${lang}-placeholder`);
                } else {
                    element.textContent = element.getAttribute(`data-${lang}`);
                }
            }
        });

        // Update textarea placeholder
        if (textareaInput) {
            textareaInput.placeholder = textareaInput.getAttribute(`data-${lang}-placeholder`);
        }
    }

    languageSelect.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
    });

    // Initialize with English
    updateLanguage('en');
});

document.querySelector('.create-slides').addEventListener('click', async () => {
    const prompt = document.querySelector('#promptInput').value;
  
    if (!prompt) {
      alert("Please enter a prompt to generate the slides.");
      return;
    }
  
    try {
      const response = await fetch('/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Create a Blob from the base64 content
        const binaryData = atob(data.fileContent);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
        const downloadUrl = URL.createObjectURL(blob);
  
        // Update the download link
        const downloadSection = document.querySelector('#downloadSection');
        const downloadLink = document.querySelector('#downloadLink');
        downloadLink.href = downloadUrl;
        downloadSection.classList.remove('hidden');
      } else {
        const error = await response.json();
        alert(error.error || "Failed to generate slides.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate slides.");
    }
  });
  