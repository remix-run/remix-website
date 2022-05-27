export function InnerLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="my-8 md:my-12 xl:my-14">
      <div className="container">{children}</div>
    </div>
  );
}
