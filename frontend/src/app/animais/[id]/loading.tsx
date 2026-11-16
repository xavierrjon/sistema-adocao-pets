export default function LoadingAnimalDetails() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse px-4 py-10 sm:px-6 lg:px-8" aria-hidden="true">
      <div className="h-4 w-20 rounded-full bg-slate-200" />
      <div className="mt-6 aspect-[16/9] w-full rounded-3xl bg-slate-200" />
      <div className="mt-8 space-y-3">
        <div className="h-9 w-1/3 rounded-full bg-slate-200" />
        <div className="h-5 w-1/4 rounded-full bg-slate-200" />
        <div className="h-6 w-40 rounded-full bg-slate-200" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-16 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-7 w-1/3 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-200" />
        <div className="h-4 w-5/6 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
