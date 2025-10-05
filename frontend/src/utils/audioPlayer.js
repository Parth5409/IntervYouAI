// frontend/src/utils/audioPlayer.js
export const playAudioFromBase64 = (base64String, onEnded) => {
  try {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const audioBlob = new Blob([byteArray], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.play();

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl); // Clean up the object URL
      if (onEnded) {
        onEnded();
      }
    };

    audio.onerror = (err) => {
        console.error("Audio playback error:", err);
        URL.revokeObjectURL(audioUrl);
        if (onEnded) onEnded();
    }

  } catch (error) {
    console.error("Error decoding or playing audio:", error);
    if (onEnded) onEnded(); // Ensure state is reset even on error
  }
};
