import { useEffect, useState } from "react"
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";
import { User } from "../models/user.model";
import { CircularProgress } from "@mui/material";

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getUsers = () => {
        setLoading(true);
        axiosClient.get<{data:User[]}>('/users').then(({data}) => {
            setUsers(data.data);
            console.log(data)
            setLoading(false);
        }).catch(() => {
            setLoading(false)
        })
    }

    const deleteUser = (user:User) => {
        if(!window.confirm('Delete this user?')){
            return;
        }

        axiosClient.delete(`/users/${user.id}`).then(() => {
            getUsers();
        }).catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        getUsers();


    }, [])

    return (
        <div>

            <div className="flex-spread">
            <h1>Users</h1>
            <Link className="btn-add" to='/users/new'>Add New</Link>
            </div>
            {loading && <CircularProgress /> }
            <div className="card animated fadeInDown">
                <table>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Created On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.created_at}</td>
                                <td><Link className="btn-edit" to={'/users/'+user.id}>Edit</Link>
                                &nbsp;
                                <button onClick={() => deleteUser(user)} className="btn-delete" >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
