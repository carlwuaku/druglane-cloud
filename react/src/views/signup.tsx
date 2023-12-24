// import { useRef } from "react"
import { Link } from "react-router-dom"
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { useFormik, FormikErrors } from 'formik';
import { useState } from "react";
import FormError from "../components/FormError";

export default function Signup(){

    const {setUser, setToken} = useStateContext();
    const [formError, setFormError] = useState(null);
    const formik = useFormik<{name: string, password: string, password_confirmation: string, email:string}>({
        initialValues: {
            name: '',
            password: '',
            email: '',
            password_confirmation: ''
        },
        validate: (values: { password: string, password_confirmation:string }) => {
            const errors: FormikErrors<{ password: string, password_confirmation:string }> = {};
            if (!values.password) {
              errors.password = 'The password is required';
            }
            if(values.password && values.password_confirmation && values.password !== values.password_confirmation){
                errors.password_confirmation = 'The passwords must match';
            }
            return errors;
          },
        onSubmit: (data) =>{
            setFormError(null);
            if(!formik.isValid){
                alert("Please make sure the form is valid");
                return;
            }
            axiosClient.post('/signup', data).then(({data})=>{
                setUser(data.user);
                setToken(data.token);
            },
            (error) => {
                alert('An error occurred'+error.response?.data?.message)
                setFormError(error);
                const response = error.message;
                if(response){
                   console.log( response);
                }
            })
        }
    })

    return (
      <div className="login-signup-form animated fadeInDown">
          <div className="form">
              <form onSubmit={formik.handleSubmit}>
                  <h1 className="title">
                      Create your account
                  </h1>
                  <input  type="text" name="name" placeholder="Full Name"
                  value={formik.values.name}
                  onChange={(e) => {
                    formik.setFieldValue('name', e.target.value);
                  }} />
                  <input type="email" name="email" placeholder="Email Address"
                  value={formik.values.email}
                  onChange={(e) => {
                    formik.setFieldValue('email', e.target.value);
                  }}/>
                  <input type="password" placeholder="Password"
                  value={formik.values.password}
                  onChange={(e) => {
                    formik.setFieldValue('password', e.target.value);
                  }}/>
                  {
                    formik.errors.password ? <div>
                        {formik.errors.password}
                    </div> : ""
                  }
                  <input type="password" placeholder="Confirm Password"
                  value={formik.values.password_confirmation}
                  onChange={(e) => {
                    formik.setFieldValue('password_confirmation', e.target.value);
                  }}/>
                  {
                    formik.errors.password_confirmation ?  <div>
                        {formik.errors.password_confirmation}
                    </div> :""
                  }
                  <button disabled={!formik.isValid} className="btn btn-block" type="submit">Sign up</button>
                  { formError ? <FormError error={formError} ></FormError> : '' }
                  <p className="message">
                      Already Registered? <Link to="/signup">Sign In</Link>
                  </p>
              </form>
          </div>
      </div>
    )
}
