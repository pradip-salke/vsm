import { Route, Routes, Navigate } from 'react-router-dom';
import { SliderMaster } from './SliderMaster';
import './gallery-management.css';

/** Consolidated gallery workspace. The two legacy collections stay separately tabbed. */
export function GalleryManagementPage({ canEdit }: { canEdit: boolean }) {
  return <>
    <Routes>
      <Route index element={<Navigate to="life" replace />} />
      <Route path="life" element={<SliderMaster master="gallery-items" scope="gallery" canEdit={canEdit} />} />
      <Route path="life/new" element={<SliderMaster master="gallery-items" scope="gallery" canEdit={canEdit} />} />
      <Route path="life/:slidePos/edit" element={<SliderMaster master="gallery-items" scope="gallery" canEdit={canEdit} />} />
      <Route path="albums/*" element={<Navigate to="/masters/gallery/life" replace />} />
    </Routes>
  </>;
}
