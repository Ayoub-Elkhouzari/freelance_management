import LeftPad from "../components/LeftPad.jsx";
import RightPad from "../components/RightPad.jsx";

export default function AuthPage() {
    return (
        <section className="flex w-full min-h-screen ">

            <header className="fixed left-0 top-0 z-50 h-20 w-full border-b-2 border-border bg-background flex items-center justify-center px-4">
                <h2 className="text-4xl font-bold text-primary">Freelancer</h2>
            </header>
            <LeftPad />
            <RightPad />
        </section>
    );
}
