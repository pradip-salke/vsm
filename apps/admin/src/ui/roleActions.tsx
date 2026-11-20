import { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { getActiveAdminMenuPath } from './navigation';

export type RoleAction = 'add' | 'edit' | 'delete' | 'export';
const PREFIX = '/_action-denied/';
export function actionKey(path: string, action: RoleAction) { return `${PREFIX}${encodeURIComponent(path)}/${action}`; }
export function actionAllowed(settings: string[] | null | undefined, path: string, action: RoleAction) {
  return !settings?.includes(actionKey(path, action));
}
export const roleActions: readonly RoleAction[] = ['add', 'edit', 'delete', 'export'];
export function supportedActionPaths(paths: string[], action: RoleAction) {
  return paths.filter(path =>
    (action !== 'export' && ['/masters/faculty', '/masters/recruiters', '/masters/internships', '/masters/testimonials'].includes(path)) ||
    (action !== 'add' && ['/enquiries/career', '/enquiries/enquiry', '/enquiries/application'].includes(path)) ||
    (action !== 'export' && (path.startsWith('/website/') || path === '/masters/hero' || path === '/masters/gallery')));
}
export function allRoleOptionsSelected(settings: string[], paths: string[]) {
  return paths.length > 0 && paths.every(path => settings.includes(path)) &&
    roleActions.every(action => supportedActionPaths(paths, action).every(path => actionAllowed(settings, path, action)));
}
export function setAllRoleOptions(settings: string[], paths: string[], enabled: boolean) {
  const selectedPaths = new Set(paths);
  const denied = new Set(roleActions.flatMap(action => supportedActionPaths(paths, action).map(path => actionKey(path, action))));
  const next = settings.filter(item => !selectedPaths.has(item) && !denied.has(item));
  return enabled ? [...new Set([...next, ...paths])] : [...new Set([...next, ...denied])];
}
export const RoleActionsContext = createContext<string[] | null>(null);
export function useRoleActions() { return useContext(RoleActionsContext); }
export function useWebsiteAction(action: RoleAction) {
  const settings = useRoleActions();
  const { pathname } = useLocation();
  if (!pathname.startsWith('/website/')) return true;
  return actionAllowed(settings, getActiveAdminMenuPath(pathname) ?? pathname, action);
}
