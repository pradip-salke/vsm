import { getAllAdminMenuLinks } from './navigation';

type Permission = { id: number; code: string; description: string | null };

const rows: { label: string; view?: string; modify?: string; export?: string; publish?: string; manage?: string }[] = [
  { label: 'Dashboard', view: 'dashboard.read' },
  { label: 'Website content (all pages)', view: 'pages.read', modify: 'pages.write', publish: 'pages.publish' },
  { label: 'Enquiries', view: 'enquiries.read', export: 'enquiries.export' },
  { label: 'Users and roles (super admin only)', manage: 'users.manage' },
  { label: 'Settings', manage: 'settings.manage' },
];
const known = new Set(rows.flatMap(row => Object.values(row).slice(1)));
const websitePages = getAllAdminMenuLinks().filter(item => item.path.startsWith('/website/') || item.path.startsWith('/masters/'));

export function RolePermissionTable({ permissions, selected, onChange }: { permissions: Permission[]; selected: number[]; onChange: (ids: number[]) => void }) {
  function control(code?: string) {
    const permission = permissions.find(item => item.code === code);
    if (!permission) return '—';
    return <input type="checkbox" aria-label={permission.code} checked={selected.includes(permission.id)} onChange={event => onChange(event.target.checked ? [...selected, permission.id] : selected.filter(id => id !== permission.id))} />;
  }
  const extra = permissions.filter(permission => !known.has(permission.code));
  return <div className="roles-permission-table-wrap">
    <p>Website page rows reflect the shared website permissions above them. Separate page permissions are not yet available.</p>
    <div className="cms-table-overflow"><table className="roles-permission-table"><thead><tr><th>Module</th><th>View</th><th colSpan={3}>Add / Edit / Delete</th><th>Export</th><th>Publish</th><th>Manage</th></tr></thead><tbody>
      {rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{control(row.view)}</td><td colSpan={3}>{control(row.modify)}</td><td>{control(row.export)}</td><td>{control(row.publish)}</td><td>{control(row.manage)}</td></tr>)}
      {websitePages.map(page => <tr className="roles-page-permission" key={page.path}><th scope="row">{page.label}<small>{page.path}</small></th><td>{selected.includes(permissions.find(item => item.code === 'pages.read')?.id ?? -1) ? 'Included' : '—'}</td><td colSpan={3}>{selected.includes(permissions.find(item => item.code === 'pages.write')?.id ?? -1) ? 'Included' : '—'}</td><td>—</td><td>{selected.includes(permissions.find(item => item.code === 'pages.publish')?.id ?? -1) ? 'Included' : '—'}</td><td>—</td></tr>)}
    </tbody></table></div>
    {extra.length > 0 && <fieldset className="roles-permission-row"><legend>Other permissions</legend>{extra.map(permission => <label key={permission.id}>{control(permission.code)} {permission.description || permission.code}</label>)}</fieldset>}
  </div>;
}
