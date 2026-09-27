/**
 * The device frames. Each is a real iframe at the device's true width, so
 * the components' media and container queries fire exactly as on a phone,
 * tablet or laptop — then scaled down visually when the screen is too
 * narrow to show it 1:1 (the scale is printed on the frame).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Route } from './route';
import { DEVICES, devicesFor, themesFor } from '../lib/settings';
import type { Device, Settings } from '../lib/settings';
import { frameHash, isWbMessage } from '../lib/messages';
import type { FrameToShell, ShellToFrame } from '../lib/messages';

const GAP = 16;
const LABEL = 28;
const MIN_ROW = 320;
/** The screen's border (--border-width-sm) on both sides — drawn outside the frame, never over it */
const BEZEL = 2;

interface FrameSpec {
  fid: string;
  device: Device;
  theme: 'light' | 'dark';
  scale: number;
}

/** Fit one row of devices into `width`: phone/tablet stay 1:1 where possible, desktop takes the rest. */
function fitRow(devices: Device[], width: number): number[] {
  // Each frame's bezel and the gaps between frames don't scale
  const fixed = GAP * (devices.length - 1) + BEZEL * devices.length;
  const natural = devices.reduce((a, d) => a + DEVICES[d].width, 0);
  if (natural + fixed <= width) return devices.map(() => 1);
  const smallWidth = devices.filter((d) => d !== 'desktop').reduce((a, d) => a + DEVICES[d].width, 0);
  const room = width - smallWidth - fixed;
  if (devices.includes('desktop') && smallWidth > 0 && room >= 480) {
    return devices.map((d) => (d === 'desktop' ? room / DEVICES.desktop.width : 1));
  }
  const uniform = Math.min(1, (width - fixed) / natural);
  return devices.map(() => uniform);
}

/**
 * Light and dark sit side by side when that keeps frames at ≥60% size;
 * otherwise each theme gets its own row.
 */
function layout(devices: Device[], themes: Array<'light' | 'dark'>, width: number): { specs: FrameSpec[]; rows: number } {
  const all = themes.flatMap((theme) => devices.map((device) => ({ device, theme })));
  if (themes.length > 1) {
    const oneRow = fitRow(all.map((f) => f.device), width);
    if (Math.min(...oneRow) >= 0.6) {
      return { specs: all.map((f, i) => ({ fid: `${f.device}-${f.theme}`, ...f, scale: oneRow[i]! })), rows: 1 };
    }
  }
  const scales = fitRow(devices, width);
  return {
    specs: all.map((f) => ({ fid: `${f.device}-${f.theme}`, ...f, scale: scales[devices.indexOf(f.device)]! })),
    rows: themes.length,
  };
}

/**
 * An iframe whose URL is changed with `location.replace()` after the first
 * load. Changing `src` instead would give every frame its own entry in the
 * browser history: Back would then step the frames to the previous
 * component while the shell (title, sidebar) stayed put.
 */
function DeviceFrame({
  src,
  title,
  style,
  frameRef,
}: {
  src: string;
  title: string;
  style: CSSProperties;
  frameRef: (el: HTMLIFrameElement | null) => void;
}) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [initialSrc] = useState(src);
  const applied = useRef(src);
  // Safari paints a brand-new iframe's blank page white before the frame
  // loads — a white flash in a dark frame on Replay or a theme switch. Keep
  // a new frame invisible (its screen already wears the theme) until then.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (src === applied.current) return;
    applied.current = src;
    ref.current?.contentWindow?.location.replace(src);
  }, [src]);
  return (
    <iframe
      ref={(el) => {
        ref.current = el;
        frameRef(el);
      }}
      title={title}
      src={initialSrc}
      style={loaded ? style : { ...style, visibility: 'hidden' }}
      onLoad={() => setLoaded(true)}
    />
  );
}

export interface StageEvents {
  onErrors: (fid: string, message: string) => void;
  onAxe: (msg: Extract<FrameToShell, { type: 'wb:axe' }>) => void;
  onKey: (key: string) => void;
  onNavigate: (kind: string, id: string) => void;
}

export function Stage({
  route,
  story,
  settings,
  reloadKey,
  axeRun,
  events,
}: {
  route: Route;
  story: string;
  settings: Settings;
  reloadKey: number;
  /** The accessibility check in progress (0 = none) */
  axeRun: number;
  events: StageEvents;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const frames = useRef(new Map<string, HTMLIFrameElement>());

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;
    // The stage is the flexible middle of the main column; frames fill it.
    const measure = () => {
      const cs = getComputedStyle(el);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      setBox({ width: el.clientWidth - padX, height: el.clientHeight - padY + GAP * 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const themes = themesFor(settings.theme);
  const { specs, rows } = box.width ? layout(devicesFor(settings.width), themes, box.width) : { specs: [], rows: 1 };
  const rowHeight = Math.max(MIN_ROW, (box.height - GAP * (rows + 1)) / rows - LABEL - BEZEL);

  // What each frame should be showing right now
  const views = new Map(
    specs.map((spec) => [
      spec.fid,
      frameHash({
        kind: route.kind,
        id: route.id,
        story,
        theme: spec.theme,
        motion: settings.motion,
        outlines: settings.outlines,
        stretch: settings.stretch,
        rtl: settings.rtl,
        fid: spec.fid,
      }),
    ]),
  );
  const viewsRef = useRef(views);
  viewsRef.current = views;

  // Messages from frames
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const axeRunRef = useRef(axeRun);
  axeRunRef.current = axeRun;
  const linked = story === 'all';
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !isWbMessage(e.data)) return;
      const msg = e.data as FrameToShell;
      // Only frames on the stage now — not one just removed by a theme or width switch
      const sender = [...frames.current.entries()].find(([, f]) => f.contentWindow === e.source)?.[0];
      if (!sender) return;
      if (msg.type === 'wb:key') return eventsRef.current.onKey(msg.key);
      if (msg.type === 'wb:navigate') return eventsRef.current.onNavigate(msg.kind, msg.id);
      // Everything else describes a view; drop it if the frame has moved on
      if (msg.fid !== sender || msg.view !== viewsRef.current.get(sender)) return;
      if (msg.type === 'wb:scroll' && linked) {
        const out: ShellToFrame = { type: 'wb:scrollTo', story: msg.story, offset: msg.offset };
        frames.current.forEach((f, fid) => {
          if (fid !== msg.fid) f.contentWindow?.postMessage(out, window.location.origin);
        });
      } else if (msg.type === 'wb:error') eventsRef.current.onErrors(msg.fid, msg.message);
      else if (msg.type === 'wb:axe') eventsRef.current.onAxe(msg);
      else if (msg.type === 'wb:rendered' && axeRunRef.current) {
        // A frame that was still loading when the check started missed the
        // request — ask again now it's ready (frames ignore repeats).
        const out: ShellToFrame = { type: 'wb:runAxe', run: axeRunRef.current };
        (e.source as Window).postMessage(out, window.location.origin);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [linked]);

  // "Check accessibility" → every frame runs axe on itself
  useEffect(() => {
    if (!axeRun) return;
    const msg: ShellToFrame = { type: 'wb:runAxe', run: axeRun };
    frames.current.forEach((f) => f.contentWindow?.postMessage(msg, window.location.origin));
  }, [axeRun]);

  const base = `${import.meta.env.BASE_URL}frame.html`;

  return (
    <div ref={hostRef} className="wb-stage">
      {specs.map((spec) => {
        const device = DEVICES[spec.device];
        const visualWidth = Math.floor(device.width * spec.scale);
        return (
          <figure key={spec.fid} className="wb-device" style={{ width: visualWidth + BEZEL }}>
            <figcaption className="wb-device__label">
              <span>
                {device.label} · {device.width}px · {spec.theme === 'dark' ? 'Dark' : 'Light'}
              </span>
              {spec.scale < 0.995 && <span className="wb-device__scale">{Math.round(spec.scale * 100)}%</span>}
            </figcaption>
            {/* The screen wears the frame's theme, so while a frame (re)loads —
                Replay, or a theme switch that adds a frame — its empty screen
                is already the right color instead of flashing the shell's */}
            <div className="wb-device__screen" data-theme={spec.theme} style={{ width: visualWidth, height: rowHeight }}>
              <DeviceFrame
                key={`${spec.fid}-${reloadKey}`}
                frameRef={(el) => {
                  if (el) frames.current.set(spec.fid, el);
                  else frames.current.delete(spec.fid);
                }}
                title={`${device.label} ${spec.theme} preview`}
                src={base + views.get(spec.fid)!}
                style={{
                  width: device.width,
                  height: rowHeight / spec.scale,
                  transform: `scale(${spec.scale})`,
                }}
              />
            </div>
          </figure>
        );
      })}
    </div>
  );
}
