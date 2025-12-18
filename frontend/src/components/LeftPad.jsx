import "../App.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function LeftPad() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center border-r border-black px-6 text-center">
            <img src={logo} alt="Logo" className="h-20 w-20 rounded-full" />
            <h1 className="text-secondary-foreground text-4xl md:text-6xl font-semibold leading-tight">
                Welcome to Freelancer
            </h1>
            <p className="text-muted-foreground">Your freelance management platform</p>
        </div>

    );
}

export default LeftPad;
