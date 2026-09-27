/**
 * The shell and each device frame talk over postMessage. Frames are
 * same-origin iframes, but messages keep them decoupled: a frame never
 * reaches into the shell's React tree, and vice versa.
 */

export interface FrameParams {
  kind: string;
  id: string;
  /**
   * Story export name, 'all', or '' for "the first story" — the frame
   * resolves '' itself, so the shell never has to wait for the story list
   * (and never loads every overlay at once) before pointing a frame.
   */
  story: string;
  theme: 'light' | 'dark';
  motion: boolean;
  outlines: boolean;
  stretch: boolean;
  rtl: boolean;
  /** Frame id, echoed back on every message */
  fid: string;
}

export function frameHash(p: FrameParams): string {
  const q = new URLSearchParams({
    story: p.story,
    theme: p.theme,
    motion: p.motion ? '1' : '0',
    outlines: p.outlines ? '1' : '0',
    stretch: p.stretch ? '1' : '0',
    rtl: p.rtl ? '1' : '0',
    fid: p.fid,
  });
  return `#/${p.kind}/${p.id}?${q.toString()}`;
}

export function parseFrameHash(hash: string): FrameParams {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [kind = 'component', ...rest] = path.split('/');
  const q = new URLSearchParams(query);
  return {
    kind,
    id: rest.join('/'),
    story: q.get('story') ?? 'all',
    theme: q.get('theme') === 'dark' ? 'dark' : 'light',
    motion: q.get('motion') !== '0',
    outlines: q.get('outlines') === '1',
    stretch: q.get('stretch') === '1',
    rtl: q.get('rtl') === '1',
    fid: q.get('fid') ?? '',
  };
}

export interface AxeIssue {
  /** axe rule id, e.g. "color-contrast" */
  id: string;
  impact: string;
  help: string;
  count: number;
  /** Labels of the states the problem appears in (none on store pages and sheets) */
  states: string[];
  targets: string[];
}

/**
 * `view` is the frame's hash (frameHash) when the message was produced.
 * The shell drops any message whose view isn't what that frame should be
 * showing now — an error, scroll or accessibility result from the previous
 * component (or theme, or test mode) that arrives late is never pinned on
 * the current one.
 */
export type FrameToShell =
  | { type: 'wb:scroll'; fid: string; view: string; story: string; offset: number }
  | { type: 'wb:error'; fid: string; view: string; message: string }
  /** Content has loaded and rendered (not just the "Loading…" placeholder) */
  | { type: 'wb:rendered'; fid: string; view: string }
  | { type: 'wb:axe'; fid: string; view: string; run: number; issues: AxeIssue[]; failed?: string }
  | { type: 'wb:key'; key: string }
  | { type: 'wb:navigate'; kind: string; id: string };

export type ShellToFrame =
  | { type: 'wb:scrollTo'; story: string; offset: number }
  /** `run` numbers each check, so a frame never answers the same request twice */
  | { type: 'wb:runAxe'; run: number };

export const isWbMessage = (d: unknown): d is { type: string } =>
  typeof d === 'object' && d !== null && typeof (d as { type?: unknown }).type === 'string' && (d as { type: string }).type.startsWith('wb:');
