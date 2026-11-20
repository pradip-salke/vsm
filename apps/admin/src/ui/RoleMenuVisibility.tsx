import { Fragment } from 'react';
import { adminMenu, isMenuLeaf, type AdminMenuNode } from './navigation';
import { actionAllowed, actionKey, allRoleOptionsSelected, roleActions, setAllRoleOptions, supportedActionPaths, type RoleAction } from './roleActions';

export function RoleMenuVisibility({ value, onChange }: { value: string[]; onChange: (paths: string[]) => void }) {
  function paths(items: AdminMenuNode[]): string[] { return items.flatMap(item => isMenuLeaf(item) ? [item.path] : paths(item.children)); }
  function toggle(label: string, selectedPaths: string[]) {
    return <input type="checkbox" aria-label={`Show ${label}`} checked={selectedPaths.length > 0 && selectedPaths.every(path => value.includes(path))} onChange={event => onChange(event.target.checked ? [...new Set([...value, ...selectedPaths])] : value.filter(path => !selectedPaths.includes(path)))} />;
  }
  function actionToggle(label: string, selectedPaths: string[], action: RoleAction) {
    const supportedPaths = supportedActionPaths(selectedPaths, action);
    if (!supportedPaths.length) return '—';
    return <input type="checkbox" aria-label={`${action} ${label}`} checked={supportedPaths.every(path => actionAllowed(value, path, action))} onChange={event => {
      const denied = supportedPaths.map(path => actionKey(path, action));
      onChange(event.target.checked ? value.filter(item => !denied.includes(item)) : [...new Set([...value, ...denied])]);
    }} />;
  }
  function rows(items: AdminMenuNode[], depth = 0, showChildren = true): React.ReactNode {
    return items.map(item => {
      const children = isMenuLeaf(item) ? [item.path] : paths(item.children);
      return <Fragment key={isMenuLeaf(item) ? item.path : item.label}>
        <tr><th scope="row" style={{ paddingLeft: `${1 + depth * 1.25}rem` }}>{item.label}</th><td>{toggle(item.label, children)}</td>{roleActions.map(action => <td key={action}>{actionToggle(item.label, children, action)}</td>)}<td><input type="checkbox" aria-label={`All ${item.label}`} checked={allRoleOptionsSelected(value, children)} onChange={event => onChange(setAllRoleOptions(value, children, event.target.checked))} /></td></tr>
        {showChildren && !isMenuLeaf(item) && rows(item.children, depth + 1)}
      </Fragment>;
    });
  }
  const groups = adminMenu;
  return <div className="roles-permission-grid role-menu-tree">
    {groups.map(group => {
      const children = group.children ?? (group.path ? [{ label: group.label, path: group.path }] : []);
      return <section className="cms-section-card" key={group.id}>
        <div className="roles-matrix-heading"><h3>{group.label}</h3><p>Sidebar menus and pages in this group.</p></div>
        <div className="cms-table-overflow"><table className="roles-permission-table"><thead><tr><th>Module</th><th>View</th><th>Add</th><th>Edit</th><th>Delete</th><th>Export</th><th>All</th></tr></thead><tbody>{rows(children, 0, group.id !== 'pages')}</tbody></table></div>
      </section>;
    })}
  </div>;
}
