import React from "react";

interface IframeProps {
  src: string;
  width?: string;
  height?: string;
  title?: string;
}

const Iframe: React.FC<IframeProps> = ({
  src,
  width = "98%",
  height = "415px",
  title = "iframe",
}) => {
  return (
    <iframe
      src={src}
      width={width}
      height={height}
      title={title}
      style={{ border: "none" }}
    />
  );
};

export default Iframe;
