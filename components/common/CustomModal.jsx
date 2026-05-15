import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { AiOutlineCloseCircle } from "react-icons/ai";
import axios from "axios";
import { useRouter } from "next/router";
import Image from "next/image";
import { useLeadStore } from "@/store/useLeadStore";

import Link from "next/link";
import { useProjectStore } from "@/store/useProjectListing";

const EnquireModal = ({
  projectApiKey,
  isOpen,
  onClose,
  modalTitle = "Enquire Now",
  projectName = "-",
  formSource = "Website Modal",
  shouldRedirect = true, // ✅ NEW
  onSuccess,
}) => {
  console.log({ projectApiKey });
  const router = useRouter();
  console.log(router);
  const route = [
    "/project/ongoing/[url]",
    "/project/residential/[url]",
    "/project/commercial/[url]",
  ];
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { postWebsiteLead, loading, error, success, resetStatus } =
    useLeadStore();
  const { Projectdata, fetchProjectData } = useProjectStore();

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // if (!Projectdata?.length) return null;

  const sendEmaill = async (data) => {
    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      ...formData,
      project_name: projectName,
      FormSource: formSource,
      ApiKey: projectApiKey || formData.projects,
    };

    const [leadRes, emailRes] = await Promise.all([
      postWebsiteLead(payload),
      sendEmaill(payload),
    ]);

    const { error: currentError, success: currentSuccess } =
      useLeadStore.getState();
    if (currentSuccess && !currentError) {
      reset();
      resetStatus();

      // 🔔 Notify parent (Floorplan page)
      onSuccess();

      onClose();

      // ✅ Redirect only when allowed
      if (shouldRedirect) {
        router.push("/thank-you");
      }
    }
  };

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
        <div className="relative w-full max-w-lg lg:max-w-[33vw]  h-auto overflow-hidden  bg-[#fff] drop-shadow-2xl">
          {/* Blurred gradient background */}
          <div className="absolute -top-1/2 -left-1/2   w-[600px] h-[450px] bg-gradient-to-br from-[#BE9C58] to-[#BE9C58] opacity-70 blur-[100px] z-0" />

          {/* Form Card */}
          <Dialog.Panel className="relative z-10 md:p-8 p-4 lg:p-[1.7vw]  text-white backdrop-blur-2xl ">
            {/* Close Button */}
            <button
              onClick={() => {
                onClose();
                reset();
              }}
              className="absolute top-4 right-4 text-[#7B766C] cursor-pointer hover:rotate-180 transition-all duration-500 ease-in-out hover:text-[#C29B5C]"
            >
              <AiOutlineCloseCircle className="h-8 md:w-[2rem] md:h-[2rem]  lg:h-[2vw] lg:w-[2vw] w-8" />
            </button>

            {/* Logo */}
            <div className=" lg:h-[5vw] h-[4rem] md:h-[5rem]  mb-5 lg:mb-[1vw] w-full">
              <Image
                src="/icons/logoFooter.svg"
                alt="Logo"
                width={1000}
                height={1000}
                className="w-full h-full"
              />
            </div>

            {/* Title */}
            <Dialog.Title
              className="text-[1.5rem]   
  font-[500]  lg:text-[1.333vw] md:text-[25px] uppercase  PPEditorialOld text-[#7B766C] md:mb-[2vw] mb-6 text-center"
            >
              {modalTitle}
            </Dialog.Title>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5 lg:gap-[2vw] md:gap-5"
            >
              <input
                placeholder="Your Name"
                {...register("name", { required: "Name is required" })}
                className="border-b text-[0.875rem]   font-[400]  lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#7B766C] bg-transparent placeholder-[#7B766C] p-2 outline-none text-[#7B766C]"
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
                className="border-b text-[0.875rem]   font-[400]  lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#7B766C] bg-transparent placeholder-[#7B766C] p-2 outline-none text-[#7B766C]"
              />
              {errors.email && (
                <p className="text-red-500 text-sm lg:-mt-[1.8vw] md:-mt-5 -mt-5">
                  {errors.email.message}
                </p>
              )}

              {Projectdata?.length > 0 && !route.includes(router.pathname) && (
                <div className="w-full">
                  <select
                    {...register("projects", {
                      required: "Please select a project",
                    })}
                    className="border-b text-[0.875rem] w-full  font-[400]  lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#162847] bg-transparent placeholder-[#162847] p-2 outline-none text-[#162847]"
                  >
                    <option value="">Select Project</option>

                    {Projectdata?.filter(
                      (item) => item?.attributes?.projectApiKey,
                    ).map((item, index) => (
                      <option key={index} value={item.attributes.projectApiKey}>
                        {item.attributes.projectTitle}
                      </option>
                    ))}
                  </select>

                  {errors.project && (
                    <span className="text-red-500 content Montserrat">
                      {errors.project.message}
                    </span>
                  )}
                </div>
              )}

              <input
                placeholder="Phone Number"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Invalid phone number",
                  },
                })}
                className="border-b text-[0.875rem]   font-[400]  lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#162847] bg-transparent placeholder-[#162847] p-2 outline-none text-[#7B766C]"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm lg:-mt-[1.8vw] md:-mt-5 -mt-5">
                  {errors.phone.message}
                </p>
              )}

              {/* <textarea
                placeholder="Your Message"
                {...register("message", { required: "Message is required" })}
                rows={4}
                className="border-b text-[0.875rem]   font-[400] uppercase lg:text-[0.729vw]  tracking-[2px]   OutfitRegular border-[#162847] bg-transparent placeholder-[#162847] p-2 outline-none text-[#162847]"
              />
              {errors.message && (
                <p className="text-red-500 text-sm lg:-mt-[1.8vw] md:-mt-5 -mt-5">
                  {errors.message.message}
                </p>
              )} */}

              {/* <div className="flex flex-col items-start mt-3 mb-1 px-1">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent-checkbox"
                    {...register("consent", {
                      required: "Please provide your consent to proceed.",
                    })}
                    className="mt-1 w-4 h-4 accent-[#162847] cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="consent-checkbox"
                    className="text-[0.75rem] lg:text-[0.7vw] font-[400] OutfitRegular text-[#162847] cursor-pointer leading-tight select-none"
                  >
                    I agree to the{" "}
                    <Link href="/privacy-policy" className="underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms-and-conditions" className="underline">
                      Terms & Conditions
                    </Link>{" "}
                    to receive messages from  Properties via SMS,
                    WhatsApp, and RCS. Message & data rates may apply
                  </label>
                </div>

                {errors.consent && (
                  <p className="text-red-500 content Montserrat ">
                    {errors.consent?.message}
                  </p>
                )}
              </div> */}

              <div className="pt-4 flex mx-auto lg:max-w-[20vw] max-w-[90%] justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mx-auto cursor-pointer items-center lg:gap-[1vw] gap-2 border border-[#BE9C58] rounded-full lg:py-[0.5vw] lg:px-[2vw] py-2 px-3  flex justify-center"
                >
                  <div className="content Avenir text-[#BE9C58]">
                    {loading ? "Submitting..." : "Submit"}
                  </div>
               
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
