import { Alert, Card, CardContent } from "@mui/material";
import  { AxiosError } from "axios";

/** the error object looks something like this from laravel
 * {
    "message": "The password field confirmation does not match. (and 3 more errors)",
    "errors": {
        "password": [
            "The password field confirmation does not match.",
            "The password field must be at least 8 characters.",
            "The password field must contain at least one letter.",
            "The password field must contain at least one symbol."
        ]
    }
}
 */
export default function FormError({error}:{error: AxiosError<LaravelApiError>}) {

    const getAxiosErrorDetails = (error: AxiosError<LaravelApiError>) => {
        const data = error.response?.data;
        return data && data.errors ? (<div>
            {Object.keys(data.errors).map((key) => (
                <div key={key}>
                    <h4>{key}</h4>
                    <ul>
                        {data.errors[key].map((errorMessage, index) => (
                            <li key={index}>{errorMessage}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>) : '';
    }
    return (<>
        <Card>
            <CardContent>
                <Alert severity="error">{error.response?.data.message}</Alert>
                {
                    getAxiosErrorDetails(error)
                }
            </CardContent>
        </Card>
    </>);
}

type LaravelApiError = { message: string, errors: { [key: string]: string[] } }
