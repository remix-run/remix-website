import React from "react";

export function DescriptionList({ title, children }) {
  return (
    <div className="mt-12 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <dl>{children}</dl>
    </div>
  );
}

export function DescriptionListItem({
  label,
  value,
  actions,
  first = false,
}: {
  label: string;
  value: React.ReactNode;
  actions?: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={`mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 ${
        first ? "" : "sm:border-t sm:border-gray-200"
      } sm:px-6 sm:py-5`}
    >
      <dt className="text-sm leading-5 font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
        {actions ? (
          <div className="flex justify-between text-sm leading-5">
            <div className="w-0 flex-1 flex items-center">{value}</div>
            <div className="ml-4 flex-shrink-0">{actions}</div>
          </div>
        ) : (
          <div className="text-sm leading-5">{value}</div>
        )}
      </dd>
    </div>
  );
}
