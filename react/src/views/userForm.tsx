import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { User } from "../models/user.model";
import axiosClient from "../axios-client";
import { FormikErrors, useFormik } from "formik";
import FormError from "../components/FormError";
import { useStateContext } from "../contexts/ContextProvider";

export default function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setNotification } = useStateContext();
    const [loading, setLoading] = useState<boolean>(false);



    useEffect(() => {
        if (id) {
            getUser();
        }
    }, []);

    const [formError, setFormError] = useState(null);
    const formik = useFormik<User>({
        initialValues: {
            name: '',
            password: '',
            email: '',
            password_confirmation: '',
            id: ''
        },
        validate: (values: User) => {
            const errors: FormikErrors<User> = {};
            if (!values.name) {
                errors.name = 'The name is required';
            }

            if (values.password && values.password_confirmation && values.password !== values.password_confirmation) {
                errors.password_confirmation = 'The passwords must match';
            }
            if (!id) {
                if (!values.password) {
                    errors.password = 'The password is required';
                }
                if (!values.password_confirmation) {
                    errors.password_confirmation = 'The password confirmation is required';
                }
            }
            return errors;
        },
        onSubmit: (data) => {
            setFormError(null);
            setLoading(true)
            if (!formik.isValid) {
                alert("Please make sure the form is valid");
                return;
            }

            // Check if the password field is present in the data
            const isPasswordProvided = Object.prototype.hasOwnProperty.call(data, 'password') && data.password !== '';

            // Create a modified data object based on whether the password is provided
            const requestData = {
                name: data.name,
                email: data.email,
                ...(id && { id: id }),
                ...(isPasswordProvided && { password: data.password, password_confirmation: data.password_confirmation }),
            };

            const axiosRequest = id ? axiosClient.put(`/users/${id}`, requestData) : axiosClient.post('/users', requestData)

            axiosRequest.then(() => {
                setNotification('User successfully created');
                navigate('/users')
            },
                (error) => {
                    setLoading(false)
                    alert('An error occurred' + error.response?.data?.message)
                    setFormError(error);
                    const response = error.message;
                    if (response) {
                        console.log(response);
                    }
                })
        }
    })


    const getUser = () => {
        setLoading(true);
        axiosClient.get(`/users/${id}`).then(({ data }) => {
            formik.setValues({
                id: data.data.id,
                name: data.data.name,
                email: data.data.email,
                password: '',
                password_confirmation: ''
            })
        }).then(error => {
            console.log(error)
        }).finally(() => {
            setLoading(false)
        })
    }

    return (<>
        <div className="animated fadeInDown">
            <div className="form">
                <form onSubmit={formik.handleSubmit}>
                    <h1 className="title">
                        {id ? 'Update user' : 'Create a user'}
                    </h1>
                    <input type="text" name="name" placeholder="Full Name"
                        value={formik.values.name}
                        onChange={(e) => {
                            formik.setFieldValue('name', e.target.value);
                        }} />
                    <input type="email" name="email" placeholder="Email Address"
                        value={formik.values.email}
                        onChange={(e) => {
                            formik.setFieldValue('email', e.target.value);
                        }} />
                    <input type="password" placeholder="Password"
                        value={formik.values.password}
                        onChange={(e) => {
                            formik.setFieldValue('password', e.target.value);
                        }} />
                    {
                        formik.errors.password && <div>
                            {formik.errors.password}
                        </div>
                    }
                    <input type="password" placeholder="Confirm Password"
                        value={formik.values.password_confirmation}
                        onChange={(e) => {
                            formik.setFieldValue('password_confirmation', e.target.value);
                        }} />
                    {
                        formik.errors.password_confirmation && <div>
                            {formik.errors.password_confirmation}
                        </div>
                    }
                    <button disabled={!formik.isValid || loading} className="btn btn-block" type="submit">Submit</button>
                    {formError ? <FormError error={formError} ></FormError> : ''}

                </form>
            </div>
        </div>
    </>)
}
