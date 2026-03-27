import { useEffect, useRef, useState } from "react";

const C = {
  bg: "#fef9f3",
  accent: "#6495ed",
  accentDim: "rgba(100,149,237,0.12)",
  floor: "#ff6b9d",
  dim: "#8b8b8b",
  border: "#e8ddd0",
};

export default function Warehouse3D({ data, floorPallets }) {
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data === "warehouse3d-ready") setReady(true);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (ready && iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "update-data",
          shelfData: data.map((s) => ({
            id: s.id,
            name: s.name,
            type: s.type,
            cap: s.cap,
            fMax: s.fMax,
            bMax: s.bMax,
            kMax: s.kMax,
            fE: s.fE,
            bE: s.bE,
            kE: s.kE,
            occ: s.occ,
            free: s.free,
            util: s.util,
          })),
          floorPallets,
        },
        window.location.origin
      );
    }
  }, [data, floorPallets, ready]);

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 52px)" }}>
      <iframe
        ref={iframeRef}
        src="/warehouse-3d.html"
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: C.bg,
        }}
        title="3D Warehouse Map"
      />
      {floorPallets > 0 && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 14,
            background: "rgba(5,8,15,0.95)",
            border: "1px solid " + C.floor + "44",
            padding: "12px 16px",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: 8,
              color: C.floor,
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            PALLETS ON FLOOR
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: C.floor,
              lineHeight: 1,
            }}
          >
            {floorPallets}
          </div>
        </div>
      )}
    </div>
  );
}
