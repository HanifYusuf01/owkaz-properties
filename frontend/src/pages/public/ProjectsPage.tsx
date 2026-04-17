import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useGetProjectsQuery, Project } from '../../features/projects/projectsApi';
import { formatPrice } from '../../utils/format';
import { ProjectDetailModal } from '../../components/property/ProjectDetailModal';

const STATUS_STYLES: Record<string, string> = {
  ongoing: 'bg-teal/20 text-teal border-teal/30',
  completed: 'bg-green-500/20 text-green-700 border-green-300',
  'pre-launch': 'bg-purple-500/20 text-purple-700 border-purple-300',
  'selling-fast': 'bg-gold/20 text-gold border-gold/30',
  'new-launch': 'bg-teal/20 text-teal border-teal/30',
};

const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  'pre-launch': 'Pre-Launch',
  'selling-fast': 'Selling Fast',
  'new-launch': 'New Launch',
};

const CARD_GRADS = [
  'from-navy to-teal',
  'from-teal to-teal-light',
  'from-navy-mid to-navy',
  'from-teal to-navy',
  'from-navy to-navy-mid',
  'from-teal-light to-teal',
];

const STATS = [
  { num: '18', label: 'Active Projects' },
  { num: '2,400+', label: 'Units Delivered' },
  { num: '6', label: 'States Covered' },
  { num: '₦50B+', label: 'Total Value' },
];

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useGetProjectsQuery({ search: search || undefined });

  return (
    <div>
      {/* Hero */}
      <div className="bg-navy py-16 sm:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-light">Our Developments</span>
          <h1 className="font-display text-4xl sm:text-5xl text-white mt-3 leading-tight">
            Premium Property<br />Projects Across Nigeria
          </h1>
          <p className="text-white/60 text-base sm:text-lg mt-4 max-w-xl leading-relaxed">
            From gated estates in Abuja to luxury apartments in Lagos — Owkaz curates and markets Nigeria's finest residential and commercial developments.
          </p>
          <div className="flex flex-wrap gap-8 mt-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl text-gold">{s.num}</div>
                <div className="text-white/50 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal">All Projects</span>
            <h2 className="font-display text-2xl sm:text-3xl text-navy mt-1">Current & Upcoming Developments</h2>
          </div>
          <div className="flex gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                className="pl-8 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-teal transition-colors w-48"
              />
            </div>
            <button
              onClick={() => navigate('/contact')}
              className="px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-mid transition-colors flex-shrink-0"
            >
              Enquire
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-surface" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface rounded w-3/4" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-3">🏗️</div>
            <h3 className="font-semibold text-navy text-lg">No projects found</h3>
            <p className="text-sm text-muted mt-1">
              {search ? 'Try a different search term.' : 'Check back soon — new developments are coming.'}
            </p>
            {search && (
              <button onClick={() => { setSearch(''); setSearchInput(''); }} className="mt-4 px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                {/* Image / gradient */}
                <div className={`h-48 bg-gradient-to-br ${CARD_GRADS[idx % CARD_GRADS.length]} relative overflow-hidden`}>
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                  )}
                  {/* Status badge */}
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLES[project.status] ?? 'bg-surface text-muted border-border'}`}>
                    {STATUS_LABELS[project.status] ?? project.status}
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div className="h-full bg-gold transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-teal mb-1">{project.type}</div>
                  <h3 className="font-display text-lg text-navy leading-tight mb-1">{project.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted mb-4">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {project.location}, {project.state}
                  </div>

                  {/* Progress label */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-muted mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-navy">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  {/* Price + View button */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-muted">
                        {project.priceTo ? 'Price Range' : 'Starting Price'}
                      </div>
                      <div className="font-display text-base text-navy mt-0.5">
                        {project.priceFrom
                          ? formatPrice(project.priceFrom)
                          : 'Contact us'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy-mid transition-colors flex-shrink-0"
                    >
                      View
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Developer CTA */}
      <section className="py-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy rounded-3xl px-8 py-12 sm:px-14 sm:py-16 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-light">List Your Development</span>
                <h2 className="font-display text-3xl sm:text-4xl text-white mt-2 mb-3">
                  Are You a Developer<br />or Estate Builder?
                </h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Partner with Owkaz to market and sell your residential or commercial development projects. Reach thousands of serious buyers across Nigeria and the diaspora.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <button
                  onClick={() => navigate('/contact')}
                  className="px-6 py-3 rounded-xl bg-gold text-white font-semibold text-sm hover:bg-gold-light transition-colors"
                >
                  Partner With Us
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  List a Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};
