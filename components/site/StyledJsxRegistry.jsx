"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";

// Puts the <style jsx> CSS into the server-rendered HTML, so the page is styled
// from the first paint instead of flashing unstyled until JavaScript has loaded.
export default function StyledJsxRegistry({ children }) {
  const [registry] = useState(() => createStyleRegistry());

  useServerInsertedHTML(() => {
    const styles = registry.styles();
    registry.flush();
    return <>{styles}</>;
  });

  return <StyleRegistry registry={registry}>{children}</StyleRegistry>;
}
