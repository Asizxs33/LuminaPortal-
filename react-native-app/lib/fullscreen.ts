// Detect capabilities rather than assuming every mobile browser supports fullscreen.
export function fullscreenState(doc: any, win?: any) {
  const standalone = !!win?.navigator?.standalone || !!win?.matchMedia?.('(display-mode: standalone)').matches;
  const active = standalone || !!(doc?.fullscreenElement || doc?.webkitFullscreenElement);
  const supported = !!((doc?.fullscreenEnabled && doc?.documentElement?.requestFullscreen) || (doc?.webkitFullscreenEnabled && doc?.documentElement?.webkitRequestFullscreen));
  return {active,supported,standalone};
}

export async function requestPageFullscreen(doc: any, win?: any) {
  const state=fullscreenState(doc,win);
  if(state.active || !state.supported)return state;
  const root=doc.documentElement;
  if(root.requestFullscreen)await root.requestFullscreen();
  else await root.webkitRequestFullscreen();
  return fullscreenState(doc,win);
}
