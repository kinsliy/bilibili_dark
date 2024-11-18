// 自动处理深色模式
function applyDarkMode() {
  // 获取所有元素
  const elements = document.querySelectorAll('*');
  
  elements.forEach(element => {
    // 跳过 video 和 img 元素
    if (element.tagName === 'VIDEO' || element.tagName === 'IMG') {
      return;
    }

    // 获取元素的计算样式
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    // 处理背景图片
    if (element.hasAttribute('style')) {
      const style = element.getAttribute('style');
      if (style.includes('background-image') && style.includes('/*')) {
        element.style.removeProperty('background-image');
        // 如果是 .bg 类的元素，确保它有正确的背景色
        if (element.classList.contains('bg')) {
          element.style.backgroundColor = 'var(--dark-bg)';
        }
      }
    }
    
    // 转换颜色为 RGB 值
    const bgRGB = backgroundColor.match(/\d+/g);
    const textRGB = color.match(/\d+/g);
    
    // 处理背景色
    if (bgRGB) {
      // 计算亮度 (使用 HSP 颜色模型)
      const bgBrightness = Math.sqrt(
        0.299 * (bgRGB[0] * bgRGB[0]) +
        0.587 * (bgRGB[1] * bgRGB[1]) +
        0.114 * (bgRGB[2] * bgRGB[2])
      );

      // 检查是否为白色或浅色背景
      const isLightBg = bgBrightness > 130;
      const isWhite = bgRGB[0] > 250 && bgRGB[1] > 250 && bgRGB[2] > 250;
      const isTransparent = backgroundColor === 'transparent' || bgRGB[3] === '0';

      if ((isLightBg || isWhite) && !isTransparent) {
        // 处理骨架屏
        if (
          element.className.includes('skeleton') ||
          element.className.includes('loading') ||
          element.className.includes('bili-skeleton')
        ) {
          return; // 骨架屏样式已在 CSS 中定义
        }
        // 处理视频控制栏
        else if (element.closest('.bilibili-player-video-control')) {
          element.style.setProperty('background-color', 'rgba(21, 32, 43, 0.9)', 'important');
        }
        // 处理卡片和容器
        else if (
          element.className.includes('card') ||
          element.className.includes('container') ||
          element.className.includes('wrapper')
        ) {
          element.style.setProperty('background-color', 'var(--dark-bg-secondary)', 'important');
        }
        // 处理 hover 状态
        else if (computedStyle.getPropertyValue(':hover')) {
          element.style.setProperty('background-color', 'var(--dark-bg-hover)', 'important');
        }
        // 其他元素
        else {
          element.style.setProperty('background-color', 'var(--dark-bg)', 'important');
        }
      }
    }
    
    // 处理文字颜色
    if (textRGB) {
      // 计算文字亮度
      const textBrightness = Math.sqrt(
        0.299 * (textRGB[0] * textRGB[0]) +
        0.587 * (textRGB[1] * textRGB[1]) +
        0.114 * (textRGB[2] * textRGB[2])
      );

      // 检查是否为深色文字
      const isDarkText = textBrightness < 200;
      const isBlack = textRGB[0] < 50 && textRGB[1] < 50 && textRGB[2] < 50;

      if (isDarkText || isBlack) {
        // 检查是否为链接
        if (element.tagName === 'A' || element.closest('a')) {
          element.style.setProperty('color', 'var(--dark-link)', 'important');
        } else {
          // 检查是否为次要文字（灰色文字）
          const isGrayText = Math.abs(textRGB[0] - textRGB[1]) < 20 && 
                           Math.abs(textRGB[1] - textRGB[2]) < 20 &&
                           textRGB[0] < 150;
          
          if (isGrayText) {
            element.style.setProperty('color', 'var(--dark-text-secondary)', 'important');
          } else {
            element.style.setProperty('color', 'var(--dark-text)', 'important');
          }
        }
      }
    }
  });
}

// 初始化深色模式
function initDarkMode() {
  // 添加 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        applyDarkMode();
      }
    });
  });

  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 监听页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      applyDarkMode();
    }
  });

  // 监听窗口焦点变化
  window.addEventListener('focus', applyDarkMode);

  // 初次应用深色模式
  applyDarkMode();
}

// 检查当前深色模式状态
chrome.storage.sync.get(['darkMode'], function(result) {
  if (result.darkMode) {
    document.documentElement.classList.add('bilibili-dark-mode');
    initDarkMode();
  }
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleDarkMode') {
    if (request.darkMode) {
      document.documentElement.classList.add('bilibili-dark-mode');
      initDarkMode();
    } else {
      document.documentElement.classList.remove('bilibili-dark-mode');
      // 移除所有通过 JS 添加的样式
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        element.style.removeProperty('background-color');
        element.style.removeProperty('color');
        element.style.removeProperty('border-color');
        element.style.removeProperty('background-image');
      });
    }
    sendResponse({success: true});
  }
});
