import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient, { notificationEmitter } from "../axios-client";
import { useEffect, useState } from "react";
import Snackbar from '@mui/material/Snackbar';



export default function DefaultLayout() {
    const { user, token, setUser, setToken } = useStateContext();

    const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("false");
    const handleClose = () => {
        setNotificationOpen(false);
    }

    useEffect(() => {
      axiosClient.get('/user').then(({data}) => {
        setUser(data);
      })
    }, []);

    useEffect(() => {
        // Subscribe to the notification emitter
         notificationEmitter.subscribe((message) => {

            setNotificationMessage(message);
          setNotificationOpen(true);

          // Automatically hide the notification after 3 seconds
          setTimeout(() => {
            setNotificationOpen(false);
          }, 3000);
        });

        // return () => {
        //   // Unsubscribe when the component unmounts
        //   unsubscribe();
        // };
      }, []);


    if (!token) {
        console.log('going to login')
        return <Navigate to="/login" />
    }
    const onLogout = ()=>{
        axiosClient.post('/logout').then(() => {
            setToken(null)
        })
    }

    return (
        <div id="defaultLayout">
            <aside>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/users">Users</Link>
            </aside>
            <div className="content">
                <header>
                    <div>
                        Header
                    </div>
                    <div>{user?.name} <button onClick={onLogout} className="btn-logout">Logout</button> </div>
                </header>
                <main><Outlet /></main>
            </div>

            <Snackbar
        anchorOrigin={{ vertical:'top', horizontal: 'right' }}
        open={notificationOpen}
        onClose={handleClose}
        message={notificationMessage}
        key={'notication'}
      />
        </div>
    )
}
