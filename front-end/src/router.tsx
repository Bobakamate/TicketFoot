import { createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import HomePage from "./Pages/HomePage.tsx";
import AuthPage from "./Pages/AuthPage.tsx";
import {TicketDetailPage} from "./Pages/TicketDetail.tsx";
import ProfilePage from "./Pages/ProfilPage.tsx";


const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />, // La page principale sera Landing
    },
    {
        path: "/ticket",
        element: <App />,
        children: [

            {
                path: ":id", // /ticket/123
                element: <TicketDetailPage />,
            },
        ],
    },

    {
        path: "/login",
        element: <App />, // Home sera sous "/home"
        children: [
            {
                index: true,
                element: <AuthPage />,
            },
        ],
    },
    {
        path: "/profil",
        element: <App />, // Home sera sous "/home"
        children: [
            {
                index: true,
                element: <ProfilePage />,
            },
        ],
    },
]);

export default router;
