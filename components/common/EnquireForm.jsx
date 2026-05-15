import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { AiOutlineCloseCircle } from "react-icons/ai";
import Button from "../layout/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import { useLeadStore } from "@/store/useLeadStore";

const EnquireModal = ({
  isOpen,
  onClose,
  modalTitle = "Enquire Now",
  projectName = "-",
  formSource = "Website Modal",
  brochureUrl = "",
  onFormSubmitSuccess,
  type,
}) => {
  console.log({ onFormSubmitSuccess });
  const router = useRouter();
  const { postWebsiteLead, loading, error, success, resetStatus } =
    useLeadStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const sendEmaill = async (data) => {
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.status === 200;
    } catch (error) {
      console.error("Email Error:", error);
      return false;
    }
  };

  const onSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      message: formData.message || "",
      FormSource: formSource,
      project_name: formData.project,
      // ProjectType: type || "-",
    };
    // console.log("FORM DATA:", formData);
    try {
      // 🚀 Run both APIs in parallel
      const [leadRes, emailRes] = await Promise.all([
        postWebsiteLead(payload),
        sendEmaill(payload),
      ]);

      if (leadRes && emailRes) {
        reset();
        onClose();
        resetStatus();

        if (typeof onFormSubmitSuccess === "function") {
          onFormSubmitSuccess(true);
        }

        if (brochureUrl) {
          const a = document.createElement("a");
          a.href = brochureUrl;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.download = "";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          router.push("/thank-you");
        }
      } else {
        alert("Something failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };
  const countryCodes = [
    { code: "+91", label: "🇮🇳 India" },
    { code: "+1", label: "🇺🇸 USA" },
    { code: "+44", label: "🇬🇧 UK" },
    { code: "+971", label: "🇦🇪 UAE" },
    { code: "+61", label: "🇦🇺 Australia" },
    { code: "+81", label: "🇯🇵 Japan" },
    { code: "+49", label: "🇩🇪 Germany" },
    { code: "+33", label: "🇫🇷 France" },
    { code: "+86", label: "🇨🇳 China" },
    { code: "+92", label: "🇵🇰 Pakistan" },
    { code: "+880", label: "🇧🇩 Bangladesh" },
    { code: "+94", label: "🇱🇰 Sri Lanka" },
    { code: "+977", label: "🇳🇵 Nepal" },
    { code: "+65", label: "🇸🇬 Singapore" },
    { code: "+60", label: "🇲🇾 Malaysia" },
    { code: "+7", label: "🇷🇺 Russia" },
    { code: "+39", label: "🇮🇹 Italy" },
    { code: "+34", label: "🇪🇸 Spain" },
    { code: "+27", label: "🇿🇦 South Africa" },
    { code: "+55", label: "🇧🇷 Brazil" },
  ];
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 w-full h-full z-50"
    >
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg lg:max-w-[33vw]  h-auto overflow-hidden  bg-[#3d3c3d67] drop-shadow-2xl">
          {/* Blurred gradient background */}
          <div className="absolute -top-1/2 -left-1/2   w-[600px] h-[450px] bg-gradient-to-br from-[#fff] to-[#fff] opacity-70 blur-[100px] z-0" />

          {/* Form Card */}
          <Dialog.Panel className="relative z-10 md:p-8 p-4 lg:p-[1.7vw]  text-black backdrop-blur-2xl ">
            {/* Close Button */}
            <button
              onClick={() => {
                onClose();
                reset();
              }}
              className="absolute top-4 right-4 text-[#ffffffa9] cursor-pointer hover:rotate-180 transition-all duration-500 ease-in-out hover:text-[#fff]"
            >
              <AiOutlineCloseCircle className="h-8 md:w-[2rem] md:h-[2rem]  lg:h-[2vw] lg:w-[2vw] w-8" />
            </button>

            {/* Logo */}
            <div className=" lg:h-[4vw] h-[5rem] md:h-[3rem] mx-auto  mb-1 lg:mb-[0.5vw] w-full">
              <Image
                src="/icons/logo.svg"
                alt="Logo"
                width={100}
                priority
                height={100}
                className="h-full w-full"
              />
            </div>

            {/* Title */}
            <Dialog.Title
              className="text-[1.2rem]   
  font-[500]  lg:text-[1.133vw] md:text-[25px] capitalize  cinzel text-[#ffffffcc] md:my-[1vw] my-5 text-center"
            >
              {modalTitle}
            </Dialog.Title>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5 lg:gap-[1vw] md:gap-5"
            >
              <input
                placeholder="Your Name"
                {...register("name", { required: "Name is required" })}
                className="border-b text-[0.875rem]   font-[400]  lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#ffffffa9] bg-transparent placeholder-[#ffffffa9] p-2 outline-none text-[#ffffffa9]"
              />
              {errors.name && (
                <p className="text-red-500 text-sm lg:-mt-[1.8vw] md:-mt-5 -mt-5">
                  {errors.name.message}
                </p>
              )}

              <input
                placeholder="Your Email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/, message: "Invalid email" },
                })}
                className="border-b text-[0.875rem]   font-[400]  lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#ffffffa9] bg-transparent placeholder-[#ffffffa9] p-2 outline-none text-[#ffffffa9]"
              />
              {errors.email && (
                <p className="text-red-500 text-sm lg:-mt-[1.8vw] md:-mt-5 -mt-5">
                  {errors.email.message}
                </p>
              )}

              <div className="flex items-center border-b border-[#ffffffa9]">
                {/* Country Code Dropdown */}
                <select
                  {...register("countryCode", { required: true })}
                  className="bg-transparent text-[#ffffffa9] outline-none px-2 w-36"
                >
                  {countryCodes.map((country, index) => (
                    <option
                      key={index}
                      value={country.code}
                      className="text-black"
                    >
                      {country.label} {country.code}
                    </option>
                  ))}
                </select>

                {/* Phone Input */}
                <input
                  placeholder="Phone Number"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{6,14}$/,
                      message: "Invalid phone number",
                    },
                  })}
                  className="w-full bg-transparent p-2 outline-none text-[#ffffffa9]"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm lg:-mt-[1.8vw] md:-mt-5 -mt-5">
                  {errors.phone.message}
                </p>
              )}

              {projectName && projectName !== "-" ? (
                <input
                  type="hidden"
                  value={projectName}
                  {...register("project", { required: true })}
                />
              ) : (
                <div className="relative">
                  <select
                    {...register("project", {
                      required: "Please select a project",
                    })}
                    className="w-full border-b border-[#ffffffa9] bg-transparent p-2 pr-8 text-[#ffffffa9] appearance-none outline-none"
                  >
                    <option value="" className="text-black">
                      Select Project
                    </option>
                    <option value="Yoo Pristine" className="text-black">
                     Yoo Pristine
                    </option>
                    <option value="Pristine Kyra" className="text-black">
                      Pristine Kyra
                    </option>
                  </select>

                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none">
                    ▼
                  </span>
                </div>
              )}
              {errors.project && (
                <p className="text-red-500 text-sm -mt-4">
                  {errors.project.message}
                </p>
              )}

              <textarea
                placeholder="Your Message"
                {...register("message", { required: "Message is required" })}
                rows={2}
                className="border-b text-[0.875rem]   font-[400] uppercase lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#ffffffa9] bg-transparent placeholder-[#ffffffa9] p-2 outline-none text-[#ffffffa9]"
              />
              {errors.message && (
                <p className="text-red-500 text-sm lg:-mt-[1.8vw] md:-mt-5 -mt-5">
                  {errors.message.message}
                </p>
              )}
              <div className="text-sm text-[#ffffffa9] leading-relaxed">
                <input
                  type="checkbox"
                  {...register("consent", { required: "Consent is required" })}
                  className="mr-2 scale-125"
                />
                I authorise Pristine Properties and its representative to Call,
                SMS, RCS, Email or Whatsapp me about its programmes and offers.
                This consent overrides any registration for DNC/NDNC.
              </div>

              {errors.consent && (
                <p className="text-red-500 text-sm">{errors.consent.message}</p>
              )}
              <div className="pt-4 flex justify-center">
                <button type="submit" disabled={loading}>
                  <Button title={loading ? "Submitting..." : "Submit"} />
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default EnquireModal;
