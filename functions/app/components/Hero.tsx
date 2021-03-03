import Logo, { useLogoAnimation } from "./Logo";

export default function Hero({
  title,
  children,
}: {
  title?: React.ReactNode;
  children?: React.ReactNode;
}) {
  let [colors, changeColors] = useLogoAnimation();
  return (
    <div className="pt-12 sm:pt-16">
      <div className="max-w-screen-xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-2 lg:max-w-none">
          <div className="max-w-md mx-auto" onMouseMove={changeColors}>
            <Logo colors={colors} className="w-full" />
          </div>
          {title && (
            <div className="text-3xl leading-9 font-extrabold text-white sm:text-4xl sm:leading-10 lg:text-5xl lg:leading-none">
              {title}
            </div>
          )}
          {children && (
            <div className="text-xl max-w-4xl m-auto leading-7 text-gray-300">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
