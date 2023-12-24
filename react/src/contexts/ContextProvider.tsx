import { ReactNode, createContext, useContext, useState } from "react";
import { User } from "../models/user.model";

const StateContext = createContext<{user:null|{name: string}, token: string|null,
setToken:(token: string | null)=>void, setUser: (user:User | null) => void, setNotification: (msg:string) => void,
notification:string}>({
    user: null,
    token: null,
    setToken: () =>{},
    setUser: () => {},
    notification: '',
    setNotification: () => {}
});

export const ContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, _setUser] = useState<User | null>(null);
    const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
    const [notification, _setNotification] = useState<string>("");
    const setToken = (token: null | string) => {
        if (token) {
            _setToken(token);
            localStorage.setItem('ACCESS_TOKEN', token);
        } else {
            localStorage.removeItem('ACCESS_TOKEN')
        }

    }

    const setUser = (user:User|null) => {
        _setUser(user)
    }

    const setNotification = (msg: string) => {
        _setNotification(msg)
    }
    return (
        <StateContext.Provider value={{
            user,
            token,
            setUser,
            setToken,
            notification,
            setNotification
        }}>
            {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext);
