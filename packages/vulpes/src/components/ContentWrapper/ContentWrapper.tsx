import React from "react";

const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <main className="w-full max-w-[1280px] min-h-screen">{children}</main>;
};

export default ContentWrapper;
