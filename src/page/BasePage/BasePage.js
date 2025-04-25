import { useEffect } from "react"
import { Outlet } from "react-router-dom"
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

    useEffect(() => {
        // document.title = t("JIELI_INSTRUMENTS")
    })

    return(
        <div style={{backgroundColor: "#1A1A1A"}}>
            <GlobalStyle />
            {/* 内容 */}
            <Header/>
            <Outlet/>
            <Footer/>
        </div>
    )
}

export default BasePage