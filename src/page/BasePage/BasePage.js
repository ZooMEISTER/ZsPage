import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
// import { useTranslation } from "react-i18next"
import Header from "../../component/header/header"
import Footer from "../../component/footer/footer"
import { createGlobalStyle } from "styled-components"

// 自定义滚动条样式
const GlobalStyle = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #FF0000 30%, #000000 90%);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #000000 30%, #FF0000 90%);
  }
  
  /* Firefox 滚动条样式 */
  * {
    scrollbar-width: thin;
    scrollbar-color: #FF0000 #1A1A1A;
  }
`

const BasePage = () => {
    // const { t } = useTranslation()
    const [titleIndex, setTitleIndex] = useState(0)
    const wavePattern = "▁▂▃▄▅▆▇█▇▆▅▄▃▂▁"
    const defaultTitle = "ZooMEISTER"
    const location = useLocation()
    const isAssistantPage = location.pathname === "/assistant"

    useEffect(() => {
        // 实现浏览器标签页滚动波浪效果
        const titleInterval = setInterval(() => {
            // 创建滚动波浪效果，纯波浪效果，没有文字
            let waveText = ""
            for (let i = 0; i < 30; i++) {
                const charIndex = (titleIndex + i) % wavePattern.length
                waveText += wavePattern.charAt(charIndex)
            }
            
            // 仅当页面处于活动状态时显示波浪效果
            if (document.visibilityState === "visible") {
                document.title = waveText
            } else {
                document.title = defaultTitle
            }
            
            setTitleIndex((prevIndex) => (prevIndex + 1) % wavePattern.length)
        }, 150)

        // 监听页面可见性变化
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                document.title = defaultTitle
            }
        }
        
        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            clearInterval(titleInterval)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [titleIndex])

    return(
        <div style={{backgroundColor: "#1A1A1A"}}>
            <GlobalStyle />
            {/* 内容 */}
            <Header/>
            <Outlet/>
            {!isAssistantPage && <Footer/>}
        </div>
    )
}

export default BasePage