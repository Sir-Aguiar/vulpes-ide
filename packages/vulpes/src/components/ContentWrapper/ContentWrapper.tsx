import React from "react";

const ContentWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <main className={className ?? 'w-full max-w-[1280px] min-h-screen'}>
      {children}
    </main>
  );
};

export default ContentWrapper;
