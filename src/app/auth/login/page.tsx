import LoginForm from "@/components/forms/LoginForm";
import Procu from "@/components/shared/Procu";

function LoginPage() {
  return (
    <div className="mt-3 flex items-center">
      <div className="relative flex justify-end">
        <img
          src="/images/pick-pages.png"
          alt="large auth splash image"
          className="w-[80%] rounded-xl "
        />
        <div className="absolute top-[60%] left-[30%]">
          <Procu />
          <p className="text-white text-[1.25rem] font-[700]">
            We&apos;re here to Increase your{" "}
            <span className="text-white">Productivity</span>
          </p>
        </div>
      </div>
      <div className="flex-grow">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
