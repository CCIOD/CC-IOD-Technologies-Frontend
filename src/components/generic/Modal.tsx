import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment, ReactNode } from "react";
import { RiCloseLine } from "react-icons/ri";

type Props = {
  isOpen: boolean;
  toggleModal: (param: boolean) => void;
  title?: string;
  btnClose?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  backdrop?: boolean;
  closeOnClickOutside?: boolean;
  children: ReactNode;
};

const sizes = {
  xs: "!w-12/12 sm:!w-5/12 lg:!w-4/12 !min-h-[10rem]",
  sm: "!w-12/12 sm:!w-8/12 md:!w-5/12 !min-h-[12.5rem]",
  md: "!w-8/12 !min-h-80",
  lg: "!w-10/12 !min-h-[32rem]",
  xl: "!w-12/12 !min-h-[40rem]",
  full: "!w-screen !min-h-screen",
};

export const Modal: FC<Props> = ({
  isOpen,
  toggleModal,
  title,
  btnClose = true,
  size = "lg",
  backdrop = false,
  closeOnClickOutside = false,
  children,
}) => {
  const backdropBg = backdrop ? "bg-black/50 dark:bg-black/30" : "";
  const contentPadding = size !== "full" ? "p-4" : "";
  const contentRounded = size !== "full" ? "rounded-md" : "";
  const handleToggle = () => {
    if (closeOnClickOutside) toggleModal(false);
  };
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => handleToggle()} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 ${backdropBg} `} aria-hidden="true" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className={`flex-center min-h-full ${contentPadding}`}>
              <Dialog.Panel
                className={`app-bg app-text w-full shadow-md ${sizes[size]} ${
                  size === "lg" ? "p-6 pb-10" : "p-4 pb-8"
                } ${contentRounded}`}
              >
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-semibold text-lg">
                    {title}
                  </Dialog.Title>
                  {btnClose && (
                    <button
                      type="button"
                      className="opacity-70 hover:opacity-100"
                      onClick={() => toggleModal(false)}
                    >
                      <RiCloseLine size={24} />
                    </button>
                  )}
                </div>
                <div className="h-full mt-2">{children}</div>
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
