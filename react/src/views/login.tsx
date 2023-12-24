import { useFormik, FormikErrors } from "formik";
import { useState } from "react";
import { Link } from "react-router-dom"
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import FormError from "../components/FormError";

const Login = () => {
    const {setUser, setToken} = useStateContext();
    const [formError, setFormError] = useState(null);
    const formik = useFormik<{password: string, email:string}>({
        initialValues: {
            password: '',
            email: '',
        },
        validate: (values: { password: string, email:string }) => {
            const errors: FormikErrors<{ password: string, email:string }> = {};
            if (!values.password) {
              errors.password = 'The password is required';
            }
            if(!values.email ){
                errors.email = 'The email is required';
            }
            return errors;
          },
        onSubmit: (data) =>{
            setFormError(null);
            if(!formik.isValid){
                alert("Please make sure the form is valid");
                return;
            }
            axiosClient.post('/login', data).then(({data})=>{
                setUser(data.user);
                setToken(data.token);
            },
            (error) => {
                setFormError(error);

            })
        }
    })
  return (
    <div className="login-signup-form animated fadeInDown">
        <div className="form">
            <form onSubmit={formik.handleSubmit}>
                <h1 className="title">
                    Log in to your account
                </h1>
                <input type="email" name="email" placeholder="Email" value={formik.values.email}
                  onChange={(e) => {
                    formik.setFieldValue('email', e.target.value);
                  }}/>
                <input type="password" placeholder="Password" value={formik.values.password}
                  onChange={(e) => {
                    formik.setFieldValue('password', e.target.value);
                  }}/>
                <button className="btn btn-block">Login</button>
                { formError ? <FormError error={formError} ></FormError> : '' }
                <p className="message">
                    Not Registered? <Link to="/signup">Sign up</Link>
                </p>
            </form>
        </div>
    </div>
  )
}

export default Login
