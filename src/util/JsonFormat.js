function formatApiResponse(rawString) {
    try {
      let parsed = JSON.parse(rawString);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed); // 可能需要两次parse
      }
      return JSON.stringify(parsed, null, 2); // 2空格缩进格式化
    } catch (e) {
      console.error("格式化失败:", e);
      return rawString;
    }
}

function formatJsonKeepContent(rawString) {
  try {
      let parsed = JSON.parse(rawString);

      // 注意：这里只是要美化外层，不解码content内部
      // 这里重写一个 replacer 函数
      const formatted = JSON.stringify(parsed, (key, value) => {
          if (key === 'content' && typeof value === 'string') {
              // 对content字段，返回原样字符串，不解析
              return value;
          }
          return value;
      }, 2);

      return formatted;
  } catch (e) {
      console.error("解析失败:", e);
      return rawString;
  }
}

export { formatApiResponse, formatJsonKeepContent }