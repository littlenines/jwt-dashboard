import { useState, type SubmitEvent } from "react";
import api from "@/config/api";

const Login = () => {

const [login, setlogin] = useState({ email: '', password: '', })

const submitLogin = async (event: SubmitEvent<HTMLFormElement>) => {
  event.preventDefault();

  const loginFetch = await api.post("auth/login", login)
  console.log(loginFetch)
}
return (
  <main>
    <section className="login">
      <div className="login-wrapper">

      <h1>Login your account</h1>
      <p>Welcome back! Select method to login:</p>
      <form className="login_form" onSubmit={submitLogin}>
        <input type="email" placeholder="Email" value={login.email} onChange={(event) => setlogin({ ...login, email: event.target.value })}/>
        <input type="password" placeholder="password" value={login.password} onChange={(event) => setlogin({ ...login, password: event.target.value })} />
        <button type="submit">Login</button>
    </form>
      </div>
    </section>
  </main>
)
}

export default Login
