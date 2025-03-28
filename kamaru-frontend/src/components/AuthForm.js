import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div>
      {isLogin ? <LoginForm /> : <RegisterForm />}
      <button onClick={toggleForm}>
        {isLogin ? "Switch to Register" : "Switch to Login"}
      </button>
    </div>
  );
}

export default AuthForm;