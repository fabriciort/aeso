import React, { useEffect, useRef } from "react";

function AstroView({ target }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (target && iframe) {
      const messageHandler = () => {
        iframe.contentWindow.postMessage({ target }, "*");
      };
      iframe.addEventListener("load", messageHandler);
      return () => iframe.removeEventListener("load", messageHandler);
    }
  }, [target]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <iframe
        ref={iframeRef}
        src={`https://mast.stsci.edu/portal/Mashup/Clients/AstroView/AstroView.html?search=${target}`}
        width="100%"
        height="100%"
        title="AstroView"
        frameBorder="0"
        style={{ border: "none", position: "absolute", top: 0, left: 0 }}
      ></iframe>
    </div>
  );
}

export default AstroView;
