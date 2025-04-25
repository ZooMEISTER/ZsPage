import { createBrowserRouter } from "react-router-dom";

import BasePage from "../page/BasePage/BasePage";
import HomePage from "../page/HomePage/HomePage";
import AssistantPage from "../page/AssistantPage/AssistantPage";

const router = createBrowserRouter([
    {
        path:'/',
        element: <BasePage />,
        children:[
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: '/assistant',
                element: <AssistantPage />
            }
        ]
    }
])
 
export default router