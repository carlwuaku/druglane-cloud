import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "./views/login";
import Signup from "./views/signup";
import NotFound from "./views/notFound";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Users from "./views/users";
import Dashboard from "./views/dashboard";
import UserForm from "./views/userForm";

const router = createBrowserRouter([

    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: '/',
                element: <Navigate to="/users"></Navigate>
            },
            {
                path: '/users',
                element: <Users></Users>
            },
            {
                path: '/dashboard',
                element: <Dashboard/>
            },
            {
                path: '/users/new',
                element: <UserForm key='userCreate'/>
            },

            {
                path: '/users/:id',
                element: <UserForm key='userEdit'/>
            }

        ]
    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: '/login',
                element: <Login/>
            },
            {
                path: '/signup',
                element: <Signup/>
            }
        ]
    },
    {
        path: '*',
        element: <NotFound />
    }
])
export default router;
