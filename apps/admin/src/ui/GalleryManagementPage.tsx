import { NavLink, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { SliderMaster } from './SliderMaster';
import './gallery-management.css';

/** Consolidated gallery workspace. The two legacy collections stay separately tabbed. */
export function GalleryManagementPage({ canEdit }: { canEdit: boolean }) {
  const location = useLocation();
  const albums = location.pathname.includes('/albums');
  return <>
    <nav className="cms-gallery-tabs" aria-label="Gallery management sections">
      <NavLink to="/masters/gallery/life" className={!albums ? 'is-active' : undefined}>Life @ VSM Gallery</NavLink>
      <NavLink to="/masters/gallery/albums" className={albums ? 'is-active' : undefined}>Gallery Albums</NavLink>
    </nav>
    <Routes>
      <Route index element={<Navigate to="life" replace />} />
      <Route path="life" element={<SliderMaster master="gallery-items" scope="gallery" canEdit={canEdit} />} />
      <Route path="life/new" element={<SliderMaster master="gallery-items" scope="gallery" canEdit={canEdit} />} />
      <Route path="life/:slidePos/edit" element={<SliderMaster master="gallery-items" scope="gallery" canEdit={canEdit} />} />
      <Route path="albums" element={<SliderMaster master="gallery-albums" scope="gallery" canEdit={canEdit} />} />
      <Route path="albums/new" element={<SliderMaster master="gallery-albums" scope="gallery" canEdit={canEdit} />} />
      <Route path="albums/:slidePos/edit" element={<SliderMaster master="gallery-albums" scope="gallery" canEdit={canEdit} />} />
    </Routes>
  </>;
}
