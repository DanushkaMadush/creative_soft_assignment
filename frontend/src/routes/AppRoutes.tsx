import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/Login";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import AddNewFarm from "../pages/farms/AddNewFarm";
import ViewFarm from "../pages/farms/ViewFarm";
import ManageEmployees from "../pages/employees/ManageEmployees";
import AddNewEmployee from "../pages/employees/AddNewEmployee";
import ViewEmployee from "../pages/employees/ViewEmployee";
import ManageFarms from "../pages/farms/ManageFarms";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <AuthLayout />,
        children: [
            {
                index: true,
                element: <Login />,
            }
        ]
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            }, 
            {
                path: "farms",
                element: <ManageFarms />,
            }, 
            {
                path: "farms/add",
                element: <AddNewFarm />,
            }, 
            {
                path: "farms/:id",
                element: <ViewFarm />,
            },  
            {
                path: "employees",
                element: <ManageEmployees />,
            }, 
            {
                path: "employees/add",
                element: <AddNewEmployee />,
            }, 
            {
                path: "employees/:id",
                element: <ViewEmployee />,
            },
        ]
    },    
])

export default function AppRoutes() {
    return <RouterProvider router={router} />
}