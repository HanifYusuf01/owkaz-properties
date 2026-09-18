interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalPageLayoutProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

const LAST_UPDATED = 'September 2026';

export const LegalPageLayout = ({ title, intro, sections }: LegalPageLayoutProps) => (
  <div>
    <div className="bg-navy py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl sm:text-4xl text-white">{title}</h1>
        <p className="text-white/50 text-sm mt-2">Last updated: {LAST_UPDATED}</p>
      </div>
    </div>

    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-muted leading-relaxed mb-10">{intro}</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-display text-xl text-navy mb-3">{section.heading}</h2>
            <div className="space-y-3">
              {section.body.map((para, i) => (
                <p key={i} className="text-sm text-muted leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
