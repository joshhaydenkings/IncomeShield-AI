type PageHeaderProps = {
  badge?: string;
  title: string;
  actions?: React.ReactNode;
};

function PageHeader({ badge, title, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
        {badge ? (
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300">
            {badge}
          </div>
        ) : null}

        <h1 className="text-5xl font-bold tracking-tight text-white">{title}</h1>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

export default PageHeader;