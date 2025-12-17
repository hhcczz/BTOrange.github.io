document.addEventListener('DOMContentLoaded', () => {
  const textElement = document.getElementById('typing-text');
  const textToType = "아쉬웠던 점이 있는 게임을 채워주는 개발자";

  let index = 0;
  let isDeleting = false;
  let delay = 100;

  function type() {
    if (!textElement) return;

    if (isDeleting) {
      textElement.textContent = textToType.substring(0, index - 1);
      index--;
      delay = 50;
    } else {
      textElement.textContent = textToType.substring(0, index + 1);
      index++;
      delay = 100;
    }

    if (!isDeleting && index === textToType.length) {
      isDeleting = true;
      delay = 2000;
    } else if (isDeleting && index === 0) {
      isDeleting = false;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  type();
});
