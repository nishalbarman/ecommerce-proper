"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import {
  hasOneSpaceBetweenNames,
  isValidEmail,
  isValidIndianMobileNumber,
  isValidPassword,
} from "@/helpter/utils";
import authService from "@/services/authService";
import { useDispatch } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { setCookiesAfterLogin } from "@/lib/login/setLoginCookie";
import { setUserAuth } from "@/redux/slices/authSlice";

const validateInputs = (name, value) => {
  switch (name) {
    case "name":
      return hasOneSpaceBetweenNames(value);
    case "email":
      return isValidEmail(value);
    case "mobileNo":
      return isValidIndianMobileNumber(value);
    case "password":
      return isValidPassword(value);
  }
};

export default function Page() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: { value: "", isTouched: false, isError: null },
    email: { value: "", isTouched: false, isError: null },
    mobileNo: { value: "", isTouched: false, isError: null },
    password: { value: "", isTouched: false, isError: null },
    confirmpassword: { value: "", isTouched: false },
  });

  const [isVerifyScreenVisible, setIsVerifyScreenVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleOnChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    const validation = validateInputs(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...formData[name],
        value: value,
        isTouched: true,
        isError: !validation,
      },
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Signing up...");
    try {
      const response = await authService.register({
        name: formData.name.value,
        email: formData.email.value,
        mobileNo: formData.mobileNo.value,
        password: formData.password.value,
        confirmpassword: formData.confirmpassword.value,
      });

      if (response?.user) {
        // Dispatch the action to update Redux state (will be persisted automatically)
        dispatch(
          setUserAuth({
            name: response.user.name,
            email: response.user.email,
            mobileNo: response.user.mobileNo,
            jwtToken: response.user.jwtToken,
          }),
        );

        setCookiesAfterLogin({ token: response.user.jwtToken });
        const redirectPath = searchParams?.get("redirect") || null;
        console.log("Redirecting to:", redirectPath);
        if (redirectPath) {
          navigator.push(`/${redirectPath}`);
        } else {
          navigator.push(`/`);
        }
      }

      toast.dismiss(loadingToast);
      toast.success(response?.message || "Unknown error occured");
      // toast.success(
      //   "A verficiation link sent to your mobile no, please verify by clicking on the link.",
      //   {
      //     duration: 20000,
      //   }
      // );
      setIsVerifyScreenVisible(true);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.dismiss(loadingToast);
      toast.error(error?.message ||error?.response?.data?.message);
    }
  };

  return (
    <>
      <main className="flex m-[20px_0] sm:items-center min-h-[80vh] ml-[3%] mr-[3%] lg:ml-[10%] lg:mr-[10%]">
        <div className="grid grid-col-1 max-sm:block md:grid-cols-3 h-fill w-[100%] justify-center">
          {/* <div className="bg-[#CBE4E8] bg-[url(/assets/cart_mobile.png)] bg-no-repeat bg-contain h-[100%]"></div> */}
          <>
            {isVerifyScreenVisible ? (
              <>
                <>
                  <div className="flex flex-col items-center justify-center col-start-1 md:col-start-2 gap-[20px] w-full">
                    <div className="flex flex-col items-center justify-center w-fill h-fill gap-5">
                      {/* <MdEmail size="20"/> */}
                      <p className="text-4xl">😘</p>
                      <h3 className="text-3xl font-semibold font-andika text-center">
                        Account created successfully
                      </h3>
                      <p className="text-xl text-center font-andika">
                        You can now login to your account using the mobile
                        number and password.
                      </p>
                      <div className="mt-[8px] flex justify-center gap-3">
                        <span className="text-lg">
                          You can continue to login{" "}
                          <Link
                            className="text-md font-andika font-semibold underline"
                            href={"/auth/login"}>
                            Login
                          </Link>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
                {/* <div className="flex flex-col items-center justify-center col-start-1 md:col-start-2 gap-[20px] w-full">
            <div className="flex flex-col items-center justify-center w-fill h-fill gap-5">
              <Image src={"/assets/email.svg"} width={60} height={60} />
              <h3 className="text-3xl font-semibold font-andika text-center">
                Check your SMS inbox
              </h3>
              <p className="text-xl text-center font-andika">
                We sent a verficiation link to your mobile no, please verify by
                clicking on the link.
              </p>
              <div className="mt-[8px] flex justify-center gap-3">
                <span className="text-lg">
                  You can continue to login{" "}
                  <Link
                    className="text-md font-andika font-semibold underline"
                    href={"/auth/login"}>
                    Login
                  </Link>
                </span>
              </div>
            </div>
          </div> */}
              </>
            ) : (
              <div className="flex rounded-md flex-col max-md:shadow-lg p-5 pt-8 pb-8 min-md:p-8 col-start-1 md:col-start-2 gap-[20px]">
                {/* max-sm:mt-[10%] */}
                <h3 className="text-3xl font-semibold font-andika">
                  Create an account
                </h3>
                <p className="text-xl font-andika max-sm:mt-[-6px]">
                  Enter your details below
                </p>
                <form
                  onSubmit={handleLogin}
                  className="flex flex-col gap-[40px] mt-[20px] w-[100%]">
                  {/* <input
                    onKeyUp={handleOnChange}
                    id="name"
                    className="h-[32px] w-[100%] text-black text-lg font-andika placeholder:text-[#989998] outline-none border-[#818081] rounded-none border-b-[1px] focus:border-b-[black] transition duration-150 p-[0px_5px] pl-0"
                    type="text"
                    placeholder="Name"
                    name="name"
                  />
                  {formData.name.isError && (
                    <span className="mt-[-25px] text-[red] text-sm">
                      Full name should be of two words containing only one
                      space.
                    </span>
                  )} */}
                  <input
                    onKeyUp={handleOnChange}
                    id="email"
                    className="h-[32px] w-[100%] text-black text-lg font-andika placeholder:text-[#989998] outline-none border-[#818081] rounded-none border-b-[1px] focus:border-b-[black] transition duration-150 p-[0px_5px] pl-0"
                    type="email"
                    placeholder="Email"
                    name="email"
                  />
                  {formData.email.isError && (
                    <span className="mt-[-25px] text-[red] text-sm">
                      Enter a valid email address
                    </span>
                  )}
                  {/* <input
                    onKeyUp={handleOnChange}
                    id="mobileNo"
                    className="h-[32px] w-[100%] text-black text-lg font-andika placeholder:text-[#989998] outline-none border-[#818081] rounded-none border-b-[1px] focus:border-b-[black] transition duration-150 p-[0px_5px] pl-0"
                    type="number"
                    placeholder="Phone Number"
                    name="mobileNo"
                  />
                  {formData.mobileNo.isError && (
                    <span className="mt-[-25px] text-[red] text-sm">
                      Enter a valid 10 digit mobile number
                    </span>
                  )} */}
                  <div className="flex items-center justify-between h-[32px] w-[100%] text-black text-lg font-andika placeholder:text-[#989998] outline-none border-[#818081] border-b-[1px] focus:border-b-[black] transition duration-150 p-[0px_5px] pl-0 focus-within:border-[black]">
                    <input
                      onKeyUp={handleOnChange}
                      id="password"
                      className="w-[100%] h-[100%] outline-none border-none"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Password"
                      name="password"
                    />
                    <button
                      type="button"
                      className="cursor-pointer"
                      onClick={() => {
                        setIsPasswordVisible((prev) => !prev);
                      }}
                      alt="Eye"
                      width={25}
                      height={25}>
                      {!isPasswordVisible ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>
                  {formData.password.isError && (
                    <span className="mt-[-25px] text-[red] text-sm">
                      Enter a valid password. Password should have a minimum of
                      8 characters, at least one uppercase letter, and at least
                      one lowercase letter:
                    </span>
                  )}

                  <input
                    onKeyUp={handleOnChange}
                    id="confirmpassword"
                    className="h-[32px] w-[100%] text-black text-lg font-andika placeholder:text-[#989998] outline-none border-[#818081] rounded-none border-b-[1px] focus:border-b-[black] transition duration-150 p-[0px_5px] pl-0"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Confirm Password"
                    name="confirmpassword"
                  />
                  {!(
                    formData?.password?.value ===
                    formData?.confirmpassword?.value
                  ) && (
                    <span className="mt-[-25px] text-[red] text-sm">
                      Password and confirm password should match
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      !formData.confirmpassword.isTouched ||
                      formData.password.value !==
                        formData.confirmpassword.value ||
                      // !formData.name.isTouched ||
                      // formData.name.isError ||
                      !formData.email.isTouched ||
                      formData.email.isError ||
                      // !formData.mobileNo.isTouched ||
                      // formData.mobileNo.isError ||
                      formData.password.isError ||
                      !formData.password.isTouched
                    }
                    className={`cursor-${
                      isLoading ||
                      formData.password.value !==
                        formData.confirmpassword.value ||
                      !formData.confirmpassword.isTouched ||
                      // !formData.name.isTouched ||
                      // formData.name.isError ||
                      !formData.email.isTouched ||
                      formData.email.isError ||
                      // !formData.mobileNo.isTouched ||
                      // formData.mobileNo.isError ||
                      formData.password.isError ||
                      !formData.password.isTouched
                        ? "not-allowed"
                        : "pointer"
                    } h-[56px] font-andika bg-[#DA4544] disabled:bg-[gray] text-white text-lg p-[0px_15px] rounded-[5px]`}>
                    Create Account
                  </button>
                  {/* <button className="flex items-center gap-2 justify-center h-[56px] font-andika text-black text-lg p-[0px_15px] rounded-[5px] bg-white border-[2px] border-[#98998] mt-[-15px]">
        <Image src="/assets/google.svg" width={20} height={20} />
        Sign up with Google
      </button> */}
                  <div className="mt-[8px] flex justify-center gap-3">
                    <span className="text-lg">
                      Already have an account?{" "}
                      <Link
                        className="text-md font-andika font-semibold underline"
                        href={"/auth/login"}>
                        Login
                      </Link>
                    </span>
                  </div>
                </form>
              </div>
            )}
          </>
        </div>
      </main>
    </>
  );
}

// calc(100vh-)
