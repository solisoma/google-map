import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";

export default function Modal({
  children,
  visible,
  onClose,
  initialState,
  yupValidator,
  classNames,
}) {
  const [close, setClose] = useState(true);
  const [state, setState] = useState({ ...initialState });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setClose(!visible);
    setState({ ...initialState });
  }, [visible, initialState]);

  const childrenWithProp = React.Children.map(children, (child) =>
    React.cloneElement(child, {
      submitting,
      state,
      close: async () => {
        await onClose(state, false);
        setState({ ...initialState });
        setClose(!close);
      },
    })
  );

  function handleOnChange(e) {
    const { name, value } = e.target;
    const newState = { ...state, [name]: value };
    setState(newState);
  }

  async function forceClose(validate) {
    if (validate) {
      setSubmitting(true);
      validate.preventDefault();
      try {
        // Make all error mesage invisible
        const errors = document.querySelectorAll(".form-error");
        const fields = document.querySelectorAll(".form-field");

        errors.forEach((error) => (error.style.display = "none"));
        fields.forEach((field) => field.classList.remove("form-field"));

        // Validate user input
        await yupValidator.validate(state);
        await onClose(state, true);
        setState({ ...initialState });
        setSubmitting(false);
        setClose(!close);
      } catch (e) {
        setSubmitting(false);
        const elem = document.getElementById(`${e.path}@error`);
        const field = document.querySelector(`[name="${e.path}"]`);
        field.classList.add("form-field");
        elem.innerText = e.errors[0];
        elem.style.display = "block";
      }
    } else {
      const errors = document.querySelectorAll(".form-error");
      const fields = document.querySelectorAll(".form-field");

      errors.forEach((error) => (error.style.display = "none"));
      fields.forEach((field) => field.classList.remove("form-field"));
      await onClose(state, false);
      setState({ ...initialState });
      setClose(!close);
    }
  }
  return (
    <div
      className={`z-[99] h-[100vh] w-[100vw] ${
        close ? "hidden" : "block"
      } right-0 bottom-0 top-0 left-0 bg-black bg-opacity-40 absolute flex flex-col items-center`}
      onChange={handleOnChange}
    >
      <div className="relative top-[10vh]">
        <button
          className="absolute right-3 bg-white"
          onClick={() => forceClose(false)}
        >
          <IoMdClose className="w-[6vh] h-[5vh]" />
        </button>
        <div
          className={`relative w-screen h-[75vh] top-9 py-1 px-2 overflow-hidden bg-white border-2 border-gray-300 my-6 md:rounded-lg md:w-[70vw] md:my-0 ${classNames}`}
        >
          <form className="h-[inherit] w-[inherit]" onSubmit={forceClose}>
            {childrenWithProp}
          </form>
        </div>
      </div>
    </div>
  );
}
