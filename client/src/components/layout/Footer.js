import React from "react";

export default function Footer() {
  return (
    <footer
      className="bg-dark text-white mt-5 p-3 text-center"
      style={{ position: "fixed", bottom: 0, width: "100%" }}
    >
      Copyright &copy; {new Date().getFullYear()} askDev
    </footer>
  );
}
