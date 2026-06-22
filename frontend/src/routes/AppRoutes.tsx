import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
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
import LazyLoad from "./LazyLoad";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <AuthLayout />,
        children: [
            {
                index: true,
                element: LazyLoad(Login),
            }
        ]
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/login" replace />
            },
            {
                path: "home",
                element: LazyLoad(Home),
            }, 
            {
                path: "farms",
                element: LazyLoad(ManageFarms),
            }, 
            {
                path: "farms/add",
                element: LazyLoad(AddNewFarm),
            }, 
            {
                path: "farms/:id",
                element: LazyLoad(ViewFarm),
            },  
            {
                path: "employees",
                element: LazyLoad(ManageEmployees),
            }, 
            {
                path: "employees/add",
                element: LazyLoad(AddNewEmployee),
            }, 
            {
                path: "employees/:id",
                element: LazyLoad(ViewEmployee),
            },
        ]
    },    
])

export default function AppRoutes() {
    return <RouterProvider router={router} />
}