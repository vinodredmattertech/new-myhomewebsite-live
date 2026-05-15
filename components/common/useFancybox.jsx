import { useState, useEffect } from "react";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export default function useFancybox(options = {}) {
  const [root, setRoot] = useState(null);
  useEffect(() => {
    if (root) {
      Fancybox.bind(root, "[data-fancybox]", {
        Hash: false,
        ...options,
      });
      return () => Fancybox.unbind(root, "[data-fancybox]");
    }
  }, [root, options]);
  return [setRoot];
}