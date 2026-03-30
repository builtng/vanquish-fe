"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import PromptModal from "@/components/PromptModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "danger",
    onConfirm: () => {},
    onClose: () => {},
  });

  const [promptConfig, setPromptConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    placeholder: "",
    defaultValue: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "info",
    inputType: "text",
    options: [], // Add this for select type
    onConfirm: () => {},
    onClose: () => {},
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      const config = typeof options === "string" ? { message: options } : options;
      
      setConfirmConfig({
        isOpen: true,
        title: config.title || "Confirm Action",
        message: config.message || "",
        confirmText: config.confirmText || "Confirm",
        cancelText: config.cancelText || "Cancel",
        type: config.type || "danger",
        confirmButtonColor: config.confirmButtonColor,
        onConfirm: () => {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onClose: () => {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const prompt = useCallback((options) => {
    return new Promise((resolve) => {
      const config = typeof options === "string" ? { message: options } : options;
      
      setPromptConfig({
        isOpen: true,
        title: config.title || "Enter Information",
        message: config.message || "",
        placeholder: config.placeholder || "",
        defaultValue: config.defaultValue || "",
        confirmText: config.confirmText || "Confirm",
        cancelText: config.cancelText || "Cancel",
        type: config.type || "info",
        inputType: config.inputType || "text",
        options: config.options || [], // Support select options
        confirmButtonColor: config.confirmButtonColor,
        onConfirm: (value) => {
          setPromptConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(value);
        },
        onClose: () => {
          setPromptConfig((prev) => ({ ...prev, isOpen: false }));
          resolve(null);
        },
      });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ confirm, prompt }}>
      {children}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={confirmConfig.onClose}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
        type={confirmConfig.type}
        confirmButtonColor={confirmConfig.confirmButtonColor}
      />
      <PromptModal
        isOpen={promptConfig.isOpen}
        onClose={promptConfig.onClose}
        onConfirm={promptConfig.onConfirm}
        title={promptConfig.title}
        message={promptConfig.message}
        placeholder={promptConfig.placeholder}
        defaultValue={promptConfig.defaultValue}
        confirmText={promptConfig.confirmText}
        cancelText={promptConfig.cancelText}
        type={promptConfig.type}
        inputType={promptConfig.inputType}
        options={promptConfig.options}
        confirmButtonColor={promptConfig.confirmButtonColor}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}
