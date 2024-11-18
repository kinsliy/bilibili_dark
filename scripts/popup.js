document.addEventListener('DOMContentLoaded', function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  // 从 storage 中获取当前深色模式状态
  chrome.storage.sync.get(['darkMode'], function(result) {
    darkModeToggle.checked = result.darkMode || false;
  });
  
  // 监听切换事件
  darkModeToggle.addEventListener('change', function() {
    const isDarkMode = darkModeToggle.checked;
    
    // 保存设置到 storage
    chrome.storage.sync.set({ darkMode: isDarkMode });
    
    // 向当前标签页发送消息
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'toggleDarkMode', darkMode: isDarkMode },
          function(response) {
            if (chrome.runtime.lastError) {
              console.log('Error:', chrome.runtime.lastError);
            }
          }
        );
      }
    });
  });
});
