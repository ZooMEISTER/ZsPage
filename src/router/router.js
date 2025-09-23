import { createBrowserRouter } from "react-router-dom";

import BasePage from "../page/BasePage/BasePage";
import HomePage from "../page/HomePage/HomePage";
import BlogPage from "../page/BlogPage/BlogPage";
import BlogDetailPage from "../page/BlogPage/BlogDetailPage";
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
                path: '/blog',
                element: <BlogPage />
            },
            {
                path: '/blog/:id',
                element: <BlogDetailPage />
            },
            {
                path: '/assistant',
                element: <AssistantPage />
            }
        ]
    }
])
 
export default router