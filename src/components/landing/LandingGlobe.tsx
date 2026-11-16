import ScrollReveal from "./ScrollReveal";
import { RouteGlobe, type Place, type GlobeTheme } from "../ui/route-globe";

const HUB: Place = {
  name: "Global Relay Hub",
  lon: -0.13,
  lat: 51.5,
};

const WORLD_DESTINATIONS: Place[] = [
  { name: "New York", lon: -74.0, lat: 40.71, note: "Direct P2P · 38ms" },
  { name: "San Francisco", lon: -122.42, lat: 37.77, note: "Direct P2P · 64ms" },
  { name: "Tokyo", lon: 139.69, lat: 35.69, note: "P2P Stream · 85ms" },
  { name: "Singapore", lon: 103.82, lat: 1.35, note: "Direct Route · 72ms" },
  { name: "Mumbai", lon: 72.88, lat: 19.08, note: "High Speed · 52ms" },
  { name: "Dubai", lon: 55.27, lat: 25.2, note: "Direct Route · 44ms" },
  { name: "Sydney", lon: 151.21, lat: -33.87, note: "P2P Tunnel · 110ms" },
  { name: "São Paulo", lon: -46.63, lat: -23.55, note: "Direct P2P · 98ms" },
  { name: "Cape Town", lon: 18.42, lat: -33.92, note: "Fast Relay · 92ms" },
  { name: "Nairobi", lon: 36.82, lat: -1.29, note: "Direct P2P · 68ms" },
  { name: "Frankfurt", lon: 8.68, lat: 50.11, note: "Zero Hops · 12ms" },
];

const THEME: GlobeTheme = {
  ground: "transparent",
  land: "#1e293b",
  arc: "#2563eb",
  glow: "rgba(37, 99, 235, 0.08)",
  text: "#0f172a",
  muted: "#64748b",
};

export default function LandingGlobe() {
  return (
    <div className="lp-globe-section">
      <ScrollReveal className="lp-globe-card" delay="0s">
        {/* Left Column: Content */}
        <div className="lp-globe-content"> 

          <h2 className="lp-globe-h2">Share files from anywhere to anywhere</h2>

          <p className="lp-globe-desc">
            Send documents, high-res photos, 4K videos, and massive folders
            seamlessly across the world. No cloud uploads, no geographic boundaries,
            and no size restrictions — just direct end-to-end encrypted transfer
            between any two devices.
          </p>

          <ul className="lp-globe-checklist">
            <li>
              <div className="lp-globe-check-icon">✓</div>
              <div>
                <strong>Direct Peer-to-Peer Tunnels</strong>
                <span>Data streams straight between browsers at line speed without intermediate cloud hops.</span>
              </div>
            </li>
            <li>
              <div className="lp-globe-check-icon">✓</div>
              <div>
                <strong>Zero Cloud Storage Retention</strong>
                <span>Files never touch third-party servers or disks. Only the sender and recipient hold decryption keys.</span>
              </div>
            </li>
            <li>
              <div className="lp-globe-check-icon">✓</div>
              <div>
                <strong>Worldwide Relay Fallback</strong>
                <span>Automatic STUN/TURN traversal guarantees connectivity across firewalls, NATs, and restricted networks.</span>
              </div>
            </li>
          </ul> 
        </div>

        {/* Right Column: 3D Globe Graph */}
        <div className="lp-globe-visual">
          <RouteGlobe
            hub={HUB}
            places={WORLD_DESTINATIONS}
            theme={THEME}
            className="lp-route-globe"
          />
        </div>
      </ScrollReveal>
    </div>
  );
}
