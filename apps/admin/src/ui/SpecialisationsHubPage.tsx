import { Link } from 'react-router-dom';
import { academicsSpecialisationIndex } from '@vsmedu/contracts/academics-specialisations';
import { specialisationPagePath } from './cmsPaths';

const WEB_BASE = import.meta.env.VITE_WEB_BASE_URL ?? 'http://localhost:3000';
const SITE_PREFIX = '/our-academics/in-demand-specialisations/';

export function SpecialisationsHubPage() {
  return (
    <div className="cms-editor">
      <header className="page-heading">
        <div>
          <nav className="cms-breadcrumbs" aria-label="Breadcrumb">
            <span>Website Pages</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span>Our Academics</span>
            <span className="cms-breadcrumb-sep">/</span>
            <span className="cms-breadcrumb-current">Specialisations Overview</span>
          </nav>
          <h1>In-demand PGDM specialisations</h1>
          <p className="page-description">
            Each row opens the same section editor pattern as the AICTE PGDM page: page banner (slider), then all in-page sections including FAQ.
          </p>
        </div>
      </header>

      <div className="cms-table-card">
        <div className="cms-table-overflow">
          <table className="cms-slides-table">
            <thead>
              <tr>
                <th scope="col">Programme</th>
                <th scope="col">Page sections</th>
                <th scope="col">Banner (slider)</th>
                <th scope="col">Live URL</th>
              </tr>
            </thead>
            <tbody>
              {academicsSpecialisationIndex.map(({ slug, navTitle }) => {
                const base = specialisationPagePath(slug);
                const live = `${WEB_BASE}${SITE_PREFIX}${slug}/`;
                return (
                  <tr key={slug}>
                    <td>
                      <strong>{navTitle}</strong>
                      <div className="cms-muted-text" style={{ marginTop: 4 }}>
                        <code>{slug}</code>
                      </div>
                    </td>
                    <td>
                      <Link to={base} className="cms-master-link-btn">
                        Edit page sections →
                      </Link>
                    </td>
                    <td>
                      <Link to={`${base}/hero`} className="cms-master-link-btn">
                        Page Banner →
                      </Link>
                    </td>
                    <td>
                      <a href={live} target="_blank" rel="noopener noreferrer" className="cms-primary">
                        View ↗
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
